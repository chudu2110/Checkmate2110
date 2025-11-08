'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Chess } from 'chess.js';
import type { Puzzle, Hint } from '@/lib/types';
import { puzzles } from '@/lib/puzzles';

import ChessBoard from './chess-board';
import ControlPanel from './control-panel';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from './ui/skeleton';

type GameStatus = 'playing' | 'won' | 'lost';

const ChessTrainer = () => {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [fenToDisplay, setFenToDisplay] = useState<string>('start');
  const [game, setGame] = useState<Chess | null>(null);
  const [userMoves, setUserMoves] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [hint, setHint] = useState<Hint>(null);
  const [isHintDialogOpen, setIsHintDialogOpen] = useState(false);
  const { toast } = useToast();
  const [mateInFilter, setMateInFilter] = useState<number | 'all'>('all');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [sanUserMoves, setSanUserMoves] = useState<string[]>([]);
  const [sanBotMoves, setSanBotMoves] = useState<string[]>([]);
  const [highlightSquares, setHighlightSquares] = useState<Record<string, React.CSSProperties>>({});
  const [playedCount, setPlayedCount] = useState(0); // number of solution half-moves already played
  const [inputError, setInputError] = useState<string | null>(null);
  const puzzleNumber = useMemo(() => {
    const idx = puzzles.findIndex((p) => p.id === (puzzle?.id ?? ''));
    return idx >= 0 ? idx + 1 : 1;
  }, [puzzle]);

  const whiteMovesCount = useMemo(() => puzzle ? Math.ceil(puzzle.solution.length / 2) : 0, [puzzle]);

  const updateMoveHistory = useCallback(() => {
    if (!puzzle) return;
    const simGame = new Chess(puzzle.fen);
    const history = [puzzle.fen];
    const userSans: string[] = [];
    const botSans: string[] = [];
    setInputError(null);
    
    // Combine user moves and solution moves
    for (let i = 0; i < whiteMovesCount; i++) {
        const userMove = userMoves[i];
        if (userMove && userMove.trim() !== '') {
            try {
                const raw = userMove.trim();
                if (!isStrictSan(raw)) {
                  setInputError('Only standard SAN notation accepted (e.g.: Rf4+, Qxe6#, O-O, exd8=Q).');
                  break;
                }
                const moveResult = simGame.move(raw, { strict: true });
                if (!moveResult) {
                  setInputError(`Move "${userMove}" at step ${i + 1} is invalid.`);
                  break;
                }
                if (moveResult.san !== raw) {
                  setInputError(`Notation must match exact SAN: expected "${moveResult.san}".`);
                  break;
                }
                userSans.push(moveResult.san);
                history.push(simGame.fen());
                
                const blackMoveIndex = i * 2 + 1;
                if (blackMoveIndex < puzzle.solution.length) {
                   const blackMove = puzzle.solution[blackMoveIndex];
                   const blackMoveResult = typeof blackMove === 'string'
                     ? (() => { const b = parseMoveStr(blackMove); return simGame.move({ from: b.source, to: b.target, promotion: b.promotion }); })()
                     : simGame.move(blackMove as any);
                   if(!blackMoveResult) break;
                   botSans.push(blackMoveResult.san);
                   history.push(simGame.fen());
                }
            } catch (e) {
                setInputError(`Move "${userMove}" at step ${i + 1} is invalid.`);
                break;
            }
        } else {
            break;
        }
    }
    setMoveHistory(history);
    setSanUserMoves(userSans);
    setSanBotMoves(botSans);
    // When user enters moves, automatically display the corresponding final position
    setCurrentMoveIndex(history.length - 1);
    setFenToDisplay(history[history.length - 1]);
  }, [puzzle, userMoves, whiteMovesCount]);

  const loadNewPuzzle = useCallback(() => {
    const filteredPuzzles = mateInFilter === 'all' 
        ? puzzles 
        : puzzles.filter(p => p.mateIn === mateInFilter);

    if (filteredPuzzles.length === 0) {
        toast({ title: "No Puzzles Found", description: `No puzzles available for "Mate in ${mateInFilter}". Showing all puzzles.`, variant: "destructive" });
        setMateInFilter('all');
        const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
        setPuzzle(randomPuzzle);
    } else {
        const randomPuzzle = filteredPuzzles[Math.floor(Math.random() * filteredPuzzles.length)];
        setPuzzle(randomPuzzle);
    }
  }, [mateInFilter, toast]);

  useEffect(() => {
    loadNewPuzzle();
  }, [loadNewPuzzle]);
  
  useEffect(() => {
    if (puzzle) {
        const newGame = new Chess(puzzle.fen);
        setGame(newGame);
        setFenToDisplay(puzzle.fen);
        setUserMoves(Array(whiteMovesCount).fill(''));
        setGameStatus('playing');
        setHint(null);
        setIsHintDialogOpen(false);
        setMoveHistory([puzzle.fen]);
        setCurrentMoveIndex(0);
        setSanUserMoves([]);
        setSanBotMoves([]);
        setHighlightSquares({});
        setPlayedCount(0);
        setInputError(null);
    }
  }, [puzzle, whiteMovesCount]);

  useEffect(() => {
      if (moveHistory[currentMoveIndex]) {
        setFenToDisplay(moveHistory[currentMoveIndex]);
        // Sync game state with current position for proper board interaction
        const newGame = new Chess(moveHistory[currentMoveIndex]);
        setGame(newGame);
      }
  }, [currentMoveIndex, moveHistory]);

  // Keep playedCount in sync with the current position in the history
  useEffect(() => {
    setPlayedCount(currentMoveIndex);
  }, [currentMoveIndex]);

  useEffect(() => {
    updateMoveHistory();
  }, [userMoves, updateMoveHistory]);


  const handleUserMove = (index: number, move: string) => {
    const newMoves = [...userMoves];
    newMoves[index] = move;
    setUserMoves(newMoves);
  };
  const handleUserMoveSubmit = (move: string) => {
    // Determine target index respecting replay position
    let targetIdx: number;
    if (currentMoveIndex < moveHistory.length - 1) {
      // When replaying, map current history index to the next user's half-move (even index)
      const nextHalfMoveIdx = currentMoveIndex % 2 === 0 ? currentMoveIndex : currentMoveIndex + 1;
      targetIdx = Math.floor(nextHalfMoveIdx / 2);
    } else {
      // Otherwise, append into next empty slot
      const nextIndex = userMoves.findIndex((m) => m.trim() === '');
      targetIdx = nextIndex === -1 ? userMoves.length : nextIndex;
    }
    const newMoves = [...userMoves];
    if (targetIdx < whiteMovesCount) {
      newMoves[targetIdx] = move;
      setUserMoves(newMoves);
      // Automatically check and update SAN after entering move
      setTimeout(() => {
        handlePlay();
      }, 0);
    }
  };
  
  const handlePlay = () => {
    if (!puzzle) return;
    // Recompute history and SAN immediately from current inputs
    const simGame = new Chess(puzzle.fen);
    const history = [puzzle.fen];
    const userSans: string[] = [];
    const botSans: string[] = [];
    const filledUserMoves = userMoves.filter(m => m.trim() !== '');
    const isFinalUserMove = filledUserMoves.length === whiteMovesCount;

    let isValid = true;
    setInputError(null);
    for (let i = 0; i < filledUserMoves.length; i++) {
      try {
        const raw = filledUserMoves[i].trim();
        if (!isStrictSan(raw)) {
          throw new Error('Only standard SAN notation accepted (e.g.: Rf4+, Qxe6#, O-O, exd8=Q).');
        }
        const whiteMoveResult = simGame.move(raw, { strict: true });   
        if (!whiteMoveResult) { throw new Error(`Invalid move: ${filledUserMoves[i]}`); }
        if (whiteMoveResult.san !== raw) {
          throw new Error(`Notation must match exact SAN: expected "${whiteMoveResult.san}".`);
        }
        userSans.push(whiteMoveResult.san);
        history.push(simGame.fen());

        const blackIdx = i * 2 + 1;
        if (blackIdx < puzzle.solution.length) {
          const mv = puzzle.solution[blackIdx];
          const blackRes = typeof mv === 'string'
            ? (() => { const b = parseMoveStr(mv); return simGame.move({ from: b.source, to: b.target, promotion: b.promotion }); })()
            : simGame.move(mv as any);
          if (!blackRes) { throw new Error(`Invalid black move at index ${blackIdx}`); }
          botSans.push(blackRes.san);
          history.push(simGame.fen());
        }
      } catch (e: any) {
        const msg = e?.message ? e.message : `Move "${filledUserMoves[i]}" at step ${i + 1} is invalid.`;
        setInputError(msg);
        isValid = false;
        break;
      }
    }

    if (!isValid) return;

    setSanUserMoves(userSans);
    setSanBotMoves(botSans);
    setMoveHistory(history);
    setCurrentMoveIndex(history.length - 1);
    setFenToDisplay(history[history.length - 1]);

    if (isFinalUserMove) {
      if (simGame.isCheckmate()) {
        setGameStatus('won');
      } else {
        setGameStatus('lost');
      }
    }
  };
  
  const handleSolve = () => {
    if (!puzzle) return;
    // Play full solution on the board (user + bot), log SAN
    const simGame = new Chess(puzzle.fen);
    const history = [puzzle.fen];
    const newUserSans: string[] = [];
    const newBotSans: string[] = [];
    puzzle.solution.forEach((mv, idx) => {
      const res = simGame.move(mv as any);
      if (res) {
        if (idx % 2 === 0) newUserSans.push(res.san); else newBotSans.push(res.san);
        history.push(simGame.fen());
      }
    });
    setSanUserMoves(newUserSans);
    setSanBotMoves(newBotSans);
    setMoveHistory(history);
    setCurrentMoveIndex(history.length - 1);
    setFenToDisplay(history[history.length - 1]);
    setGameStatus('won');
    setPlayedCount(puzzle.solution.length);
    setHighlightSquares({});
    setGame(new Chess(history[history.length - 1]));
    // Remove popup; board and SAN already reflect the solution
  };
  
  const navigateMoves = (direction: 'first' | 'prev' | 'next' | 'last') => {
      if (moveHistory.length <= 1) {
        if (direction === 'first' || direction === 'last') {
          setCurrentMoveIndex(0);
        }
        return;
      }
      
      let newIndex = currentMoveIndex;
      
      switch(direction) {
          case 'first':
              newIndex = 0;
              break;
          case 'prev':
              newIndex = Math.max(0, currentMoveIndex - 1);
              break;
          case 'next':
              newIndex = Math.min(moveHistory.length - 1, currentMoveIndex + 1);
              break;
          case 'last':
              newIndex = moveHistory.length - 1;
              break;
      }
      
      setCurrentMoveIndex(newIndex);
      setHighlightSquares({});
      
      // Sync game state with the current position
      if (moveHistory[newIndex]) {
          const newGame = new Chess(moveHistory[newIndex]);
          setGame(newGame);
      }
  };


  const getHintFromSolution = (): Hint => {
    if (!puzzle) return null;
    // Determine next hint index based on gameplay progress, not text inputs
    // Use currentMoveIndex when replaying; otherwise rely on playedCount
    const baseIndex = currentMoveIndex < moveHistory.length - 1
      ? currentMoveIndex
      : playedCount;
    // Hint should point to the next user's move (even indices: 0,2,4,...)
    const nextMoveIndex = baseIndex % 2 === 0 ? baseIndex : baseIndex + 1;

    if (nextMoveIndex < puzzle.solution.length) {
        const hintMove = puzzle.solution[nextMoveIndex];
        const formatted = typeof hintMove === 'string'
          ? hintMove
          : `${hintMove.from}-${hintMove.to}${hintMove.promotion ?? ''}`;
        return {
            hint: formatted,
            reasoning: `This move is part of the puzzle's solution. It puts pressure on the opponent and leads towards checkmate.`
        };
    }

    return { hint: "No more hints.", reasoning: "You seem to have completed the main line." };
  };

  const handleGetHint = () => {
    if (!puzzle) return;
    setHint(null); // Reset previous hint
    const result = getHintFromSolution();
    if (result) {
        setHint(result);
        // Highlight next user's move squares based on progress
        const baseIndex = currentMoveIndex < moveHistory.length - 1
          ? currentMoveIndex
          : playedCount;
        const nextIdx = baseIndex % 2 === 0 ? baseIndex : baseIndex + 1;
        
        const mv = puzzle.solution[nextIdx];
        if (mv && typeof mv !== 'string') {
          const style = { backgroundColor: 'rgba(255, 215, 0, 0.45)' };
          setHighlightSquares({ [mv.from]: style, [mv.to]: style });
        }
    }
  };

  // Parse "e7-e8q" style to parts
  const parseMoveStr = (move: string) => {
    const promotion = /[qrbn]$/.test(move) ? move.slice(-1) : undefined;
    const core = promotion ? move.slice(0, -1) : move;
    const [source, target] = core.split('-');
    return { source, target, promotion } as { source: string; target: string; promotion?: string };
  };

  // Strict SAN validation (no autocorrection)
  const isStrictSan = (m: string) => {
    const san = m.trim();
    // Castling
    if (/^(O-O|O-O-O)(\+|#)?$/.test(san)) return true;
    // Piece moves: Nf3, Rfd1, Qxe6+, Bb5#, Rd8=Q
    const pieceMove = /^(?:[KQRBN])(?:[a-h]|[1-8])?(?:x)?[a-h][1-8](?:=[QRBN])?(?:[+#])?$/;
    // Pawn moves: e4, exd5, e8=Q+, dxe8=Q#
    const pawnMove = /^(?:[a-h][1-8]|[a-h]x[a-h][1-8])(?:=[QRBN])?(?:[+#])?$/;
    return pieceMove.test(san) || pawnMove.test(san);
  };

  // Build solution list in old board format
  const solutionUci = useMemo(() => {
    if (!puzzle) return [] as string[];
    return puzzle.solution.map((mv) => {
      if (typeof mv === 'string') return mv; // already in SAN/loose string
      return `${mv.from}-${mv.to}${mv.promotion ?? ''}`;
    });
  }, [puzzle]);

  const onBoardDrop = useCallback((src: string, tgt: string) => {
    if (!game || !puzzle) return false;
    // If user is replaying past moves and attempts a new move,
    // prune future history so we can continue from the current position
    if (currentMoveIndex < moveHistory.length - 1) {
      const cutoffMoveHistory = moveHistory.slice(0, currentMoveIndex + 1);
      const cutoffUserSans = sanUserMoves.slice(0, Math.ceil(currentMoveIndex / 2));
      const cutoffBotSans = sanBotMoves.slice(0, Math.floor(currentMoveIndex / 2));
      setMoveHistory(cutoffMoveHistory);
      setSanUserMoves(cutoffUserSans);
      setSanBotMoves(cutoffBotSans);
      setPlayedCount(currentMoveIndex);
    }

    // If already checkmate, don't allow more moves
    if (game.isCheckmate()) return false;

    const nextMoveStr = solutionUci[playedCount];
    if (!nextMoveStr) return false;
    const expect = parseMoveStr(nextMoveStr);

    // If final half-move (user's last move), must result in checkmate
    const isFinalUserMove = playedCount === solutionUci.length - 1;
    const promotion = expect.promotion;

    if (isFinalUserMove) {
      const sim = new Chess(game.fen());
      const attempt = sim.move({ from: src, to: tgt, promotion });
      if (!attempt || !sim.isCheckmate()) {
        return false; // snapback
      }
      const res = game.move({ from: src, to: tgt, promotion });
      if (!res) return false;
      setSanUserMoves((prev) => [...prev, res.san]);
      const newFen = game.fen();
      setFenToDisplay(newFen);
      setMoveHistory((prev) => [...prev, newFen]);
      setCurrentMoveIndex((prev) => prev + 1);
      setPlayedCount((c) => c + 1);
      setGameStatus('won');
      setHighlightSquares({});
      return true;
    }

    // For intermediate moves, enforce exact source/target
    if (src !== expect.source || tgt !== expect.target) {
      return false; // snapback
    }

    const resUser = game.move({ from: expect.source, to: expect.target, promotion });
    if (!resUser) return false;
    setSanUserMoves((prev) => [...prev, resUser.san]);
    let newFen = game.fen();
    setFenToDisplay(newFen);
    setMoveHistory((prev) => [...prev, newFen]);
    setCurrentMoveIndex((prev) => prev + 1);
    setPlayedCount((c) => c + 1);
    setHighlightSquares({});

    // Bot reply after 500ms
    const botMoveStr = solutionUci[playedCount + 1];
    if (botMoveStr) {
      const bot = parseMoveStr(botMoveStr);
      setTimeout(() => {
        if (!game.isCheckmate()) {
          const resBot = game.move({ from: bot.source, to: bot.target, promotion: bot.promotion });
          if (resBot) {
            setSanBotMoves((prev) => [...prev, resBot.san]);
            newFen = game.fen();
            setFenToDisplay(newFen);
            setMoveHistory((prev) => [...prev, newFen]);
            setCurrentMoveIndex((prev) => prev + 1);
            setPlayedCount((c) => c + 1);
            if (game.isCheckmate()) {
              setGameStatus('won');
            }
          }
        }
      }, 500);
    }

    return true;
  }, [game, puzzle, playedCount, solutionUci, currentMoveIndex, moveHistory]);

  if (!puzzle) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <Skeleton className="w-full h-auto aspect-square max-w-[400px]"/>
            <p className="mt-4 text-muted-foreground">Loading puzzle...</p>
        </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="hidden dark:block">
        <h1 className="text-3xl lg:text-4xl font-headline font-bold text-center mb-2 text-primary">Mate Chess</h1>
        <p className="text-center text-muted-foreground mb-6 max-w-2xl mx-auto">A tool to help you practice chess puzzles. Enter your sequence of moves and see if you can find the checkmate.</p>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 lg:w-2/3">
            <div className="max-w-[700px] mx-auto w-full">
              <ChessBoard position={fenToDisplay} onPieceDrop={onBoardDrop} draggable={true} highlightSquares={highlightSquares} />
            </div>
        </div>
        <div className="md:w-1/2 lg:w-1/3">
            {(() => {
              const slicedUserSans = sanUserMoves.slice(0, Math.ceil(currentMoveIndex / 2));
              const slicedBotSans = sanBotMoves.slice(0, Math.floor(currentMoveIndex / 2));
              return (
              <ControlPanel
                puzzle={puzzle}
                userMoves={userMoves}
                sanUserMoves={slicedUserSans}
                sanBotMoves={slicedBotSans}
                onUserMoveSubmit={handleUserMoveSubmit}
                onPlay={handlePlay}
                onNewPuzzle={loadNewPuzzle}
                onGetHint={handleGetHint}
                onSolve={handleSolve}
                onNavigate={navigateMoves}
                gameStatus={gameStatus}
                whiteMovesCount={whiteMovesCount}
                currentMoveIndex={currentMoveIndex}
                totalMoves={moveHistory.length - 1}
                currentPuzzleNumber={puzzleNumber}
                inputError={inputError ?? undefined}
              />
              );
            })()}
        </div>
      </div>
    </div>
  );
};

export default ChessTrainer;

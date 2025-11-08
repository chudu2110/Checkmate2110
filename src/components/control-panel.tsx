'use client';

import { useState } from 'react';
import { Lightbulb, Play, RefreshCw, Wand2, SkipBack, Rewind, FastForward, SkipForward } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import type { Puzzle } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ControlPanelProps {
  puzzle: Puzzle;
  userMoves: string[];
  sanUserMoves: string[];
  sanBotMoves: string[];
  onUserMoveSubmit: (move: string) => void;
  onPlay: () => void;
  onNewPuzzle: () => void;
  onGetHint: () => void;
  onSolve: () => void;
  onNavigate: (direction: 'first' | 'prev' | 'next' | 'last') => void;
  gameStatus: 'playing' | 'won' | 'lost';
  whiteMovesCount: number;
  currentMoveIndex: number;
  totalMoves: number;
  currentPuzzleNumber: number;
  inputError?: string;
}

const ControlPanel = ({
  puzzle,
  userMoves,
  sanUserMoves,
  sanBotMoves,
  onUserMoveSubmit,
  onPlay,
  onNewPuzzle,
  onGetHint,
  onSolve,
  onNavigate,
  gameStatus,
  whiteMovesCount,
  currentMoveIndex,
  totalMoves,
  currentPuzzleNumber,
  inputError,
}: ControlPanelProps) => {
  const [moveInput, setMoveInput] = useState('');
  // SAN allowed characters (case-sensitive) at input level:
  // Pieces: K,Q,R,B,N ; Castling: O ; Files/ranks: a-h, 1-8 ; capture: x ; promote: = ; check/mate: +/# ; hyphen: -
  // Sanitize by removing disallowed chars to avoid blocking input.
  const sanitizeSanInput = (v: string) => v.replace(/[^KQRBNOa-h1-8x=+#-]/g, '');
  const handlePlayClick = () => {
    const m = moveInput.trim();
    if (m) {
      onUserMoveSubmit(m);
      setMoveInput('');
      // Đợi state userMoves cập nhật rồi mới chạy Play
      setTimeout(() => {
        onPlay();
      }, 0);
      return;
    }
    onPlay();
  };

  const isNavigationDisabled = (direction: 'first' | 'prev' | 'next' | 'last') => {
    if (moveHistory.length <= 1) return true;
    if (direction === 'first' || direction === 'prev') {
        return currentMoveIndex === 0;
    }
    if (direction === 'next' || direction === 'last') {
        return currentMoveIndex === totalMoves;
    }
    return false;
  };
  const moveHistory = Array.from({length: totalMoves + 1});

  return (
    <Card className="shadow-lg flex flex-col h-full backdrop-blur-sm bg-card/80">
      <CardHeader>
        <CardTitle className="font-headline text-primary">Checkmate in {puzzle.mateIn} moves - White to Move</CardTitle>
        <CardDescription>Current puzzle: {currentPuzzleNumber}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <div className="space-y-2">
          <Label className="font-bold text-foreground/80">Move Notation (SAN)</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold mb-2">You</p>
              <div className="border rounded-md p-2 h-40 overflow-auto bg-input">
                {sanUserMoves.map((m, i) => (
                  <p key={i} className="font-mono">{i + 1}. {m}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold mb-2">Bot</p>
              <div className="border rounded-md p-2 h-40 overflow-auto bg-input">
                {sanBotMoves.map((m, i) => (
                  <p key={i} className="font-mono">{i + 1}. {m}</p>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <Label className="font-bold text-foreground">Your moves:</Label>
            <Input
              placeholder=""
              value={moveInput}
              onChange={(e) => {
                const next = e.target.value;
                setMoveInput(sanitizeSanInput(next));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handlePlayClick();
                }
              }}
              className="font-mono bg-input"
              aria-label={`Your move`}
              disabled={gameStatus === 'won'}
            />
          </div>
          {inputError && (
            <p className="text-destructive text-sm mt-1">{inputError}</p>
          )}
        </div>

        {gameStatus === 'won' && (
          <Alert className="border-accent text-accent">
            <AlertTitle className="text-accent font-bold">You won!</AlertTitle>
            <AlertDescription>Excellent! You found the checkmate.</AlertDescription>
          </Alert>
        )}
        {gameStatus === 'lost' && (
          <Alert variant="destructive">
            <AlertTitle className="font-bold">Incorrect Solution</AlertTitle>
            <AlertDescription>That didn't lead to a checkmate. Try again.</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4 mt-auto">
        <TooltipProvider>
            <div className="flex justify-center items-center gap-1 w-full">
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={() => onNavigate('first')} variant="ghost" size="icon" disabled={isNavigationDisabled('first')}>
                            <SkipBack />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>First Move</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button onClick={() => onNavigate('prev')} variant="ghost" size="icon" disabled={isNavigationDisabled('prev')}>
                            <Rewind />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Previous Move</p></TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={handlePlayClick} className="bg-primary hover:bg-primary/90 rounded-full w-12 h-12" size="icon" disabled={gameStatus === 'won'}>
                            <Play className="w-6 h-6" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Check Solution</p></TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                         <Button onClick={() => onNavigate('next')} variant="ghost" size="icon" disabled={isNavigationDisabled('next')}>
                            <FastForward />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Next Move</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button onClick={() => onNavigate('last')} variant="ghost" size="icon" disabled={isNavigationDisabled('last')}>
                            <SkipForward />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Last Move</p></TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>

        <div className="grid grid-cols-2 gap-2 w-full">
             <Button onClick={onGetHint} variant="outline" className="w-full" disabled={gameStatus === 'won'}>
              <Lightbulb /> Hint
            </Button>
            <Button onClick={onNewPuzzle} variant="outline" className="w-full">
              <RefreshCw /> New Puzzle
            </Button>
        </div>
        <div className="flex w-full">
            <Button onClick={onSolve} variant="outline" className="w-full border-accent text-accent hover:bg-accent/10 hover:text-accent" disabled={gameStatus === 'won'}>
                <Wand2 /> Solve
            </Button>
        </div>
      </CardFooter>

    </Card>
  );
};

export default ControlPanel;

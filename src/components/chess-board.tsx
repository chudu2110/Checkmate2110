'use client';

import { Chessboard } from 'react-chessboard';
import { Card } from './ui/card';

interface ChessBoardProps {
  position: string;
  onPieceDrop?: (source: string, target: string, piece?: string) => boolean;
  highlightSquares?: Record<string, React.CSSProperties>;
  draggable?: boolean;
}

const ChessBoardComponent = ({ position, onPieceDrop, highlightSquares, draggable = true }: ChessBoardProps) => {
  return (
    <Card className="shadow-lg p-1 sm:p-2 bg-card border-4 border-primary/20 w-full" style={{ aspectRatio: '1 / 1' }}>
      <div className="w-full h-full">
        <Chessboard
            position={position}
            arePiecesDraggable={draggable}
            onPieceDrop={onPieceDrop}
            customSquareStyles={highlightSquares}
            customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
            }}
            customDarkSquareStyle={{ backgroundColor: 'hsl(var(--primary) / 0.6)' }}
            customLightSquareStyle={{ backgroundColor: 'hsl(var(--background))' }}
            customPieces={{
                wK: ({ squareWidth }) => <div style={{width: squareWidth, height: squareWidth, backgroundImage: "url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wk.png')", backgroundSize: 'contain'}} />,
                wQ: ({ squareWidth }) => <div style={{width: squareWidth, height: squareWidth, backgroundImage: "url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wq.png')", backgroundSize: 'contain'}} />,
                wR: ({ squareWidth }) => <div style={{width: squareWidth, height: squareWidth, backgroundImage: "url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wr.png')", backgroundSize: 'contain'}} />,
                wB: ({ squareWidth }) => <div style={{width: squareWidth, height: squareWidth, backgroundImage: "url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wb.png')", backgroundSize: 'contain'}} />,
                wN: ({ squareWidth }) => <div style={{width: squareWidth, height: squareWidth, backgroundImage: "url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wn.png')", backgroundSize: 'contain'}} />,
                wP: ({ squareWidth }) => <div style={{width: squareWidth, height: squareWidth, backgroundImage: "url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wp.png')", backgroundSize: 'contain'}} />,
                bK: ({ squareWidth }) => <div style={{width: squareWidth, height: squareWidth, backgroundImage: "url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bk.png')", backgroundSize: 'contain'}} />,
                bQ: ({ squareWidth }) => <div style={{width: squareWidth, height: squareWidth, backgroundImage: "url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bq.png')", backgroundSize: 'contain'}} />,
                bR: ({ squareWidth }) => <div style={{width: squareWidth, height: squareWidth, backgroundImage: "url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/br.png')", backgroundSize: 'contain'}} />,
                bB: ({ squareWidth }) => <div style={{width: squareWidth, height: squareWidth, backgroundImage: "url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bb.png')", backgroundSize: 'contain'}} />,
                bN: ({ squareWidth }) => <div style={{width: squareWidth, height: squareWidth, backgroundImage: "url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bn.png')", backgroundSize: 'contain'}} />,
                bP: ({ squareWidth }) => <div style={{width: squareWidth, height: squareWidth, backgroundImage: "url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bp.png')", backgroundSize: 'contain'}} />,
            }}
        />
      </div>
    </Card>
  );
};

export default ChessBoardComponent;

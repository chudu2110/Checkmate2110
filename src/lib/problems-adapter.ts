import type { Puzzle } from '@/lib/types';
import problemsData from '../../problems.json';

const wordToNumber = (type: string): number => {
  const lower = type.toLowerCase();
  if (lower.includes('mate in one')) return 1;
  if (lower.includes('mate in two')) return 2;
  if (lower.includes('mate in three')) return 3;
  if (lower.includes('mate in four')) return 4;
  if (lower.includes('mate in five')) return 5;
  const match = lower.match(/mate in (\d+)/);
  return match ? parseInt(match[1], 10) : 1;
};

type MoveObj = { from: string; to: string; promotion?: string };

const parseMove = (moveStr: string): MoveObj => {
  // Expected formats like "f6-g7", "f7-f8q" (promotion)
  const trimmed = moveStr.trim();
  const promotion = /[qrbn]$/.test(trimmed) ? trimmed.slice(-1) : undefined;
  const core = promotion ? trimmed.slice(0, -1) : trimmed;
  const [from, to] = core.split('-');
  return promotion ? { from, to, promotion } : { from, to };
};

export const puzzlesFromJson: Puzzle[] = (problemsData as any)?.problems?.map((p: any) => {
  const id = String(p?.problemid ?? p?.id ?? Math.random().toString(36).slice(2));
  const fen = String(p?.fen ?? '');
  const mateIn = wordToNumber(String(p?.type ?? 'Mate in One'));
  const description = String(p?.first ?? 'White to Move');
  const rawMoves: string = String(p?.moves ?? '').trim();
  const movesList = rawMoves.length > 0 ? rawMoves.split(';').map((m: string) => parseMove(m)) : [];

  return {
    id,
    fen,
    mateIn,
    description,
    solution: movesList,
  } as Puzzle;
}) ?? [];
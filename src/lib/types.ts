export type Puzzle = {
  id: string;
  fen: string;
  mateIn: number;
  description: string;
  solution: (string | { from: string; to: string; promotion?: string })[]; // Sequence of moves by white and black in the main line
};

export type Hint = {
  hint: string;
  reasoning: string;
} | null;

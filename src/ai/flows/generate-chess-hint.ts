'use server';

/**
 * @fileOverview A chess hint generation AI agent.
 *
 * - generateChessHint - A function that generates a chess hint for a given board state.
 * - GenerateChessHintInput - The input type for the generateChessHint function.
 * - GenerateChessHintOutput - The return type for the generateChessHint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChessHintInputSchema = z.object({
  boardState: z
    .string()
    .describe(
      'A string representing the current state of the chess board in FEN notation.'
    ),
});
export type GenerateChessHintInput = z.infer<typeof GenerateChessHintInputSchema>;

const GenerateChessHintOutputSchema = z.object({
  hint: z.string().describe('A helpful hint for the next best move in algebraic notation.'),
  reasoning: z.string().describe('The reasoning behind the suggested move.'),
});
export type GenerateChessHintOutput = z.infer<typeof GenerateChessHintOutputSchema>;

export async function generateChessHint(input: GenerateChessHintInput): Promise<GenerateChessHintOutput> {
  return generateChessHintFlow(input);
}

const chessHintPrompt = ai.definePrompt({
  name: 'chessHintPrompt',
  input: {schema: GenerateChessHintInputSchema},
  output: {schema: GenerateChessHintOutputSchema},
  prompt: `You are a grandmaster chess coach. Provide a hint for the best next move, in algebraic notation, given the current board state in FEN notation. Also explain the reasoning behind the move.

Board State (FEN): {{{boardState}}}

Respond in the following format:
{
  "hint": "[The move in algebraic notation]",
  "reasoning": "[Explanation of why this is a good move]"
}
`,
});

const generateChessHintFlow = ai.defineFlow(
  {
    name: 'generateChessHintFlow',
    inputSchema: GenerateChessHintInputSchema,
    outputSchema: GenerateChessHintOutputSchema,
  },
  async input => {
    const {output} = await chessHintPrompt(input);
    return output!;
  }
);

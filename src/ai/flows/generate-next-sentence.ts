'use server';

/**
 * @fileOverview A flow to generate the next sentence in a story based on a word, story so far, and mood.
 *
 * - generateNextSentence - A function that generates the next sentence of the story.
 * - GenerateNextSentenceInput - The input type for the generateNextSentence function.
 * - GenerateNextSentenceOutput - The return type for the generateNextSentence function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNextSentenceInputSchema = z.object({
  word: z.string().describe('The word to incorporate into the next sentence.'),
  storySoFar: z.string().describe('The story so far.'),
  mood: z.enum(['Dreamy', 'Dark', 'Motivational']).describe('The mood of the story.'),
});
export type GenerateNextSentenceInput = z.infer<typeof GenerateNextSentenceInputSchema>;

const GenerateNextSentenceOutputSchema = z.object({
  nextSentence: z.string().describe('The next sentence in the story.'),
});
export type GenerateNextSentenceOutput = z.infer<typeof GenerateNextSentenceOutputSchema>;

export async function generateNextSentence(input: GenerateNextSentenceInput): Promise<GenerateNextSentenceOutput> {
  return generateNextSentenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNextSentencePrompt',
  input: {schema: GenerateNextSentenceInputSchema},
  output: {schema: GenerateNextSentenceOutputSchema},
  prompt: `Continue the story based on the mood.\nStory so far: {{{storySoFar}}}\nNext word: {{{word}}}\nWrite a single poetic sentence using this word in a {{{mood}}} tone.`,
});

const generateNextSentenceFlow = ai.defineFlow(
  {
    name: 'generateNextSentenceFlow',
    inputSchema: GenerateNextSentenceInputSchema,
    outputSchema: GenerateNextSentenceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

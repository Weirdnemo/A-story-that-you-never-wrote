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
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: GenerateNextSentenceInputSchema},
  output: {schema: GenerateNextSentenceOutputSchema},
  prompt: `You are the Eternal Muse, a wise and ancient storyteller. Your voice is timeless and poetic.
A writer is collaborating with you. They have provided a single word to inspire the next sentence of an ongoing story.
Weave this word seamlessly into a new, single sentence that continues the narrative.
The story's current mood is '{{{mood}}}'. Maintain this atmosphere.

Story so far: {{{storySoFar}}}
The writer's chosen word is: '{{{word}}}'

Write only the next sentence, nothing more.`,
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

'use server';

/**
 * @fileOverview A flow to generate the next sentence in a story based on a word, story so far, and mood.
 *
 * - generateNextSentence - A function that generates the next sentence of the story.
 * - GenerateNextSentenceInput - The input type for the generateNextSentence function.
 * - GenerateNextSentenceOutput - The return type for the generateNextSentence function.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';

const GenerateNextSentenceInputSchema = z.object({
  word: z.string().describe('The word to incorporate into the next sentence.'),
  storySoFar: z.string().describe('The story so far.'),
  mood: z.enum(['Dreamy', 'Dark', 'Motivational']).describe('The mood of the story.'),
  apiKey: z.string().optional().describe('An optional Google AI API key.'),
});
export type GenerateNextSentenceInput = z.infer<typeof GenerateNextSentenceInputSchema>;

const GenerateNextSentenceOutputSchema = z.object({
  nextSentence: z.string().describe('The next sentence in the story.'),
});
export type GenerateNextSentenceOutput = z.infer<typeof GenerateNextSentenceOutputSchema>;

export async function generateNextSentence(input: GenerateNextSentenceInput): Promise<GenerateNextSentenceOutput> {
  return generateNextSentenceFlow(input);
}

const PromptInputSchema = GenerateNextSentenceInputSchema.omit({apiKey: true});

const prompt = ai.definePrompt({
  name: 'generateNextSentencePrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: PromptInputSchema},
  output: {schema: GenerateNextSentenceOutputSchema},
  prompt: `You are a masterful storyteller, a weaver of words that resonate with depth and emotion. Your prose is elegant, literary, and evocative.
A writer is collaborating with you, seeking a sentence to continue their narrative. They have provided a single, resonant word.
Your task is to craft a single, beautiful sentence that incorporates this word and seamlessly continues the story.
The current atmosphere of the story is '{{{mood}}}'. Your sentence must not only match but deepen this mood.
Avoid clichés and generic phrasing. Aim for originality and poetic flair.

Story so far: {{{storySoFar}}}
The writer's chosen word is: '{{{word}}}'

Write only the next sentence. Do not add any conversational text or explanation.`,
});

const generateNextSentenceFlow = ai.defineFlow(
  {
    name: 'generateNextSentenceFlow',
    inputSchema: GenerateNextSentenceInputSchema,
    outputSchema: GenerateNextSentenceOutputSchema,
  },
  async input => {
    const { apiKey, ...promptInput } = input;
    const overrides: { model?: any } = {};

    if (apiKey) {
      overrides.model = googleAI.model('gemini-1.5-flash-latest', { apiKey });
    }

    const {output} = await prompt(promptInput, overrides);
    return output!;
  }
);
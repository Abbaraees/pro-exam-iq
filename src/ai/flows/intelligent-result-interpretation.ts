'use server';

/**
 * @fileOverview Interprets exam results and provides personalized insights and suggestions for improvement.
 *
 * - interpretResults - A function that takes exam results and returns personalized insights and suggestions.
 * - InterpretResultsInput - The input type for the interpretResults function.
 * - InterpretResultsOutput - The return type for the interpretResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterpretResultsInputSchema = z.object({
  examName: z.string().describe('The name of the exam.'),
  testTakerName: z.string().describe('The name of the test taker.'),
  results: z.record(z.string(), z.number()).describe('A record of the exam results, where the key is the topic and the value is the score.'),
});
export type InterpretResultsInput = z.infer<typeof InterpretResultsInputSchema>;

const InterpretResultsOutputSchema = z.object({
  insights: z.string().describe('Personalized insights into the test taker\'s weak areas.'),
  suggestions: z.string().describe('Specific topics or courses to improve the test taker\'s performance.'),
});
export type InterpretResultsOutput = z.infer<typeof InterpretResultsOutputSchema>;

export async function interpretResults(input: InterpretResultsInput): Promise<InterpretResultsOutput> {
  return interpretResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interpretResultsPrompt',
  input: {schema: InterpretResultsInputSchema},
  output: {schema: InterpretResultsOutputSchema},
  prompt: `You are an AI tool that interprets exam results and provides personalized insights and suggestions for improvement.

  Exam Name: {{examName}}
  Test Taker Name: {{testTakerName}}
  Results: {{results}}

  Based on the exam results, provide personalized insights into the test taker\'s weak areas and suggest specific topics or courses to improve their performance.
  Format the output as follows:
  Insights: [insights]
  Suggestions: [suggestions]
  `,
});

const interpretResultsFlow = ai.defineFlow(
  {
    name: 'interpretResultsFlow',
    inputSchema: InterpretResultsInputSchema,
    outputSchema: InterpretResultsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

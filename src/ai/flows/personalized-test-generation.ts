'use server';

/**
 * @fileOverview Generates personalized tests based on learning objectives and difficulty levels.
 *
 * - generatePersonalizedTest - A function that generates a personalized test.
 * - PersonalizedTestInput - The input type for the generatePersonalizedTest function.
 * - PersonalizedTestOutput - The return type for the generatePersonalizedTest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedTestInputSchema = z.object({
  learningObjectives: z
    .string()
    .describe('The specific learning objectives for the test.'),
  difficultyLevel: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The desired difficulty level of the test.'),
  numberOfQuestions: z
    .number()
    .int()
    .positive()
    .describe('The number of questions to include in the test.'),
});
export type PersonalizedTestInput = z.infer<typeof PersonalizedTestInputSchema>;

const PersonalizedTestOutputSchema = z.object({
  testQuestions: z.array(
    z.object({
      question: z.string().describe('The text of the test question.'),
      options: z.array(z.string()).describe('The possible answer options.'),
      correctAnswer: z.string().describe('The correct answer to the question.'),
    })
  ).describe('An array of test questions, options, and correct answers.'),
});
export type PersonalizedTestOutput = z.infer<typeof PersonalizedTestOutputSchema>;

export async function generatePersonalizedTest(
  input: PersonalizedTestInput
): Promise<PersonalizedTestOutput> {
  return personalizedTestGenerationFlow(input);
}

const personalizedTestPrompt = ai.definePrompt({
  name: 'personalizedTestPrompt',
  input: {schema: PersonalizedTestInputSchema},
  output: {schema: PersonalizedTestOutputSchema},
  prompt: `You are a test generator that creates tests based on learning objectives and difficulty levels.

  Generate a test with the following specifications:
  Learning Objectives: {{{learningObjectives}}}
  Difficulty Level: {{{difficultyLevel}}}
  Number of Questions: {{{numberOfQuestions}}}

  Each question should have multiple choice options, and you must specify the correct answer for each question.
  The test should be returned as a JSON object with a 'testQuestions' array. Each object in the testQuestions array should have 'question', 'options' and 'correctAnswer' field.

  Make sure that only one of the options is the correct answer.

  The difficulty level should be appropriate to the difficultyLevel parameter.
  For the options, make sure that only one of the options is correct.

  For example, the output should look like this:
  {
    "testQuestions": [
      {
        "question": "What is the capital of France?",
        "options": ["Berlin", "Paris", "Madrid", "Rome"],
        "correctAnswer": "Paris"
      },
      {
        "question": "What is the highest mountain in the world?",
        "options": ["Mount Everest", "K2", "Kangchenjunga", "Lhotse"],
        "correctAnswer": "Mount Everest"
      }
    ]
  }
  `,
});

const personalizedTestGenerationFlow = ai.defineFlow(
  {
    name: 'personalizedTestGenerationFlow',
    inputSchema: PersonalizedTestInputSchema,
    outputSchema: PersonalizedTestOutputSchema,
  },
  async input => {
    const {output} = await personalizedTestPrompt(input);
    return output!;
  }
);

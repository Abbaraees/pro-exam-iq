'use server';

/**
 * @fileOverview A flow to verify if an image contains a face for login purposes.
 *
 * - verifyFace - A function that takes an image and checks for a face.
 * - FaceVerificationInput - The input type for the verifyFace function.
 * - FaceVerificationOutput - The return type for the verifyFace function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FaceVerificationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a user's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type FaceVerificationInput = z.infer<
  typeof FaceVerificationInputSchema
>;

const FaceVerificationOutputSchema = z.object({
  isFaceDetected: z
    .boolean()
    .describe('Whether or not a human face was detected in the image.'),
});
export type FaceVerificationOutput = z.infer<
  typeof FaceVerificationOutputSchema
>;

export async function verifyFace(
  input: FaceVerificationInput
): Promise<FaceVerificationOutput> {
  return faceVerificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'faceVerificationPrompt',
  input: { schema: FaceVerificationInputSchema },
  output: { schema: FaceVerificationOutputSchema },
  prompt: `You are a security expert system that verifies if an image contains a clear human face.
  Analyze the following image and determine if a human face is clearly visible.
  
  Photo: {{media url=photoDataUri}}
  
  Set the isFaceDetected output field to true if a face is detected, otherwise set it to false.`,
});

const faceVerificationFlow = ai.defineFlow(
  {
    name: 'faceVerificationFlow',
    inputSchema: FaceVerificationInputSchema,
    outputSchema: FaceVerificationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

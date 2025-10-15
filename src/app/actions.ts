'use server';

import {
  generatePersonalizedTest,
  PersonalizedTestInput,
} from '@/ai/flows/personalized-test-generation';
import {
  interpretResults,
  InterpretResultsInput,
} from '@/ai/flows/intelligent-result-interpretation';
import {
  verifyFace,
  FaceVerificationInput,
} from '@/ai/flows/face-verification';

export async function generateTest(input: PersonalizedTestInput) {
  try {
    const result = await generatePersonalizedTest(input);
    return result;
  } catch (error) {
    console.error('Error generating test:', error);
    return { testQuestions: [] };
  }
}

export async function getInterpretation(input: InterpretResultsInput) {
  try {
    const result = await interpretResults(input);
    return result;
  } catch (error) {
    console.error('Error getting interpretation:', error);
    return {
      insights: 'An error occurred while generating insights. Please try again later.',
      suggestions:
        'Could not generate suggestions due to an error.',
    };
  }
}

export async function checkFace(input: FaceVerificationInput) {
  try {
    const result = await verifyFace(input);
    return result;
  } catch (error) {
    console.error('Error verifying face:', error);
    return { isFaceDetected: false };
  }
}

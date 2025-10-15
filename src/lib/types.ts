import type { PersonalizedTestOutput } from '@/ai/flows/personalized-test-generation';
import type { Timestamp } from 'firebase/firestore';

export type TestQuestion = PersonalizedTestOutput['testQuestions'][0];

export interface TestSession {
  id: string;
  userId: string;
  testName: string;
  startTime: Timestamp;
  endTime: Timestamp;
  score: number;
}

export interface Answer {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    userAnswer: string;
    isCorrect: boolean;
}

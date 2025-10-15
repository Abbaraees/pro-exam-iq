'use client';

import { useState } from 'react';
import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { PersonalizedTestOutput } from '@/ai/flows/personalized-test-generation';
import TestSetup from '@/components/test/test-setup';
import InteractiveTest from '@/components/test/interactive-test';
import ResultsDisplay from '@/components/test/results-display';
import { generateTest } from '@/app/actions';
import type { PersonalizedTestInput } from '@/ai/flows/personalized-test-generation';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

type TestStep = 'setup' | 'taking' | 'results';

export default function TestPage() {
  const [step, setStep] = useState<TestStep>('setup');
  const [testData, setTestData] = useState<PersonalizedTestOutput | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [learningObjectives, setLearningObjectives] = useState('');
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const handleTestGeneration = async (data: PersonalizedTestInput) => {
    setIsLoading(true);
    setLearningObjectives(data.learningObjectives);
    const generatedTest = await generateTest(data);
    if (generatedTest && generatedTest.testQuestions.length > 0) {
      setTestData(generatedTest);
      setStep('taking');
    } else {
      toast({
        title: 'Test Generation Failed',
        description:
          "We couldn't generate a test. Please try different objectives.",
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleTestFinish = async (answers: Record<number, string>) => {
    setUserAnswers(answers);
    setStep('results');

    if (user && firestore && testData) {
      const testSessionsRef = collection(
        firestore,
        'users',
        user.uid,
        'testSessions'
      );
      
      let correctCount = 0;
      testData.testQuestions.forEach((q, index) => {
        if (answers[index] === q.correctAnswer) {
          correctCount++;
        }
      });
      const score = (correctCount / testData.testQuestions.length) * 100;

      const testSessionData = {
        userId: user.uid,
        testName: learningObjectives,
        startTime: serverTimestamp(),
        endTime: serverTimestamp(),
        score: score,
      };

      try {
        const testSessionRef = await addDoc(testSessionsRef, testSessionData);

        const answersRef = collection(testSessionRef, 'answers');
        
        for (let i = 0; i < testData.testQuestions.length; i++) {
          const question = testData.testQuestions[i];
          const userAnswer = answers[i];
          const isCorrect = userAnswer === question.correctAnswer;
          
          addDocumentNonBlocking(answersRef, {
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            userAnswer: userAnswer,
            isCorrect: isCorrect,
          });
        }
      } catch (error) {
        console.error("Error saving test session:", error);
        toast({
          title: "Couldn't save results",
          description: "Your test results could not be saved. Please try again.",
          variant: "destructive"
        })
      }
    }
  };

  const handleRetake = () => {
    setStep('setup');
    setTestData(null);
    setUserAnswers({});
    setLearningObjectives('');
  };

  const renderStep = () => {
    switch (step) {
      case 'setup':
        return (
          <TestSetup onGenerate={handleTestGeneration} isLoading={isLoading} />
        );
      case 'taking':
        return (
          testData && (
            <InteractiveTest
              testData={testData.testQuestions}
              onFinish={handleTestFinish}
            />
          )
        );
      case 'results':
        return (
          testData && (
            <ResultsDisplay
              testQuestions={testData.testQuestions}
              userAnswers={userAnswers}
              examName={learningObjectives}
              onRetake={handleRetake}
            />
          )
        );
      default:
        return (
          <TestSetup onGenerate={handleTestGeneration} isLoading={isLoading} />
        );
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {renderStep()}
    </div>
  );
}

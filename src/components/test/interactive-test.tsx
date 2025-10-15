'use client';

import { useState } from 'react';
import type { TestQuestion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

type InteractiveTestProps = {
  testData: TestQuestion[];
  onFinish: (answers: Record<number, string>) => void;
};

export default function InteractiveTest({
  testData,
  onFinish,
}: InteractiveTestProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const totalQuestions = testData.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const currentQuestion = testData[currentQuestionIndex];

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <p className="text-sm text-center text-muted-foreground mb-2">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </p>
        <Progress value={progress} className="w-full" />
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
          <CardDescription className="text-xl text-foreground pt-4 font-semibold">
            {currentQuestion.question}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestionIndex]}
            onValueChange={handleAnswerChange}
            className="space-y-4"
          >
            {currentQuestion.options.map((option, index) => (
              <Label
                key={index}
                className="flex items-center p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary has-[input:checked]:shadow-inner"
              >
                <RadioGroupItem
                  value={option}
                  id={`option-${index}`}
                  className="mr-4 h-5 w-5"
                />
                <span className="text-base">{option}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button onClick={handleNext} disabled={!answers[currentQuestionIndex]}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => onFinish(answers)}
              disabled={!answers[currentQuestionIndex]}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Finish Test
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

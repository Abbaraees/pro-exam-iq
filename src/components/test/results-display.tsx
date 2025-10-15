'use client';

import { useMemo, useState } from 'react';
import type { TestQuestion } from '@/lib/types';
import { getInterpretation } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Check, X, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';

type ResultsDisplayProps = {
  testQuestions: TestQuestion[];
  userAnswers: Record<number, string>;
  examName: string;
  onRetake: () => void;
};

export default function ResultsDisplay({
  testQuestions,
  userAnswers,
  examName,
  onRetake,
}: ResultsDisplayProps) {
  const [interpretation, setInterpretation] = useState<{
    insights: string;
    suggestions: string;
  } | null>(null);
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);

  const { score, correctAnswers, incorrectAnswers, totalQuestions } = useMemo(() => {
    let correct = 0;
    testQuestions.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return {
      score: correct,
      correctAnswers: correct,
      incorrectAnswers: testQuestions.length - correct,
      totalQuestions: testQuestions.length,
    };
  }, [testQuestions, userAnswers]);

  const scorePercentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

  const chartData = [
    { name: 'Correct', value: correctAnswers, fill: 'hsl(var(--chart-2))' },
    { name: 'Incorrect', value: incorrectAnswers, fill: 'hsl(var(--destructive))' },
  ];

  const chartConfig = {
    correct: { label: 'Correct', color: 'hsl(var(--chart-2))' },
    incorrect: { label: 'Incorrect', color: 'hsl(var(--destructive))' },
  }

  const handleGetInterpretation = async () => {
    setIsLoadingInterpretation(true);
    const result = await getInterpretation({
      examName,
      testTakerName: 'Test Taker', // Placeholder name
      results: { [examName]: scorePercentage },
    });
    setInterpretation(result);
    setIsLoadingInterpretation(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Test Results</CardTitle>
          <CardDescription>
            Here&apos;s how you performed on the &quot;{examName}&quot; assessment.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="h-[180px] w-[180px]">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={70} paddingAngle={5}>
                    {chartData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
            <p className="text-5xl font-bold tracking-tighter">{scorePercentage.toFixed(0)}%</p>
            <p className="text-xl text-muted-foreground">{score} / {totalQuestions} Correct</p>
          </div>
          <div className="flex flex-col justify-center space-y-4">
             <div className="flex items-center gap-4 text-lg">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]"/>
                <div><span className="font-bold">{correctAnswers}</span> Correct</div>
             </div>
             <div className="flex items-center gap-4 text-lg">
                <div className="w-3 h-3 rounded-full bg-destructive"/>
                <div><span className="font-bold">{incorrectAnswers}</span> Incorrect</div>
             </div>
             <Button onClick={onRetake} variant="outline" className="mt-6">
                <RefreshCw className="mr-2 h-4 w-4"/>
                Take Another Test
             </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary"><Sparkles />AI-Powered Feedback</CardTitle>
          <CardDescription>
            Get personalized insights and suggestions for improvement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!interpretation && (
             <Button onClick={handleGetInterpretation} disabled={isLoadingInterpretation}>
              {isLoadingInterpretation ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
              ) : (
                <>Generate My Feedback</>
              )}
            </Button>
          )}

          {interpretation && (
            <div className="space-y-4 animate-in fade-in-50">
              <Card className="bg-background/50">
                <CardHeader><CardTitle className="text-lg">Insights</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">{interpretation.insights}</p></CardContent>
              </Card>
              <Card className="bg-background/50">
                <CardHeader><CardTitle className="text-lg">Suggestions</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">{interpretation.suggestions}</p></CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Question Review</CardTitle>
          <CardDescription>Review each question and your answer.</CardDescription>
        </CardHeader>
        <CardContent>
           <Accordion type="single" collapsible className="w-full">
            {testQuestions.map((q, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className={cn("hover:no-underline font-semibold", !isCorrect && 'text-destructive')}>
                    <div className="flex items-center gap-3">
                       {isCorrect ? <Check className="text-[hsl(var(--chart-2))]" size={20} /> : <X size={20} />}
                       <span>Question {index + 1}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <p className="font-semibold text-lg">{q.question}</p>
                    <div className="space-y-2">
                        {q.options.map((option, optIndex) => {
                            const isUserAnswer = userAnswer === option;
                            const isCorrectAnswer = q.correctAnswer === option;
                            return (
                                <div key={optIndex} className={cn("p-3 border rounded-md text-sm",
                                    isCorrectAnswer && "bg-[hsl(var(--chart-2))]/10 border-[hsl(var(--chart-2))]/20 text-foreground",
                                    isUserAnswer && !isCorrectAnswer && "bg-destructive/10 border-destructive/20 text-foreground"
                                )}>
                                    <p>
                                        {option}
                                        {isCorrectAnswer && <span className="font-bold ml-2 text-[hsl(var(--chart-2))]">(Correct Answer)</span>}
                                        {isUserAnswer && !isCorrectAnswer && <span className="font-bold ml-2 text-destructive">(Your Answer)</span>}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

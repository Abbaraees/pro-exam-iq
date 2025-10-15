'use client';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { TestSession, Answer } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';

function formatTimestamp(timestamp: any) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
}

export default function SessionDetailsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const sessionDocRef = useMemoFirebase(() => {
    if (!user || !firestore || !sessionId) return null;
    return doc(firestore, 'users', user.uid, 'testSessions', sessionId);
  }, [user, firestore, sessionId]);

  const answersQuery = useMemoFirebase(() => {
    if (!sessionDocRef) return null;
    return collection(sessionDocRef, 'answers');
  }, [sessionDocRef]);

  const { data: session, isLoading: isLoadingSession } = useDoc<TestSession>(sessionDocRef);
  const { data: answers, isLoading: isLoadingAnswers } = useCollection<Answer>(answersQuery);

  const { correctAnswers, incorrectAnswers } = useMemo(() => {
    if (!answers) return { correctAnswers: 0, incorrectAnswers: 0 };
    const correct = answers.filter(a => a.isCorrect).length;
    return {
      correctAnswers: correct,
      incorrectAnswers: answers.length - correct,
    }
  }, [answers]);

  const chartData = [
    { name: 'Correct', value: correctAnswers, fill: 'hsl(var(--chart-2))' },
    { name: 'Incorrect', value: incorrectAnswers, fill: 'hsl(var(--destructive))' },
  ];

  const chartConfig = {
    correct: { label: 'Correct', color: 'hsl(var(--chart-2))' },
    incorrect: { label: 'Incorrect', color: 'hsl(var(--destructive))' },
  }

  if (isLoadingSession || isUserLoading) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
         <Skeleton className="h-8 w-1/2 mb-4" />
         <Skeleton className="h-4 w-1/3 mb-8" />
         <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold">Session not found</h1>
        <p className="text-muted-foreground">The test session you are looking for does not exist or you do not have permission to view it.</p>
        <Button asChild className="mt-4"><Link href="/history">Back to History</Link></Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-4xl space-y-8">
        <div>
            <Button asChild variant="outline" className="mb-4">
                <Link href="/history">Back to History</Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight text-primary">{session.testName}</h1>
            <p className="text-muted-foreground">Taken on {formatTimestamp(session.endTime)}</p>
        </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Results Summary</CardTitle>
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
            <p className="text-5xl font-bold tracking-tighter">{session.score.toFixed(0)}%</p>
            <p className="text-xl text-muted-foreground">{correctAnswers} / {(answers || []).length} Correct</p>
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
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Question Review</CardTitle>
          <CardDescription>Review each question and your answer.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoadingAnswers ? (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full"/>
                    <Skeleton className="h-12 w-full"/>
                    <Skeleton className="h-12 w-full"/>
                </div>
            ) : (
                <Accordion type="single" collapsible className="w-full">
                    {answers?.map((q, index) => (
                    <AccordionItem value={`item-${index}`} key={q.id}>
                        <AccordionTrigger className={cn("hover:no-underline font-semibold", !q.isCorrect && 'text-destructive')}>
                        <div className="flex items-center gap-3">
                            {q.isCorrect ? <Check className="text-[hsl(var(--chart-2))]" size={20} /> : <X size={20} />}
                            <span>Question {index + 1}</span>
                        </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                        <p className="font-semibold text-lg">{q.question}</p>
                        <div className="space-y-2">
                            {q.options.map((option, optIndex) => {
                                const isUserAnswer = q.userAnswer === option;
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
                    ))}
                </Accordion>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

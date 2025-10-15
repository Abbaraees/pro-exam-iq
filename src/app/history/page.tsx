'use client';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { TestSession } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { History, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function formatTimestamp(timestamp: any) {
  if (!timestamp) return 'N/A';
  // Firestore timestamps can be either Firebase Timestamps or server-generated string representations
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString();
}

export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const testSessionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'testSessions'),
      orderBy('endTime', 'desc')
    );
  }, [user, firestore]);

  const { data: testSessions, isLoading } = useCollection<TestSession>(
    testSessionsQuery
  );

  if (isUserLoading || isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary mb-8">Test History</h1>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
          <History /> Test History
        </h1>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      {testSessions && testSessions.length > 0 ? (
        <div className="space-y-4">
          {testSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{session.testName}</CardTitle>
                <CardDescription>
                  Taken on {formatTimestamp(session.endTime)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{session.score.toFixed(0)}%</p>
                  <p className="text-sm text-muted-foreground">Score</p>
                </div>
                <Button asChild>
                  <Link href={`/history/${session.id}`}>
                    Review Test <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <History className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No Test History</h2>
          <p className="mt-2 text-muted-foreground">
            You haven&apos;t completed any tests yet.
          </p>
          <Button asChild className="mt-6">
            <Link href="/test">Start a New Test</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

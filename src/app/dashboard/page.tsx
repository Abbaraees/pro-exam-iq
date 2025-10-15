'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookOpenCheck, History } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 flex-1">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Welcome Back!
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Ready to test your knowledge? Start a new assessment or review your
          past performance.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BookOpenCheck className="h-6 w-6 text-primary" />
              New Assessment
            </CardTitle>
            <CardDescription>
              Generate a personalized test based on your learning goals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Our AI will create a unique set of questions tailored to your
              chosen topic and difficulty level.
            </p>
            <Button asChild>
              <Link href="/test">Start New Test</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-muted/50 cursor-not-allowed opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <History className="h-6 w-6 text-muted-foreground" />
              Test History
            </CardTitle>
            <CardDescription>
              Review your past performance and track your progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground mb-4">
              This feature is coming soon.
            </p>
            <Button disabled>View History</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

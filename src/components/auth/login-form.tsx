'use client';

import { Fingerprint, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { initiateEmailSignIn, initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useUser } from '@/firebase';


export default function LoginForm() {
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [email, setEmail] = useState('tester@proexam.com');
  const [password, setPassword] = useState('password123');

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);


  const handleEmailLogin = (e: FormEvent) => {
    e.preventDefault();
    initiateEmailSignIn(auth, email, password);
  };

  const handleBiometricLogin = () => {
    toast({
      title: 'Feature Not Implemented',
      description: 'Biometric login is not available in this demo.',
      variant: 'default',
    });
  };

  if (isUserLoading || user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-3xl font-bold text-primary">
          Welcome to ProExam IQ
        </CardTitle>
        <CardDescription>
          Sign in to access your secure assessments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailLogin} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline">
                Forgot password?
              </Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button type="submit" className="w-full">
              <LogIn className="mr-2 h-4 w-4" /> Sign In
            </Button>
            <Button
              variant="outline"
              className="w-full"
              type="button"
              onClick={handleBiometricLogin}
            >
              <Fingerprint className="mr-2 h-4 w-4" /> Sign in with Biometrics
            </Button>
          </div>
        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="#" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

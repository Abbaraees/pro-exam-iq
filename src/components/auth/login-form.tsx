'use client';

import { Camera, LogIn } from 'lucide-react';
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
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import FacialLoginForm from './facial-login-form';


export default function LoginForm() {
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [email, setEmail] = useState('tester@proexam.com');
  const [password, setPassword] = useState('password123');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isFacialLoginOpen, setIsFacialLoginOpen] = useState(false);


  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleLoginError = (error: any) => {
    setIsSigningIn(false);
    let description = "An unexpected error occurred. Please try again.";
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          description = "Invalid email or password. Please check your credentials and try again.";
          break;
        case 'auth/invalid-email':
          description = "The email address is not valid.";
          break;
        case 'auth/network-request-failed':
          description = "Network error. Please check your internet connection.";
          break;
        default:
          description = `An error occurred: ${error.message}`;
      }
    }
    toast({
      title: 'Sign In Failed',
      description: description,
      variant: 'destructive',
    });
  }

  const handleFacialLoginSuccess = () => {
    setIsFacialLoginOpen(false);
    // The useEffect will redirect to dashboard
  }

  const handleEmailLogin = (e: FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    initiateEmailSignIn(auth, email, password, handleLoginError);
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
              disabled={isSigningIn}
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
              disabled={isSigningIn}
            />
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button type="submit" className="w-full" disabled={isSigningIn}>
              {isSigningIn ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground mr-2"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Sign In
                </>
              )}
            </Button>
             <Dialog open={isFacialLoginOpen} onOpenChange={setIsFacialLoginOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  disabled={isSigningIn}
                >
                  <Camera className="mr-2 h-4 w-4" /> Sign in with Facial Login
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Facial Login</DialogTitle>
                </DialogHeader>
                <FacialLoginForm onLoginSuccess={handleFacialLoginSuccess} />
              </DialogContent>
            </Dialog>
          </div>
        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

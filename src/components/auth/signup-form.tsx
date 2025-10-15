'use client';

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
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { updateProfile } from 'firebase/auth';

export default function SignupForm() {
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleSignupError = (error: any) => {
    setIsSigningUp(false);
    let description = "An unexpected error occurred. Please try again.";
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          description = "This email address is already in use by another account.";
          break;
        case 'auth/invalid-email':
          description = "The email address is not valid.";
          break;
        case 'auth/weak-password':
           description = "The password is too weak. Please choose a stronger password.";
           break;
        case 'auth/network-request-failed':
          description = "Network error. Please check your internet connection.";
          break;
        default:
          description = `An error occurred: ${error.message}`;
      }
    }
    toast({
      title: 'Sign Up Failed',
      description: description,
      variant: 'destructive',
    });
  };

  const handleSuccessfulSignUp = async () => {
    if(!auth.currentUser) {
        // This should not happen if signup was successful, but as a safeguard
        setIsSigningUp(false);
        toast({ title: 'Sign Up Failed', description: 'Could not find newly created user.', variant: 'destructive' });
        return;
    }
    try {
        await updateProfile(auth.currentUser, { displayName: `${firstName} ${lastName}` });
        // The useEffect will handle the redirect to /dashboard
    } catch(error: any) {
        setIsSigningUp(false);
        toast({ title: 'Sign Up Warning', description: `Account was created, but we failed to set your display name: ${error.message}`, variant: 'default' });
        // Redirect anyway
        router.push('/dashboard');
    }
  }

  const handleEmailSignUp = (e: FormEvent) => {
    e.preventDefault();
    setIsSigningUp(true);
    initiateEmailSignUp(auth, email, password, handleSignupError, handleSuccessfulSignUp);
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
          Create an Account
        </CardTitle>
        <CardDescription>
          Join ProExam IQ to start your assessment journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailSignUp} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First name</Label>
              <Input id="first-name" placeholder="Max" required value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isSigningUp}/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input id="last-name" placeholder="Robinson" required value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isSigningUp}/>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSigningUp}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSigningUp}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSigningUp}>
             {isSigningUp ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground mr-2"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                </>
              )}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

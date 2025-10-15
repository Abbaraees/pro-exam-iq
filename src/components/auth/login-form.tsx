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

export default function LoginForm() {
  const { toast } = useToast();

  const handleBiometricLogin = () => {
    toast({
      title: 'Feature Not Implemented',
      description: 'Biometric login is not available in this demo.',
      variant: 'default',
    });
  };

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
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            required
            defaultValue="tester@proexam.com"
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link href="#" className="ml-auto inline-block text-sm underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" type="password" required defaultValue="password123"/>
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <Button asChild type="submit" className="w-full">
            <Link href="/dashboard">
              <LogIn className="mr-2 h-4 w-4" /> Sign In
            </Link>
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleBiometricLogin}
          >
            <Fingerprint className="mr-2 h-4 w-4" /> Sign in with Biometrics
          </Button>
        </div>
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

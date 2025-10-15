'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import SignupForm from '@/components/auth/signup-form';

export default function SignupPage() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'login-hero');

  return (
    <div className="w-full lg:grid lg:grid-cols-2 flex-1">
      <div className="flex items-center justify-center p-6 lg:p-12">
        <SignupForm />
      </div>
      <div className="hidden bg-muted lg:block relative">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            width={1200}
            height={800}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-primary/30" />
      </div>
    </div>
  );
}
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Header() {
  const avatarImage = PlaceHolderImages.find((p) => p.id === 'user-avatar');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/dashboard" className="text-2xl font-bold text-primary">
            ProExam IQ
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Avatar>
            {avatarImage && (
              <AvatarImage
                src={avatarImage.imageUrl}
                alt={avatarImage.description}
                data-ai-hint={avatarImage.imageHint}
              />
            )}
            <AvatarFallback>IQ</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

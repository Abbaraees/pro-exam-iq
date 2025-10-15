'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2, UserCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { checkFace } from '@/app/actions';
import { useAuth } from '@/firebase';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';

interface FacialLoginFormProps {
  onLoginSuccess: () => void;
}

export default function FacialLoginForm({ onLoginSuccess }: FacialLoginFormProps) {
  const { toast } = useToast();
  const auth = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (hasCameraPermission === null) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setStream(stream);
          setHasCameraPermission(true);
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
        }
      }
    };
    getCameraPermission();

    return () => {
      // Stop stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [hasCameraPermission, stream, toast]);

  useEffect(() => {
    if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleLoginError = (error: any) => {
    setIsProcessing(false);
    toast({
      title: 'Sign In Failed',
      description: 'Could not log you in automatically. Please try again.',
      variant: 'destructive',
    });
  }

  const handleScanFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsProcessing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
        setIsProcessing(false);
        return;
    };
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const photoDataUri = canvas.toDataURL('image/jpeg');
    
    try {
      const result = await checkFace({ photoDataUri });
      if (result.isFaceDetected) {
        toast({
          title: 'Face Detected!',
          description: 'Logging you in as our test user.',
        });
        // Simulate login for tester@proexam.com
        initiateEmailSignIn(auth, 'tester@proexam.com', 'password123', handleLoginError, onLoginSuccess);
      } else {
        toast({
          variant: 'destructive',
          title: 'No Face Detected',
          description: 'Could not detect a face. Please try again.',
        });
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Face verification error', error);
       toast({
          variant: 'destructive',
          title: 'Verification Failed',
          description: 'An error occurred during face verification. Please try again.',
        });
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden border">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
        {hasCameraPermission === false && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
                 <Alert variant="destructive">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera access to use this feature.
                    </AlertDescription>
                </Alert>
            </div>
        )}
        {hasCameraPermission === null && (
             <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
        )}
      </div>

      <Button onClick={handleScanFace} disabled={!hasCameraPermission || isProcessing} className="w-full">
        {isProcessing ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
        ) : (
          <><Camera className="mr-2 h-4 w-4" /> Scan Face</>
        )}
      </Button>
    </div>
  );
}

'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  FirebaseError
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth, onError?: (error: FirebaseError) => void): void {
  signInAnonymously(authInstance)
    .catch((error: FirebaseError) => {
        if (onError) {
          onError(error);
        } else {
          console.error("Anonymous sign-in error:", error);
        }
    });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, onError?: (error: FirebaseError) => void): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .catch((error: FirebaseError) => {
        if (onError) {
          onError(error);
        } else {
          console.error("Email sign-up error:", error);
        }
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, onError?: (error: FirebaseError) => void): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .catch((error: FirebaseError) => {
        if (onError) {
          onError(error);
        } else {
          console.error("Email sign-in error:", error);
        }
    });
}

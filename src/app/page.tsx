
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { auth } from '@/lib/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { FirebaseError } from 'firebase/app';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof FirebaseError && ['auth/cancelled-popup-request', 'auth/popup-closed-by-user', 'auth/popup-blocked'].includes(error.code)) {
        console.log("Sign-in popup action cancelled or blocked by user/browser.");
        return;
      }
      console.error("Error during Google sign-in:", error);
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión con Google",
        description: "No se pudo iniciar sesión. Por favor, inténtalo de nuevo más tarde.",
      });
    }
  };

  const handleMicrosoftSignIn = async () => {
    const provider = new OAuthProvider('microsoft.com');
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof FirebaseError && ['auth/cancelled-popup-request', 'auth/popup-closed-by-user', 'auth/popup-blocked'].includes(error.code)) {
        console.log("Sign-in popup action cancelled or blocked by user/browser.");
        return;
      }
      console.error("Error during Microsoft sign-in:", error);
       toast({
        variant: "destructive",
        title: "Error de inicio de sesión con Microsoft",
        description: "No se pudo iniciar sesión. Por favor, inténtalo de nuevo más tarde.",
      });
    }
  };
  
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error) {
      console.error("Error during email sign-in:", error);
      let description = "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.";
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          description = "Correo electrónico o contraseña incorrectos. Por favor, verifica tus credenciales.";
        }
      }
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: description,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl font-bold">SmartPig Lite</CardTitle>
          <CardDescription>Introduce tus credenciales para iniciar sesión</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignIn}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@ejemplo.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link href="#" className="ml-auto inline-block text-sm underline">
                    ¿Olvidaste tu contraseña?
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
              <Button type="submit" className="w-full">
                Iniciar sesión
              </Button>
            </div>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">O continuar con</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleGoogleSignIn}>
              <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                <path
                  fill="currentColor"
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.6 1.84-4.84 1.84-5.84 0-10.62-4.7-10.62-10.62s4.78-10.62 10.62-10.62c3.37 0 5.39 1.37 6.63 2.54l2.54-2.54C19.52 1.18 16.37 0 12.48 0 5.59 0 .02 5.59.02 12.5s5.57 12.5 12.46 12.5c7.05 0 12.2-4.85 12.2-12.65 0-.85-.07-1.65-.2-2.44H12.48z"
                />
              </svg>
              Google
            </Button>
            <Button variant="outline" onClick={handleMicrosoftSignIn}>
              <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                <path 
                fill="currentColor"
                d="M11.97 2.6l.03 8.32L3.12 12V3.53l8.85- .93M12.03 2.6L20.88 3.5v8.53l-8.85-1.03V2.6M3.12 12.7l8.85 1.02v7.75l-8.85-.93V12.7m8.91 1.02l8.85-1.02v8.53l-8.85.93V13.72z" 
                />
              </svg>
              Microsoft
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{' '}
            <Link href="/signup" className="underline">
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

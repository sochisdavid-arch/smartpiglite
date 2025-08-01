import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl font-bold">SmartPig Lite</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" asChild>
              <Link href="/dashboard">Login</Link>
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline">
                <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                  <path
                    fill="currentColor"
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.6 1.84-4.84 1.84-5.84 0-10.62-4.7-10.62-10.62s4.78-10.62 10.62-10.62c3.37 0 5.39 1.37 6.63 2.54l2.54-2.54C19.52 1.18 16.37 0 12.48 0 5.59 0 .02 5.59.02 12.5s5.57 12.5 12.46 12.5c7.05 0 12.2-4.85 12.2-12.65 0-.85-.07-1.65-.2-2.44H12.48z"
                  />
                </svg>
                Google
              </Button>
               <Button variant="outline">
                <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                  <path 
                  fill="currentColor"
                  d="M11.97 2.6l.03 8.32L3.12 12V3.53l8.85- .93M12.03 2.6L20.88 3.5v8.53l-8.85-1.03V2.6M3.12 12.7l8.85 1.02v7.75l-8.85-.93V12.7m8.91 1.02l8.85-1.02v8.53l-8.85.93V13.72z" 
                  />
                </svg>
                Microsoft
              </Button>
            </div>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="#" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

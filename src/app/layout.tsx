
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { FarmProvider } from '@/context/FarmContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'SmartPig',
  description: 'Gestión porcina inteligente para optimizar la producción y la salud.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased`}>
        <AuthProvider>
          <FarmProvider>
            {children}
          </FarmProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}

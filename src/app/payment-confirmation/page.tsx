
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, KeyRound, Loader2, ScanLine } from 'lucide-react';


export default function PaymentConfirmationPage() {
    const router = useRouter();
    const { toast } = useToast();

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="mx-auto w-full max-w-md text-center">
                <CardHeader>
                     <div className="mx-auto bg-green-100 rounded-full h-20 w-20 flex items-center justify-center">
                        <ShieldCheck className="h-12 w-12 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold mt-4">Página de Confirmación</CardTitle>
                    <CardDescription>
                       Esta página ya no es necesaria. Serás redirigido al panel de control.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push('/dashboard')}>Ir al Panel de Control</Button>
                </CardContent>
            </Card>
        </div>
    );
}

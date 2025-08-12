
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, KeyRound, Loader2, ScanLine } from 'lucide-react';
import { activateLicense, getSavedPlan } from '@/lib/license';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


export default function PaymentConfirmationPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [transactionCode, setTransactionCode] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleActivation = async () => {
        setIsLoading(true);
        if (!transactionCode.trim()) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Por favor, introduce el código de transacción de PayU.',
            });
            setIsLoading(false);
            return;
        }

        // Simulate a check
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const success = activateLicense();

        if (success) {
            toast({
                title: '¡Licencia Activada!',
                description: 'Tu plan ha sido activado. ¡Bienvenido a la versión completa!',
            });
            router.push('/farm-setup');
        } else {
            toast({
                variant: 'destructive',
                title: 'Error de Activación',
                description: 'No se encontró un plan pendiente para activar. Por favor, primero selecciona un plan.',
            });
        }
        setIsLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="mx-auto w-full max-w-md text-center">
                <CardHeader>
                     <div className="mx-auto bg-green-100 rounded-full h-20 w-20 flex items-center justify-center">
                        <KeyRound className="h-12 w-12 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold mt-4">Verificar y Activar Licencia</CardTitle>
                    <CardDescription>
                       Introduce el código de la transacción que recibiste en tu correo de PayU para activar tu licencia.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-left space-y-2">
                        <Label htmlFor="transaction-code">Código de Transacción de PayU</Label>
                        <Input 
                            id="transaction-code"
                            placeholder="Ej: a1b2c3d4e5f6"
                            value={transactionCode}
                            onChange={(e) => setTransactionCode(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleActivation} disabled={isLoading} className="w-full">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                        Activar Licencia
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

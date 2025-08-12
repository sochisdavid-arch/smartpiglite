
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useToast } from '@/hooks/use-toast';
import { getSelectedPlan, setLicense, clearSelectedPlan } from '@/lib/license';
import { CheckCircle, ShieldCheck, KeyRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PaymentConfirmationPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [transactionCode, setTransactionCode] = React.useState('');

    const handleActivation = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const planDetails = getSelectedPlan();
        
        // Basic validation: A real PayU code might have a more specific format.
        if (!transactionCode || transactionCode.trim().length < 5) {
             toast({
                variant: 'destructive',
                title: 'Código Inválido',
                description: 'Por favor, introduce un código de transacción válido de tu recibo de PayU.'
            });
            setIsLoading(false);
            return;
        }

        if (planDetails) {
            setLicense(planDetails.tierId, planDetails.durationInMonths);
            clearSelectedPlan();
            toast({
                title: '¡Licencia Activada!',
                description: 'Tu plan ha sido activado. ¡Bienvenido a bordo!',
            });
            // Redirige al siguiente paso, que es la configuración de la granja.
            router.push('/farm-setup');
        } else {
            toast({
                variant: 'destructive',
                title: 'Error de activación',
                description: 'No se encontró un plan seleccionado para activar. Por favor, vuelve a la página de licenciamiento y selecciona un plan antes de pagar.'
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="mx-auto w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mb-4 flex justify-center">
                        <KeyRound className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Verificar y Activar Licencia</CardTitle>
                    <CardDescription>
                        Introduce el código de transacción de tu recibo de PayU para activar tu plan.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleActivation} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="transaction-code">Código de Transacción</Label>
                            <Input 
                                id="transaction-code"
                                value={transactionCode}
                                onChange={(e) => setTransactionCode(e.target.value)}
                                placeholder="Ej: a1b2c3d4e5f6"
                                required
                            />
                        </div>
                        <Button 
                            className="w-full" 
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Activando...' : 'Activar Licencia'}
                            <ShieldCheck className="ml-2 h-4 w-4"/>
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

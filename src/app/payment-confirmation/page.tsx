
"use client";

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useToast } from '@/hooks/use-toast';
import { getSelectedPlan, setLicense, clearSelectedPlan } from '@/lib/license';
import { CheckCircle, ShieldCheck } from 'lucide-react';

export default function PaymentConfirmationPage() {
    const router = useRouter();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = React.useState(false);
    const [planDetails, setPlanDetails] = React.useState<{ tierId: string; durationInMonths: number } | null>(null);

    React.useEffect(() => {
        const plan = getSelectedPlan();
        setPlanDetails(plan);
        // Opcional: Verificar los parámetros de la URL de PayU si es necesario
        // const transactionState = searchParams.get('transactionState');
        // if (transactionState !== '4') { // 4 = Aprobada
        //     toast({ variant: 'destructive', title: 'Pago no completado', description: 'La transacción no fue aprobada.'});
        //     router.push('/licensing');
        // }
    }, [searchParams, router, toast]);

    const handleActivation = () => {
        setIsLoading(true);
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
                description: 'No se encontró un plan seleccionado para activar. Por favor, vuelve a la página de licenciamiento.'
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="mx-auto w-full max-w-md text-center">
                <CardHeader>
                    <div className="mb-4 flex justify-center">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold">¡Pago Recibido!</CardTitle>
                    <CardDescription>
                        Gracias por tu compra. Tu transacción ha sido procesada. Solo falta un último paso para activar tu licencia.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-6">
                        Haz clic en el botón de abajo para verificar el pago, activar tu plan y continuar con la configuración de tu granja.
                    </p>
                    <Button 
                        className="w-full" 
                        onClick={handleActivation}
                        disabled={isLoading || !planDetails}
                    >
                        {isLoading ? 'Activando...' : 'Verificar y Activar Licencia'}
                        <ShieldCheck className="ml-2 h-4 w-4"/>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

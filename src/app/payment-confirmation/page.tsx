
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, KeyRound, Loader2 } from 'lucide-react';
import { activateLicense, getSavedPlan } from '@/lib/license';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const STATIC_ACTIVATION_KEY = '1310051012Ab*';

export default function PaymentConfirmationPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [activationKey, setActivationKey] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleActivation = async () => {
        setIsLoading(true);
        if (activationKey.trim() !== STATIC_ACTIVATION_KEY) {
            toast({
                variant: 'destructive',
                title: 'Error de Activación',
                description: 'El código de activación es incorrecto. Por favor, verifícalo e inténtalo de nuevo.',
            });
            setIsLoading(false);
            return;
        }

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
                description: 'No se encontró un plan pendiente para activar. Por favor, selecciona un plan en la página de licencias primero.',
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
                       Introduce el código de activación que recibiste por WhatsApp para activar tu licencia.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-left space-y-2">
                        <Label htmlFor="activation-key">Código de Activación</Label>
                        <Input 
                            id="activation-key"
                            placeholder="Introduce tu código de activación"
                            value={activationKey}
                            onChange={(e) => setActivationKey(e.target.value)}
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

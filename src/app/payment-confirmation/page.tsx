
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getLicenseInfo, setLicense } from '@/lib/license';
import { ShieldCheck, KeyRound, Loader2, ScanLine } from 'lucide-react';
import QRCode from "qrcode.react";
import { db } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';

export default function PaymentConfirmationPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [sessionId, setSessionId] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isVerified, setIsVerified] = React.useState(false);

    React.useEffect(() => {
        // This simulates retrieving the session ID after the payment flow starts.
        // In a real app, this might be stored in localStorage/sessionStorage.
        // For now, we'll generate a dummy one for demonstration.
        const generatedSessionId = `sid_${Math.random().toString(36).substring(2, 12)}`;
        setSessionId(generatedSessionId);
        setIsLoading(false);
    }, []);

    React.useEffect(() => {
        if (!sessionId) return;

        const sessionRef = ref(db, `verificationSessions/${sessionId}`);
        
        const unsubscribe = onValue(sessionRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.status === 'completed' && data.transactionCode) {
                toast({
                    title: '¡Pago Verificado!',
                    description: 'Tu licencia ha sido verificada. Activando tu plan...',
                });
                setLicense(data.tierId, data.durationInMonths);
                setIsVerified(true);
                unsubscribe(); // Stop listening
                setTimeout(() => {
                    router.push('/farm-setup');
                }, 2000);
            }
        });

        // Cleanup listener on component unmount
        return () => off(sessionRef, 'value', unsubscribe);

    }, [sessionId, router, toast]);

    const getVerificationUrl = () => {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/verify/${sessionId}`;
        }
        return '';
    };

    if (isLoading) {
        return (
             <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                 <Loader2 className="h-16 w-16 animate-spin text-primary" />
             </div>
        );
    }
    
     if (isVerified) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <Card className="mx-auto w-full max-w-md text-center">
                    <CardHeader>
                         <div className="mx-auto bg-green-100 rounded-full h-20 w-20 flex items-center justify-center">
                            <ShieldCheck className="h-12 w-12 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold mt-4">¡Licencia Activada!</CardTitle>
                        <CardDescription>
                            Tu plan ha sido activado exitosamente. Serás redirigido en un momento.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="mx-auto w-full max-w-md text-center">
                <CardHeader>
                    <div className="mb-4 flex justify-center">
                        <ScanLine className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Verificar Pago con tu Móvil</CardTitle>
                    <CardDescription>
                        Escanea el código QR con tu teléfono para completar la activación de tu licencia.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    <div className="p-4 bg-white rounded-lg border">
                         {sessionId && <QRCode value={getVerificationUrl()} size={200} />}
                    </div>
                   <div>
                       <h3 className="font-semibold">¿Cómo funciona?</h3>
                       <ol className="text-sm text-muted-foreground list-decimal list-inside text-left space-y-1 mt-2">
                           <li>Escanea el QR con la cámara de tu celular.</li>
                           <li>Abre el enlace que aparecerá en tu móvil.</li>
                           <li>Ingresa el **Código de Transacción** de tu recibo de PayU.</li>
                           <li>¡Esta página se actualizará automáticamente!</li>
                       </ol>
                   </div>
                </CardContent>
            </Card>
        </div>
    );
}

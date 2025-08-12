
"use client";

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { submitTransactionCode } from '@/lib/license';
import { KeyRound, Loader2, CheckCircle } from 'lucide-react';

export default function VerifyPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;
    const { toast } = useToast();
    const [transactionCode, setTransactionCode] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!transactionCode.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Por favor, introduce el código de transacción.' });
            setIsLoading(false);
            return;
        }

        const result = await submitTransactionCode(sessionId, transactionCode);

        if (result.success) {
            toast({ title: '¡Éxito!', description: result.message });
            setIsSuccess(true);
        } else {
            toast({ variant: 'destructive', title: 'Error de Verificación', description: result.message });
        }

        setIsLoading(false);
    };

    if (isSuccess) {
        return (
             <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <Card className="mx-auto w-full max-w-sm text-center">
                    <CardHeader>
                        <div className="mx-auto bg-green-100 rounded-full h-20 w-20 flex items-center justify-center">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold mt-4">Verificación Enviada</CardTitle>
                        <CardDescription>
                           Tu licencia se activará en tu computador. Puedes cerrar esta ventana.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="mx-auto w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="mb-4 flex justify-center">
                        <KeyRound className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold">Confirmar Pago</CardTitle>
                    <CardDescription>
                        Ingresa el código de transacción de tu recibo de PayU para finalizar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="transaction-code">Código de Transacción PayU</Label>
                            <Input
                                id="transaction-code"
                                value={transactionCode}
                                onChange={(e) => setTransactionCode(e.target.value)}
                                placeholder="Encuéntralo en tu recibo"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...</>
                            ) : (
                                "Confirmar y Activar"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

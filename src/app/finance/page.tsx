
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Landmark } from 'lucide-react';

export default function FinancePage() {
   
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <h1 className="text-3xl font-bold tracking-tight">Gestión Financiera</h1>
                <Alert>
                    <Landmark className="h-4 w-4" />
                    <AlertTitle>Contenido Eliminado</AlertTitle>
                    <AlertDescription>
                        El contenido de esta sección ha sido eliminado según tu solicitud.
                    </AlertDescription>
                </Alert>
            </div>
        </AppLayout>
    );
}

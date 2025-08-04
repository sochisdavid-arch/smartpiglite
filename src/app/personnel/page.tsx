
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { User } from 'lucide-react';

export default function PersonnelPage() {
   
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Personal</h1>
                </div>
                <Alert>
                    <User className="h-4 w-4" />
                    <AlertTitle>Página Limpiada</AlertTitle>
                    <AlertDescription>
                        El contenido de esta sección ha sido eliminado según la solicitud.
                    </AlertDescription>
                </Alert>
            </div>
        </AppLayout>
    );
}


"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function GestationPerformancePage() {
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <h1 className="text-3xl font-bold tracking-tight">Análisis de Desempeño de Gestación</h1>
                 <Card>
                    <CardHeader>
                        <CardTitle>Página en Blanco</CardTitle>
                        <CardDescription>El contenido de esta página ha sido eliminado según la solicitud.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <Construction className="h-16 w-16 mb-4" />
                        <p>Esta sección está lista para nuevo contenido.</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

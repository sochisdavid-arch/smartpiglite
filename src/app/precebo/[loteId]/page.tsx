
"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function LotePreceboPage() {
    const router = useRouter();
    const params = useParams();
    const loteId = params.loteId as string;

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push('/precebo')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Registro de Consumo del Lote: {loteId}</h1>
                </div>
                {/* El contenido ha sido eliminado según la solicitud. */}
            </div>
        </AppLayout>
    );
}

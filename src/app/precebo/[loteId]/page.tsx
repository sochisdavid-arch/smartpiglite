
"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { format, parseISO, isValid } from 'date-fns';
import { Label } from '@/components/ui/label';

interface NurseryBatch {
    id: string;
    creationDate: string;
    pigletCount: number;
    initialPigletCount: number;
    totalWeight: number;
    avgWeight: number;
    avgAge: number;
    sows: string[];
    status: 'Activo' | 'Finalizado';
    module?: string;
}


export default function LotePreceboPage() {
    const router = useRouter();
    const params = useParams();
    const loteId = params.loteId as string;
    const [batch, setBatch] = React.useState<NurseryBatch | null>(null);

    React.useEffect(() => {
        const storedBatches = localStorage.getItem('nurseryBatches');
        if (storedBatches) {
            const batchData = JSON.parse(storedBatches);
            const foundBatch = batchData[loteId];
            if (foundBatch) {
                // Ensure numeric values are numbers
                foundBatch.pigletCount = Number(foundBatch.pigletCount);
                foundBatch.initialPigletCount = Number(foundBatch.initialPigletCount || foundBatch.pigletCount);
                foundBatch.totalWeight = Number(foundBatch.totalWeight);
                foundBatch.avgWeight = Number(foundBatch.avgWeight);
                foundBatch.avgAge = Number(foundBatch.avgAge);
                setBatch(foundBatch);
            }
        }
    }, [loteId]);

    if (!batch) {
        return (
            <AppLayout>
                <div className="flex justify-center items-center h-full">
                    <p>Cargando datos del lote...</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push('/precebo')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Registro de Consumo del Lote: {loteId}</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Información del Lote</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                            <div className="flex flex-col">
                                <span className="font-medium text-muted-foreground">Lote N°</span>
                                <span className="font-semibold">{batch.id}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-muted-foreground">Módulo Precebo</span>
                                <span className="font-semibold">{batch.module || 'PRE-01'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-muted-foreground">Fecha Ingreso</span>
                                <span className="font-semibold">{isValid(parseISO(batch.creationDate)) ? format(parseISO(batch.creationDate), 'dd/MM/yyyy') : 'N/A'}</span>
                            </div>
                             <div className="flex flex-col">
                                <span className="font-medium text-muted-foreground">Edad Inicial</span>
                                <span className="font-semibold">{batch.avgAge} días</span>
                            </div>
                             <div className="flex flex-col">
                                <span className="font-medium text-muted-foreground">N° Inicial</span>
                                <span className="font-semibold">{batch.initialPigletCount}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-muted-foreground">N° Actual</span>
                                <span className="font-semibold">{batch.pigletCount}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-muted-foreground">Peso Total</span>
                                <span className="font-semibold">{Number(batch.totalWeight).toFixed(2)} kg</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-muted-foreground">Peso Promedio</span>
                                <span className="font-semibold">{Number(batch.avgWeight).toFixed(2)} kg</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

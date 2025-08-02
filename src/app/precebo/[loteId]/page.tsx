
"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { format, parseISO, isValid } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 text-sm">
                        <div className="space-y-1">
                            <p className="font-medium text-muted-foreground">Lote N°</p>
                            <p className="font-semibold">{batch.id}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium text-muted-foreground">Módulo Precebo</p>
                            <p className="font-semibold">{batch.module || 'PRE-01'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium text-muted-foreground">Fecha Ingreso</p>
                            <p className="font-semibold">{isValid(parseISO(batch.creationDate)) ? format(parseISO(batch.creationDate), 'dd/MM/yyyy') : 'N/A'}</p>
                        </div>
                         <div className="space-y-1">
                            <p className="font-medium text-muted-foreground">N° Inicial</p>
                            <p className="font-semibold">{Number(batch.initialPigletCount).toFixed(0)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium text-muted-foreground">N° Actual</p>
                            <p className="font-semibold">{Number(batch.pigletCount).toFixed(0)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium text-muted-foreground">Peso Total (kg)</p>
                            <p className="font-semibold">{Number(batch.totalWeight).toFixed(2)} kg</p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium text-muted-foreground">Peso Prom. (kg)</p>
                            <p className="font-semibold">{Number(batch.avgWeight).toFixed(2)} kg</p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium text-muted-foreground">Edad Inicial (días)</p>
                            <p className="font-semibold">{batch.avgAge}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Registro de Consumo Semanal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Semana</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Alimento</TableHead>
                                    <TableHead>Sábado</TableHead>
                                    <TableHead>Domingo</TableHead>
                                    <TableHead>Lunes</TableHead>
                                    <TableHead>Martes</TableHead>
                                    <TableHead>Miércoles</TableHead>
                                    <TableHead>Jueves</TableHead>
                                    <TableHead>Viernes</TableHead>
                                    <TableHead>Total Semana</TableHead>
                                    <TableHead>Total Acumulado</TableHead>
                                    <TableHead>Inventario</TableHead>
                                    <TableHead>Acumulado/Cerdo</TableHead>
                                    <TableHead>Consumo Cerdo/Día</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: 8 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>dd/mm - dd/mm</TableCell>
                                        <TableCell>Alimento X</TableCell>
                                        <TableCell>0</TableCell>
                                        <TableCell>0</TableCell>
                                        <TableCell>0</TableCell>
                                        <TableCell>0</TableCell>
                                        <TableCell>0</TableCell>
                                        <TableCell>0</TableCell>
                                        <TableCell>0</TableCell>
                                        <TableCell>0</TableCell>
                                        <TableCell>0</TableCell>
                                        <TableCell>0</TableCell>
                                        <TableCell>0</TableCell>
                                        <TableCell>0</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

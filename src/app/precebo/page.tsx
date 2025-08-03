
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO, isValid, getWeek, addDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface NurseryBatch {
    id: string;
    creationDate: string;
    pigletCount: number;
    avgWeight: number;
    avgAge: number;
    sows: string[];
    status: 'Activo' | 'Finalizado';
}

const createMockBatch = (): NurseryBatch => {
    const weaningDate = addDays(new Date(), -7); // Weaned a week ago
    const weekNumber = getWeek(weaningDate);
    const year = weaningDate.getFullYear();
    const batchId = `PRECEBO-${year}-${weekNumber}`;

    return {
        id: batchId,
        creationDate: weaningDate.toISOString().substring(0, 10),
        pigletCount: 25,
        avgWeight: 6.5,
        avgAge: 21,
        sows: ['PIG-001', 'PIG-002'],
        status: 'Activo'
    };
};

export default function PreceboPage() {
    const router = useRouter();
    const [batches, setBatches] = React.useState<NurseryBatch[]>([]);

    React.useEffect(() => {
        const storedBatches = localStorage.getItem('nurseryBatches');
        if (storedBatches) {
            const batchData = JSON.parse(storedBatches);
            const batchArray = Object.values(batchData) as NurseryBatch[];
            setBatches(batchArray.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()));
        } else {
            // Create a mock batch if none exists
            const newBatch = createMockBatch();
            const newBatchData = { [newBatch.id]: newBatch };
            localStorage.setItem('nurseryBatches', JSON.stringify(newBatchData));
            setBatches([newBatch]);
        }
    }, []);

    const handleRowClick = (batchId: string) => {
        router.push(`/precebo/${batchId}`);
    };

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Lotes en Precebo</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Lotes Activos en Precebo</CardTitle>
                        <CardDescription>
                            Lotes de lechones actualmente en la fase de precebo. Haga clic en un lote para ver sus detalles y registrar datos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID del Lote</TableHead>
                                    <TableHead>Fecha Creación</TableHead>
                                    <TableHead>Nº Lechones</TableHead>
                                    <TableHead>Edad Prom. (días)</TableHead>
                                    <TableHead>Peso Prom. (kg)</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Cerdas Origen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {batches.length > 0 ? batches.map(batch => (
                                    <TableRow key={batch.id} onClick={() => handleRowClick(batch.id)} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell className="font-medium">{batch.id}</TableCell>
                                        <TableCell>{isValid(parseISO(batch.creationDate)) ? format(parseISO(batch.creationDate), 'dd/MM/yyyy') : 'Fecha Inválida'}</TableCell>
                                        <TableCell>{batch.pigletCount}</TableCell>
                                        <TableCell>{batch.avgAge}</TableCell>
                                        <TableCell>{batch.avgWeight}</TableCell>
                                        <TableCell>
                                            <Badge variant={batch.status === 'Activo' ? 'default' : 'secondary'}>
                                                {batch.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{batch.sows.join(', ')}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No hay lotes activos en precebo.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

    
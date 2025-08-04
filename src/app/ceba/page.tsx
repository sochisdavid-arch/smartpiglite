
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO, isValid } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MultiSelect, Option } from '@/components/ui/multi-select';

interface CebaBatch {
    id: string;
    creationDate: string;
    pigletCount: number;
    initialPigletCount: number;
    totalWeight: number;
    avgWeight: number;
    avgAge: number; // Age in days when moved to ceba
    sows: string[];
    status: 'Activo' | 'Finalizado';
    events: any[];
    originBatchId?: string;
}

export default function CebaPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [batches, setBatches] = React.useState<CebaBatch[]>([]);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    
    const loadData = React.useCallback(() => {
        const storedBatches = localStorage.getItem('cebaBatches');
        if (storedBatches) {
            const batchData = JSON.parse(storedBatches);
            const batchArray = Object.values(batchData) as CebaBatch[];
            setBatches(batchArray.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()));
        }
    }, []);
    
    React.useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRowClick = (batchId: string) => {
        router.push(`/ceba/${batchId}`);
    };

    const handleAddBatchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const batchId = formData.get('batchId') as string;
        const creationDate = formData.get('creationDate') as string;
        const pigletCount = Number(formData.get('pigletCount'));
        const avgWeight = Number(formData.get('avgWeight'));
        
        const newBatch: CebaBatch = {
            id: batchId,
            creationDate: creationDate,
            pigletCount: pigletCount,
            initialPigletCount: pigletCount,
            avgWeight: avgWeight,
            totalWeight: pigletCount * avgWeight,
            avgAge: Number(formData.get('avgAge')),
            sows: [], // Manual creation doesn't link to sows directly
            status: 'Activo',
            events: [],
        };
        
        const storedBatches = JSON.parse(localStorage.getItem('cebaBatches') || '{}');
        if (storedBatches[batchId]) {
            toast({
                variant: 'destructive',
                title: 'Error: Lote duplicado',
                description: `Ya existe un lote de ceba con el ID ${batchId}.`
            });
            return;
        }

        storedBatches[batchId] = newBatch;
        localStorage.setItem('cebaBatches', JSON.stringify(storedBatches));

        toast({
            title: '¡Lote de Ceba Creado!',
            description: `El lote ${newBatch.id} ha sido añadido a la lista de lotes activos.`,
        });
        
        setIsFormOpen(false);
        loadData();
    }

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Lotes en Ceba / Engorde</h1>
                     <Button onClick={() => setIsFormOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Agregar Lote
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Lotes Activos en Ceba</CardTitle>
                        <CardDescription>
                            Lotes de cerdos actualmente en la fase de engorde. Haga clic en un lote para ver sus detalles.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID del Lote</TableHead>
                                    <TableHead>Fecha Ingreso</TableHead>
                                    <TableHead>Nº Animales</TableHead>
                                    <TableHead>Edad Ingreso (días)</TableHead>
                                    <TableHead>Peso Prom. (kg)</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Lote Origen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {batches.length > 0 ? batches.map(batch => (
                                    <TableRow key={batch.id} onClick={() => handleRowClick(batch.id)} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell className="font-medium">{batch.id}</TableCell>
                                        <TableCell>{isValid(parseISO(batch.creationDate)) ? format(parseISO(batch.creationDate), 'dd/MM/yyyy') : 'Fecha Inválida'}</TableCell>
                                        <TableCell>{batch.pigletCount}</TableCell>
                                        <TableCell>{batch.avgAge}</TableCell>
                                        <TableCell>{batch.avgWeight.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant={batch.status === 'Activo' ? 'default' : 'secondary'}>
                                                {batch.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{batch.originBatchId || 'Manual'}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No hay lotes activos en ceba.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Agregar Nuevo Lote de Ceba</DialogTitle>
                            <DialogDescription>
                                Complete los datos para crear un nuevo lote de ceba manualmente.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddBatchSubmit} id="add-batch-form" className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="batchId">ID del Lote</Label>
                                <Input id="batchId" name="batchId" type="text" placeholder="Ej: CEBA-24-01" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="creationDate">Fecha de Ingreso a Ceba</Label>
                                <Input id="creationDate" name="creationDate" type="date" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pigletCount">Nº de Animales</Label>
                                    <Input id="pigletCount" name="pigletCount" type="number" required />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="avgAge">Edad Promedio Ingreso (días)</Label>
                                    <Input id="avgAge" name="avgAge" type="number" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="avgWeight">Peso Promedio (kg)</Label>
                                <Input id="avgWeight" name="avgWeight" type="number" step="0.1" required />
                            </div>
                        </form>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                            <Button type="submit" form="add-batch-form">Guardar Lote</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

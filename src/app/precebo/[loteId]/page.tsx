
"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { format, parseISO, isValid, differenceInDays } from 'date-fns';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface NurseryBatch {
    id: string;
    creationDate: string;
    pigletCount: number;
    avgWeight: number;
    avgAge: number;
    sows: string[];
    status: 'Activo' | 'Finalizado';
}

interface DailyConsumptionRecord {
    id: string;
    date: string;
    quantity: number;
    feedType: string;
}

interface MortalityRecord {
    date: string;
    count: number;
    weight: number;
    cause: string;
    observations: string;
}

const mockInventory = [
    { id: 'FEED-PRE-1', name: 'Preiniciador Fase 1' },
    { id: 'FEED-PRE-2', name: 'Preiniciador Fase 2' },
    { id: 'FEED-INIT', name: 'Iniciador' },
];

export default function LotePreceboPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const loteId = params.loteId as string;

    const [lote, setLote] = React.useState<NurseryBatch | null>(null);
    const [consumption, setConsumption] = React.useState<DailyConsumptionRecord[]>([]);
    const [mortality, setMortality] = React.useState<MortalityRecord[]>([]);
    const [isConsumptionModalOpen, setIsConsumptionModalOpen] = React.useState(false);
    
    const getStorageKey = React.useCallback((type: 'consumption' | 'mortality') => {
        return `precebo_${loteId}_${type}`;
    }, [loteId]);

    React.useEffect(() => {
        if (loteId) {
            const storedBatches = localStorage.getItem('nurseryBatches');
            if (storedBatches) {
                const batchData = JSON.parse(storedBatches);
                const foundBatch = batchData[loteId];
                if (foundBatch) {
                    setLote(foundBatch);
                    const storedConsumption = localStorage.getItem(getStorageKey('consumption'));
                    const storedMortality = localStorage.getItem(getStorageKey('mortality'));
                    if (storedConsumption) setConsumption(JSON.parse(storedConsumption));
                    if (storedMortality) setMortality(JSON.parse(storedMortality));
                }
            }
        }
    }, [loteId, getStorageKey]);
    
    const currentPigletCount = lote ? lote.pigletCount - mortality.reduce((acc, curr) => acc + curr.count, 0) : 0;
    
    const consumptionTotals = React.useMemo(() => {
        const totalKg = consumption.reduce((acc, curr) => acc + curr.quantity, 0);
        const daysWithConsumption = new Set(consumption.map(c => c.date)).size;
        const avgDailyKg = daysWithConsumption > 0 ? totalKg / daysWithConsumption : 0;
        const avgGramsPerPig = currentPigletCount > 0 && avgDailyKg > 0 ? (avgDailyKg / currentPigletCount) * 1000 : 0;
        return { totalKg, daysWithConsumption, avgDailyKg, avgGramsPerPig };
    }, [consumption, currentPigletCount]);

    const ConsumptionDialog = () => {
        const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const feedTypeId = formData.get('feedType') as string;
            const feedType = mockInventory.find(f => f.id === feedTypeId)?.name;
            const newRecord: DailyConsumptionRecord = {
                id: new Date().toISOString(),
                date: formData.get('date') as string,
                quantity: Number(formData.get('quantity')),
                feedType: feedType || 'Desconocido',
            };
            
            const updatedConsumption = [...consumption, newRecord].sort((a, b) => {
                if (!a.date || !b.date) return 0;
                return new Date(a.date).getTime() - new Date(b.date).getTime()
            });

            setConsumption(updatedConsumption);
            localStorage.setItem(getStorageKey('consumption'), JSON.stringify(updatedConsumption));
            
            toast({ title: "Registro Guardado", description: `Se ha guardado el consumo del día ${format(parseISO(newRecord.date), 'dd/MM/yyyy')}.` });
            setIsConsumptionModalOpen(false);
        }

        return (
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Registrar Consumo Diario</DialogTitle>
                    <DialogDescription>Ingrese el consumo de alimento en kilogramos (kg) para un día específico.</DialogDescription>
                </DialogHeader>
                <form id="consumption-form" onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">Fecha</Label>
                        <Input id="date" name="date" type="date" className="col-span-3" required defaultValue={new Date().toISOString().substring(0, 10)} />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="feedType" className="text-right">Alimento</Label>
                        <Select name="feedType" required>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Seleccionar tipo..." />
                            </SelectTrigger>
                            <SelectContent>
                                {mockInventory.map(feed => (
                                    <SelectItem key={feed.id} value={feed.id}>{feed.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">Cantidad (kg)</Label>
                        <Input id="quantity" name="quantity" type="number" step="0.1" placeholder="Ej. 50.5" className="col-span-3" required />
                    </div>
                </form>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsConsumptionModalOpen(false)}>Cancelar</Button>
                    <Button type="submit" form="consumption-form">Guardar Registro</Button>
                </DialogFooter>
            </DialogContent>
        )
    }

    if (!lote) {
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
                    <h1 className="text-3xl font-bold tracking-tight">Registro de Lote Precebo: {lote.id}</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Información General del Lote</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-x-8 gap-y-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-1">
                            <Label>Fecha Ingreso</Label>
                            <p className="font-semibold">{isValid(parseISO(lote.creationDate)) ? format(parseISO(lote.creationDate), 'dd/MM/yyyy') : 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <Label>Número Inicial Animales</Label>
                            <p className="font-semibold">{lote.pigletCount}</p>
                        </div>
                        <div className="space-y-1">
                            <Label>Peso Promedio Inicial (kg)</Label>
                            <p className="font-semibold">{lote.avgWeight}</p>
                        </div>
                         <div className="space-y-1">
                            <Label>Edad Promedio Ingreso (días)</Label>
                            <p className="font-semibold">{lote.avgAge}</p>
                        </div>
                        <div className="space-y-1">
                            <Label>Corral Asignado</Label>
                            <p className="font-semibold">PRECEBO-01</p>
                        </div>
                         <div className="space-y-1">
                            <Label>Número Final Animales</Label>
                            <p className="font-semibold">{currentPigletCount}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                     <CardHeader>
                        <CardTitle>Resumen de Consumo</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                         <div className="p-2 bg-muted rounded-md">
                            <Label className="text-sm font-normal text-muted-foreground">Consumo Total (kg)</Label>
                            <p className="font-bold text-lg">{consumptionTotals.totalKg.toFixed(2)}</p>
                        </div>
                        <div className="p-2 bg-muted rounded-md">
                            <Label className="text-sm font-normal text-muted-foreground">Duración (días)</Label>
                            <p className="font-bold text-lg">{consumptionTotals.daysWithConsumption}</p>
                        </div>
                        <div className="p-2 bg-muted rounded-md">
                            <Label className="text-sm font-normal text-muted-foreground">Prom. Diario (kg)</Label>
                            <p className="font-bold text-lg">{consumptionTotals.avgDailyKg.toFixed(2)}</p>
                        </div>
                        <div className="p-2 bg-muted rounded-md">
                            <Label className="text-sm font-normal text-muted-foreground">g/Lechón/Día</Label>
                            <p className="font-bold text-lg">{consumptionTotals.avgGramsPerPig.toFixed(2)}</p>
                        </div>
                    </CardContent>
                </Card>
                
                <Dialog open={isConsumptionModalOpen} onOpenChange={setIsConsumptionModalOpen}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1.5">
                                <CardTitle>Historial de Consumo Diario</CardTitle>
                                <CardDescription>Registre el consumo de alimento diario del lote.</CardDescription>
                            </div>
                            <DialogTrigger asChild>
                                <Button size="sm" onClick={() => setIsConsumptionModalOpen(true)}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Registrar Consumo
                                </Button>
                            </DialogTrigger>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Tipo de Alimento</TableHead>
                                        <TableHead className="text-right">Cantidad (kg)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {consumption.length > 0 ? consumption.map(c => (
                                        <TableRow key={c.id}>
                                            <TableCell className="font-medium">{c.date && isValid(parseISO(c.date)) ? format(parseISO(c.date), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                            <TableCell>{c.feedType}</TableCell>
                                            <TableCell className="text-right">{c.quantity.toFixed(2)}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center">
                                                No hay registros de consumo para este lote.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <ConsumptionDialog />
                        </CardContent>
                    </Card>
                </Dialog>

                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1.5">
                            <CardTitle>Registro de Ventas y Muertes</CardTitle>
                            <CardDescription>Registre las bajas que ocurran en el lote.</CardDescription>
                        </div>
                         <Button size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Registrar Baja
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead className="text-center">Nº</TableHead>
                                    <TableHead className="text-center">Peso (kg)</TableHead>
                                    <TableHead>Causa</TableHead>
                                    <TableHead>Observaciones</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {mortality.length > 0 ? mortality.map((m, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{isValid(parseISO(m.date)) ? format(parseISO(m.date), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                        <TableCell className="text-center">{m.count}</TableCell>
                                        <TableCell className="text-center">{m.weight}</TableCell>
                                        <TableCell>{m.cause}</TableCell>
                                        <TableCell>{m.observations}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No hay registros de bajas para este lote.
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

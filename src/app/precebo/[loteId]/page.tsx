
"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
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

interface WeeklyConsumption {
    week: number;
    days: (number | string)[];
    total: number;
    accumulated: number;
    avgPerPigDay: number;
    avgDaily: number;
}

interface MortalityRecord {
    date: string;
    count: number;
    weight: number;
    cause: string;
    observations: string;
}

export default function LotePreceboPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const loteId = params.loteId as string;

    const [lote, setLote] = React.useState<NurseryBatch | null>(null);
    const [consumption, setConsumption] = React.useState<WeeklyConsumption[]>([]);
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

    const ConsumptionDialog = () => {
        const [dailyConsumptions, setDailyConsumptions] = React.useState<(string | number)[]>(Array(7).fill(''));

        const handleDailyChange = (index: number, value: string) => {
            const newDaily = [...dailyConsumptions];
            newDaily[index] = value === '' ? '' : Number(value);
            setDailyConsumptions(newDaily);
        }

        const totals = React.useMemo(() => {
            const numericConsumptions = dailyConsumptions.map(c => Number(c) || 0);
            const total = numericConsumptions.reduce((acc, curr) => acc + curr, 0);
            const daysWithConsumption = numericConsumptions.filter(c => c > 0).length;
            const avgDaily = daysWithConsumption > 0 ? total / daysWithConsumption : 0;
            const avgPerPigDay = currentPigletCount > 0 ? (avgDaily / currentPigletCount) * 1000 : 0; // In grams
            return { total, avgDaily, avgPerPigDay };
        }, [dailyConsumptions]);

        const handleSave = () => {
            const lastWeek = consumption.length > 0 ? consumption[consumption.length - 1] : { week: 0, accumulated: 0 };
            const newWeek: WeeklyConsumption = {
                week: lastWeek.week + 1,
                days: dailyConsumptions.map(c => c === '' ? '-' : Number(c)),
                total: totals.total,
                accumulated: lastWeek.accumulated + totals.total,
                avgDaily: totals.avgDaily,
                avgPerPigDay: totals.avgPerPigDay,
            };

            const updatedConsumption = [...consumption, newWeek];
            setConsumption(updatedConsumption);
            localStorage.setItem(getStorageKey('consumption'), JSON.stringify(updatedConsumption));
            
            toast({ title: "Registro Guardado", description: `Se ha guardado el consumo de la semana ${newWeek.week}.` });
            setIsConsumptionModalOpen(false);
        }

        return (
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Registrar Consumo Semanal (Semana {consumption.length + 1})</DialogTitle>
                    <DialogDescription>Ingrese el consumo de alimento en kilogramos (kg) para cada día.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 py-4">
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, index) => (
                        <div key={day} className="space-y-2">
                            <Label htmlFor={`day-${index}`}>{day}</Label>
                            <Input 
                                id={`day-${index}`} 
                                type="number" 
                                placeholder="kg" 
                                value={dailyConsumptions[index]}
                                onChange={(e) => handleDailyChange(index, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
                <Separator />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-center">
                    <div className="p-2 bg-muted rounded-md">
                        <Label className="text-sm font-normal text-muted-foreground">Total Semana (kg)</Label>
                        <p className="font-bold text-lg">{totals.total.toFixed(2)}</p>
                    </div>
                    <div className="p-2 bg-muted rounded-md">
                        <Label className="text-sm font-normal text-muted-foreground">Prom. Diario (kg)</Label>
                        <p className="font-bold text-lg">{totals.avgDaily.toFixed(2)}</p>
                    </div>
                    <div className="p-2 bg-muted rounded-md">
                        <Label className="text-sm font-normal text-muted-foreground">Prom. Lechón/Día (g)</Label>
                        <p className="font-bold text-lg">{totals.avgPerPigDay.toFixed(2)}</p>
                    </div>
                    <div className="p-2 bg-muted rounded-md">
                        <Label className="text-sm font-normal text-muted-foreground">Lechones Actuales</Label>
                        <p className="font-bold text-lg">{currentPigletCount}</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsConsumptionModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Guardar Semana</Button>
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

                <Dialog open={isConsumptionModalOpen} onOpenChange={setIsConsumptionModalOpen}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1.5">
                                <CardTitle>Registro Semanal de Consumo</CardTitle>
                                <CardDescription>Registre el consumo de alimento del lote por semana.</CardDescription>
                            </div>
                            <DialogTrigger asChild>
                                <Button size="sm" onClick={() => setIsConsumptionModalOpen(true)}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Registrar Semana
                                </Button>
                            </DialogTrigger>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">Sem</TableHead>
                                        <TableHead>L</TableHead>
                                        <TableHead>M</TableHead>
                                        <TableHead>Mi</TableHead>
                                        <TableHead>J</TableHead>
                                        <TableHead>V</TableHead>
                                        <TableHead>S</TableHead>
                                        <TableHead>D</TableHead>
                                        <TableHead className="text-right">Total (kg)</TableHead>
                                        <TableHead className="text-right">Acum (kg)</TableHead>
                                        <TableHead className="text-right">g/Lechón/Día</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {consumption.length > 0 ? consumption.map(c => (
                                        <TableRow key={c.week}>
                                            <TableCell className="font-medium">{c.week}</TableCell>
                                            {c.days.map((d, i) => <TableCell key={i}>{d}</TableCell>)}
                                            <TableCell className="text-right font-medium">{c.total.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">{c.accumulated.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">{c.avgPerPigDay.toFixed(2)}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={11} className="h-24 text-center">
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



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

interface WeeklyConsumptionRecord {
    id: string;
    weekNumber: number;
    feedType: string;
    dailyConsumption: {
        monday: number;
        tuesday: number;
        wednesday: number;
        thursday: number;
        friday: number;
        saturday: number;
        sunday: number;
    };
    totalWeek: number;
    avgPigPerDay: number;
}

interface MortalityRecord {
    id: string;
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
    const [consumption, setConsumption] = React.useState<WeeklyConsumptionRecord[]>([]);
    const [mortality, setMortality] = React.useState<MortalityRecord[]>([]);
    const [isConsumptionModalOpen, setIsConsumptionModalOpen] = React.useState(false);
    const [isMortalityModalOpen, setIsMortalityModalOpen] = React.useState(false);
    
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
        const [dailyValues, setDailyValues] = React.useState({
            monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0
        });
        const [feedType, setFeedType] = React.useState('');

        const handleDailyChange = (day: keyof typeof dailyValues, value: string) => {
            setDailyValues(prev => ({ ...prev, [day]: Number(value) }));
        };

        const totalWeek = Object.values(dailyValues).reduce((acc, val) => acc + val, 0);
        const avgPigPerDay = currentPigletCount > 0 && totalWeek > 0 ? (totalWeek / 7 / currentPigletCount) * 1000 : 0;

        const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const newRecord: WeeklyConsumptionRecord = {
                id: new Date().toISOString(),
                weekNumber: consumption.length + 1,
                feedType: mockInventory.find(f => f.id === feedType)?.name || 'Desconocido',
                dailyConsumption: dailyValues,
                totalWeek,
                avgPigPerDay
            };
            
            const updatedConsumption = [...consumption, newRecord];
            setConsumption(updatedConsumption);
            localStorage.setItem(getStorageKey('consumption'), JSON.stringify(updatedConsumption));
            
            toast({ title: "Registro Guardado", description: `Se ha guardado el consumo de la semana ${newRecord.weekNumber}.` });
            setIsConsumptionModalOpen(false);
        }

        return (
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Registrar Consumo de la Semana</DialogTitle>
                    <DialogDescription>Ingrese el consumo en kg para cada día de la semana.</DialogDescription>
                </DialogHeader>
                <form id="consumption-form" onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Tipo de Alimento</Label>
                        <Select name="feedType" required onValueChange={setFeedType}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar tipo..." /></SelectTrigger>
                            <SelectContent>
                                {mockInventory.map(feed => (
                                    <SelectItem key={feed.id} value={feed.id}>{feed.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {Object.keys(dailyValues).map(day => (
                            <div key={day} className="space-y-2">
                                <Label htmlFor={day} className="capitalize">{day}</Label>
                                <Input id={day} name={day} type="number" step="0.1" placeholder="kg" onChange={e => handleDailyChange(day as keyof typeof dailyValues, e.target.value)} />
                            </div>
                        ))}
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-center">
                         <div className="p-2 bg-muted rounded-md">
                            <Label className="text-sm font-normal text-muted-foreground">Total Semana (kg)</Label>
                            <p className="font-bold text-lg">{totalWeek.toFixed(2)}</p>
                        </div>
                        <div className="p-2 bg-muted rounded-md">
                            <Label className="text-sm font-normal text-muted-foreground">g/Lechón/Día</Label>
                            <p className="font-bold text-lg">{avgPigPerDay.toFixed(2)}</p>
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsConsumptionModalOpen(false)}>Cancelar</Button>
                    <Button type="submit" form="consumption-form">Guardar Semana</Button>
                </DialogFooter>
            </DialogContent>
        )
    }
    
    const MortalityDialog = () => {
        const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const newRecord: MortalityRecord = {
                id: new Date().toISOString(),
                date: formData.get('date') as string,
                count: Number(formData.get('count')),
                weight: Number(formData.get('weight')),
                cause: formData.get('cause') as string,
                observations: formData.get('observations') as string,
            };

            const updatedMortality = [...mortality, newRecord];
            setMortality(updatedMortality);
            localStorage.setItem(getStorageKey('mortality'), JSON.stringify(updatedMortality));

            toast({ title: "Baja Registrada", description: `Se ha registrado una baja de ${newRecord.count} animal(es).` });
            setIsMortalityModalOpen(false);
        }

        return (
             <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Registrar Baja (Venta o Muerte)</DialogTitle>
                </DialogHeader>
                <form id="mortality-form" onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">Fecha</Label>
                        <Input id="date" name="date" type="date" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="count">Número de Animales</Label>
                        <Input id="count" name="count" type="number" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="weight">Peso Total (kg)</Label>
                        <Input id="weight" name="weight" type="number" step="0.1" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="cause">Causa</Label>
                        <Input id="cause" name="cause" placeholder="Ej: Diarrea, Venta a tercero" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="observations">Observaciones</Label>
                        <Input id="observations" name="observations" />
                    </div>
                </form>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsMortalityModalOpen(false)}>Cancelar</Button>
                    <Button type="submit" form="mortality-form">Guardar Baja</Button>
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
    
    let accumulatedConsumption = 0;

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
                            <p className="font-semibold">{lote.creationDate && isValid(parseISO(lote.creationDate)) ? format(parseISO(lote.creationDate), 'dd/MM/yyyy') : 'N/A'}</p>
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
                            <Label>Número Actual Animales</Label>
                            <p className="font-semibold">{currentPigletCount}</p>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1.5">
                            <CardTitle>Historial de Consumo Semanal</CardTitle>
                        </div>
                        <Button size="sm" onClick={() => setIsConsumptionModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Registrar Semana
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sem</TableHead>
                                    <TableHead>Alimento</TableHead>
                                    <TableHead>Lun</TableHead>
                                    <TableHead>Mar</TableHead>
                                    <TableHead>Mié</TableHead>
                                    <TableHead>Jue</TableHead>
                                    <TableHead>Vie</TableHead>
                                    <TableHead>Sáb</TableHead>
                                    <TableHead>Dom</TableHead>
                                    <TableHead>Total Sem</TableHead>
                                    <TableHead>Acumulado</TableHead>
                                    <TableHead>g/Lechón/Día</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {consumption.length > 0 ? consumption.map(c => {
                                    if (typeof c.totalWeek === 'number') {
                                        accumulatedConsumption += c.totalWeek;
                                    }
                                    return (
                                        <TableRow key={c.id}>
                                            <TableCell>{c.weekNumber}</TableCell>
                                            <TableCell>{c.feedType}</TableCell>
                                            <TableCell>{c.dailyConsumption ? c.dailyConsumption.monday.toFixed(1) : '0.0'}</TableCell>
                                            <TableCell>{c.dailyConsumption ? c.dailyConsumption.tuesday.toFixed(1) : '0.0'}</TableCell>
                                            <TableCell>{c.dailyConsumption ? c.dailyConsumption.wednesday.toFixed(1) : '0.0'}</TableCell>
                                            <TableCell>{c.dailyConsumption ? c.dailyConsumption.thursday.toFixed(1) : '0.0'}</TableCell>
                                            <TableCell>{c.dailyConsumption ? c.dailyConsumption.friday.toFixed(1) : '0.0'}</TableCell>
                                            <TableCell>{c.dailyConsumption ? c.dailyConsumption.saturday.toFixed(1) : '0.0'}</TableCell>
                                            <TableCell>{c.dailyConsumption ? c.dailyConsumption.sunday.toFixed(1) : '0.0'}</TableCell>
                                            <TableCell>{typeof c.totalWeek === 'number' ? c.totalWeek.toFixed(2) : '0.00'}</TableCell>
                                            <TableCell>{typeof accumulatedConsumption === 'number' ? accumulatedConsumption.toFixed(2) : '0.00'}</TableCell>
                                            <TableCell>{typeof c.avgPigPerDay === 'number' ? c.avgPigPerDay.toFixed(2) : '0.00'}</TableCell>
                                        </TableRow>
                                    )
                                }) : (
                                    <TableRow>
                                        <TableCell colSpan={12} className="h-24 text-center">
                                            No hay registros de consumo para este lote.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1.5">
                            <CardTitle>Registro de Bajas (Ventas y Muertes)</CardTitle>
                        </div>
                         <Button size="sm" onClick={() => setIsMortalityModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Registrar Baja
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Nº</TableHead>
                                    <TableHead>Peso (kg)</TableHead>
                                    <TableHead>Causa</TableHead>
                                    <TableHead>Observaciones</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {mortality.length > 0 ? mortality.map((m) => (
                                    <TableRow key={m.id}>
                                        <TableCell>{m.date && isValid(parseISO(m.date)) ? format(parseISO(m.date), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                        <TableCell>{m.count}</TableCell>
                                        <TableCell>{m.weight ? m.weight.toFixed(2) : '0.00'}</TableCell>
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

            <Dialog open={isConsumptionModalOpen} onOpenChange={setIsConsumptionModalOpen}>
                <ConsumptionDialog />
            </Dialog>
            <Dialog open={isMortalityModalOpen} onOpenChange={setIsMortalityModalOpen}>
                <MortalityDialog />
            </Dialog>

        </AppLayout>
    );
}


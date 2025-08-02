
"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, PlusCircle, XCircle } from 'lucide-react';
import { format, parseISO, isValid, addDays, differenceInDays } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface NurseryBatch {
    id: string;
    creationDate: string;
    pigletCount: number;
    avgWeight: number;
    avgAge: number;
    sows: string[];
    status: 'Activo' | 'Finalizado';
    pen?: string;
}

interface WeeklyConsumption {
    id: string;
    weekNumber: number;
    feedType: string;
    dailyConsumption: { [key: string]: number | string };
    totalWeek: number;
    inventory: number;
    accumulated: number;
    avgPigPerDay: number;
}

interface MortalityRecord {
    id: string;
    date: string;
    quantity: number;
    cause: string;
    weight?: number;
    observations?: string;
}

const feedOptions = [
    { id: 'pre-starter-1', name: 'Pre-iniciador 1' },
    { id: 'pre-starter-2', name: 'Pre-iniciador 2' },
    { id: 'starter', name: 'Iniciador' },
];

const daysOfWeek = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];
const weekDayLabels: { [key: string]: string } = {
  saturday: "Sá", sunday: "Do", monday: "Lu", tuesday: "Ma", wednesday: "Mi", thursday: "Ju", friday: "Vi",
};

const DAYS_IN_PRECEBO = 49; 

export default function LotePreceboPage() {
    const router = useRouter();
    const params = useParams();
    const loteId = params.loteId as string;
    const { toast } = useToast();

    const [lote, setLote] = React.useState<NurseryBatch | null>(null);
    const [consumption, setConsumption] = React.useState<WeeklyConsumption[]>([]);
    const [mortality, setMortality] = React.useState<MortalityRecord[]>([]);
    const [isMortalityModalOpen, setIsMortalityModalOpen] = React.useState(false);

    // Load data from localStorage
    React.useEffect(() => {
        if (!loteId) return;
        const storedBatches = localStorage.getItem('nurseryBatches');
        if (storedBatches) {
            const batchData = JSON.parse(storedBatches);
            setLote(batchData[loteId] || null);
        }
        const storedConsumption = localStorage.getItem(`consumption_${loteId}`);
        if (storedConsumption) {
            setConsumption(JSON.parse(storedConsumption));
        }
        const storedMortality = localStorage.getItem(`mortality_${loteId}`);
        if (storedMortality) {
            setMortality(JSON.parse(storedMortality));
        }
    }, [loteId]);

    // Save data to localStorage
    const saveData = (newConsumption: WeeklyConsumption[], newMortality: MortalityRecord[]) => {
        localStorage.setItem(`consumption_${loteId}`, JSON.stringify(newConsumption));
        localStorage.setItem(`mortality_${loteId}`, JSON.stringify(newMortality));
    };

    const totalDeaths = mortality.reduce((sum, record) => sum + record.quantity, 0);
    const currentPigletCount = lote ? lote.pigletCount - totalDeaths : 0;
    
    const handleConsumptionChange = (weekIndex: number, day: string, value: string) => {
        const newConsumption = [...consumption];
        const week = newConsumption[weekIndex];
        
        week.dailyConsumption[day] = value;

        let total = 0;
        daysOfWeek.forEach(d => {
            total += Number(week.dailyConsumption[d]) || 0;
        });
        week.totalWeek = total;

        let accumulated = 0;
        for (let i = 0; i <= weekIndex; i++) {
            accumulated += newConsumption[i].totalWeek || 0;
        }
        week.accumulated = accumulated;
        
        for (let i = weekIndex + 1; i < newConsumption.length; i++) {
             let prevAccumulated = newConsumption[i-1].accumulated;
             newConsumption[i].accumulated = prevAccumulated + (newConsumption[i].totalWeek || 0);
        }

        week.inventory = currentPigletCount;
        week.avgPigPerDay = currentPigletCount > 0 ? (total / 7) / currentPigletCount * 1000 : 0;

        setConsumption(newConsumption);
        saveData(newConsumption, mortality);
    };

    const handleFeedTypeChange = (weekIndex: number, feedType: string) => {
        const newConsumption = [...consumption];
        newConsumption[weekIndex].feedType = feedType;
        setConsumption(newConsumption);
        saveData(newConsumption, mortality);
    };

    const addWeek = () => {
        const newWeek: WeeklyConsumption = {
            id: new Date().toISOString(),
            weekNumber: consumption.length + 1,
            feedType: '',
            dailyConsumption: { saturday: 0, sunday: 0, monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0 },
            totalWeek: 0,
            inventory: currentPigletCount,
            accumulated: consumption.length > 0 ? consumption[consumption.length - 1].accumulated : 0,
            avgPigPerDay: 0
        };
        const newConsumption = [...consumption, newWeek];
        setConsumption(newConsumption);
        saveData(newConsumption, mortality);
    };

    const handleMortalitySubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        
        const newRecord: MortalityRecord = {
            id: new Date().toISOString(),
            date: formData.get('date') as string,
            quantity: Number(formData.get('quantity')),
            cause: formData.get('cause') as string,
            weight: Number(formData.get('weight')) || undefined,
            observations: formData.get('observations') as string || undefined
        };
        
        const newMortality = [...mortality, newRecord].sort((a,b) => {
            if (!a.date || !b.date) return 0;
            return new Date(a.date).getTime() - new Date(b.date).getTime()
        });
        setMortality(newMortality);

        const updatedConsumption = consumption.map(week => ({
            ...week,
            inventory: lote!.pigletCount - newMortality.reduce((sum, record) => sum + record.quantity, 0),
        }));

        setConsumption(updatedConsumption);
        saveData(updatedConsumption, newMortality);

        toast({ title: "Baja registrada", description: "El registro de mortalidad/venta ha sido guardado." });
        setIsMortalityModalOpen(false);
    };

    if (!lote) {
        return (
            <AppLayout>
                <div className="flex justify-center items-center h-full">Cargando datos del lote...</div>
            </AppLayout>
        );
    }
    
    const startDate = isValid(parseISO(lote.creationDate)) ? parseISO(lote.creationDate) : null;
    const endDate = startDate ? addDays(startDate, DAYS_IN_PRECEBO) : null;
    let accumulatedConsumption = 0;


    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => router.push('/precebo')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Hoja de Registro Precebo</h1>
                        </div>
                    </div>
                     <Button variant="outline" onClick={() => setIsMortalityModalOpen(true)}>
                        <XCircle className="mr-2 h-4 w-4" /> Registrar Baja
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Información General</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="space-y-1"><Label>Lote N°</Label><p className="font-semibold">{lote.id}</p></div>
                        <div className="space-y-1"><Label>Corral</Label><p className="font-semibold">{lote.pen || 'N/A'}</p></div>
                        <div className="space-y-1"><Label>Fecha Ingreso</Label><p className="font-semibold">{startDate ? format(startDate, 'dd/MM/yyyy') : 'N/A'}</p></div>
                        <div className="space-y-1"><Label>Fecha Salida</Label><p className="font-semibold">{endDate ? format(endDate, 'dd/MM/yyyy') : 'N/A'}</p></div>
                        <div className="space-y-1"><Label>N° Animales</Label><p className="font-semibold">{lote.pigletCount}</p></div>
                        <div className="space-y-1"><Label>N° Días</Label><p className="font-semibold">{DAYS_IN_PRECEBO}</p></div>
                        <div className="space-y-1"><Label>Peso Prom. Ingreso (kg)</Label><p className="font-semibold">{lote.avgWeight}</p></div>
                        <div className="space-y-1"><Label>Edad Prom. Ingreso (días)</Label><p className="font-semibold">{lote.avgAge}</p></div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Registro de Consumo</CardTitle>
                        <CardDescription>Introduzca los kilos de alimento consumidos directamente en la tabla. Los cálculos se actualizan automáticamente.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[50px]">Sem</TableHead>
                                        <TableHead className="min-w-[150px]">Alimento</TableHead>
                                        {Object.values(weekDayLabels).map(label => <TableHead key={label} className="text-center min-w-[70px]">{label}</TableHead>)}
                                        <TableHead className="text-right min-w-[100px]">Total Semana</TableHead>
                                        <TableHead className="text-right min-w-[100px]">Total Acum.</TableHead>
                                        <TableHead className="text-right min-w-[100px]">Inventario</TableHead>
                                        <TableHead className="text-right min-w-[120px]">Acum./Cerdo</TableHead>
                                        <TableHead className="text-right min-w-[120px]">Cerdo/Día (g)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {consumption.map((c, index) => {
                                        accumulatedConsumption += (c.totalWeek || 0);
                                        const accumulatedPerPig = currentPigletCount > 0 ? accumulatedConsumption / currentPigletCount : 0;
                                        return (
                                            <TableRow key={c.id}>
                                                <TableCell className="font-medium">{c.weekNumber}</TableCell>
                                                <TableCell>
                                                    <Select value={c.feedType} onValueChange={(value) => handleFeedTypeChange(index, value)}>
                                                        <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                                        <SelectContent>
                                                            {feedOptions.map(opt => <SelectItem key={opt.id} value={opt.name}>{opt.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                {daysOfWeek.map(day => (
                                                    <TableCell key={day}>
                                                        <Input 
                                                            type="number" 
                                                            step="0.1" 
                                                            className="text-center"
                                                            value={c.dailyConsumption ? c.dailyConsumption[day] : ''} 
                                                            onChange={(e) => handleConsumptionChange(index, day, e.target.value)}
                                                        />
                                                    </TableCell>
                                                ))}
                                                <TableCell className="text-right font-semibold">{(c.totalWeek || 0).toFixed(2)}</TableCell>
                                                <TableCell className="text-right">{(accumulatedConsumption).toFixed(2)}</TableCell>
                                                <TableCell className="text-right">{currentPigletCount}</TableCell>
                                                <TableCell className="text-right">{accumulatedPerPig.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">{(c.avgPigPerDay || 0).toFixed(0)}</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                         <Button onClick={addWeek} variant="secondary" className="mt-4 w-full">
                            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Semana
                        </Button>
                    </CardContent>
                </Card>
            </div>
            
            <Dialog open={isMortalityModalOpen} onOpenChange={setIsMortalityModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Baja (Mortalidad/Venta)</DialogTitle>
                    </DialogHeader>
                     <form onSubmit={handleMortalitySubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Fecha</Label>
                            <Input id="date" name="date" type="date" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Cantidad</Label>
                                <Input id="quantity" name="quantity" type="number" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="weight">Peso (kg) - Opcional</Label>
                                <Input id="weight" name="weight" type="number" step="0.1" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cause">Causa</Label>
                            <Input id="cause" name="cause" placeholder="Ej: Neumonía, Venta a mercado" required />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="observations">Observaciones</Label>
                             <Input id="observations" name="observations" placeholder="Notas adicionales" />
                        </div>
                         <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsMortalityModalOpen(false)}>Cancelar</Button>
                            <Button type="submit">Guardar Registro</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

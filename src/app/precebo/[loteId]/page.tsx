
"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, PlusCircle, XCircle } from 'lucide-react';
import { format, parseISO, isValid, addDays, startOfWeek, endOfWeek, differenceInDays } from 'date-fns';
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

interface WeeklyConsumption {
    id: string;
    weekNumber: number;
    feedType: string;
    dailyConsumption: { [key: string]: number }; // e.g., { monday: 5, tuesday: 5.5, ... }
    totalWeek: number;
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

export default function LotePreceboPage() {
    const router = useRouter();
    const params = useParams();
    const loteId = params.loteId as string;
    const { toast } = useToast();

    const [lote, setLote] = React.useState<NurseryBatch | null>(null);
    const [consumption, setConsumption] = React.useState<WeeklyConsumption[]>([]);
    const [mortality, setMortality] = React.useState<MortalityRecord[]>([]);
    
    const [isConsumptionModalOpen, setIsConsumptionModalOpen] = React.useState(false);
    const [isMortalityModalOpen, setIsMortalityModalOpen] = React.useState(false);

    // Load data from localStorage
    React.useEffect(() => {
        if (!loteId) return;
        const storedBatches = localStorage.getItem('nurseryBatches');
        if (storedBatches) {
            const batchData = JSON.parse(storedBatches);
            setLote(batchData[loteId]);
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
    React.useEffect(() => {
        if (loteId && consumption.length > 0) {
            localStorage.setItem(`consumption_${loteId}`, JSON.stringify(consumption));
        }
    }, [consumption, loteId]);

     React.useEffect(() => {
        if (loteId && mortality.length > 0) {
            localStorage.setItem(`mortality_${loteId}`, JSON.stringify(mortality));
        }
    }, [mortality, loteId]);

    const handleConsumptionSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        
        let totalWeek = 0;
        const dailyConsumption: { [key: string]: number } = {};
        daysOfWeek.forEach(day => {
            const value = Number(formData.get(day) as string) || 0;
            dailyConsumption[day] = value;
            totalWeek += value;
        });

        const currentPigCount = lote!.pigletCount - mortality.reduce((sum, record) => sum + record.quantity, 0);

        const newRecord: WeeklyConsumption = {
            id: new Date().toISOString(),
            weekNumber: consumption.length + 1,
            feedType: formData.get('feedType') as string,
            dailyConsumption,
            totalWeek,
            avgPigPerDay: totalWeek > 0 && currentPigCount > 0 ? (totalWeek / 7) / currentPigCount : 0,
        };

        setConsumption(prev => [...prev, newRecord].sort((a,b) => a.weekNumber - b.weekNumber));
        toast({ title: "Registro exitoso", description: "El consumo de la semana ha sido guardado." });
        setIsConsumptionModalOpen(false);
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

        setMortality(prev => [...prev, newRecord].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        toast({ title: "Baja registrada", description: "El registro de mortalidad/venta ha sido guardado." });
        setIsMortalityModalOpen(false);
    }
    
    if (!lote) {
        return (
            <AppLayout>
                <div className="flex justify-center items-center h-full">Cargando datos del lote...</div>
            </AppLayout>
        );
    }

    const totalDeaths = mortality.reduce((sum, record) => sum + record.quantity, 0);
    const currentPigletCount = lote.pigletCount - totalDeaths;
    let accumulatedConsumption = 0;

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => router.push('/precebo')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">Registro de Consumo del Lote</h1>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" onClick={() => setIsMortalityModalOpen(true)}>
                            <XCircle className="mr-2 h-4 w-4" /> Registrar Bajas
                        </Button>
                        <Button onClick={() => setIsConsumptionModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Registrar Consumo Semanal
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 text-center">
                            <div className="space-y-1"><Label>Lote N°</Label><p className="font-semibold text-lg">{lote.id}</p></div>
                            <div className="space-y-1"><Label>Corral/Sitio</Label><p className="font-semibold text-lg">Precebo</p></div>
                            <div className="space-y-1"><Label>Fecha Ingreso</Label><p className="font-semibold text-lg">{isValid(parseISO(lote.creationDate)) ? format(parseISO(lote.creationDate), 'dd/MM/yyyy') : 'N/A'}</p></div>
                            <div className="space-y-1"><Label>N° Inicial</Label><p className="font-semibold text-lg">{lote.pigletCount}</p></div>
                            <div className="space-y-1"><Label>N° Actual</Label><p className="font-semibold text-lg text-primary">{currentPigletCount}</p></div>
                            <div className="space-y-1"><Label>Peso Prom. Inicial</Label><p className="font-semibold text-lg">{lote.avgWeight} kg</p></div>
                            <div className="space-y-1"><Label>Edad Inicial</Label><p className="font-semibold text-lg">{lote.avgAge} días</p></div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sem</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    {Object.values(weekDayLabels).map(label => <TableHead key={label} className="text-center">{label}</TableHead>)}
                                    <TableHead className="text-right">Total Semana</TableHead>
                                    <TableHead className="text-right">Total Acum.</TableHead>
                                    <TableHead className="text-center">Inventario</TableHead>
                                    <TableHead className="text-right">Acum./Cerdo</TableHead>
                                    <TableHead className="text-right">Cerdo/Día</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {consumption.map((c, index) => {
                                    accumulatedConsumption += c.totalWeek || 0;
                                    const weekStartDate = addDays(parseISO(lote.creationDate), index * 7);
                                    return (
                                        <TableRow key={c.id}>
                                            <TableCell>{c.weekNumber}</TableCell>
                                            <TableCell>{isValid(weekStartDate) ? format(weekStartDate, 'dd/MM') : 'N/A'}</TableCell>
                                            {daysOfWeek.map(day => (
                                                <TableCell key={day} className="text-center">{c.dailyConsumption && c.dailyConsumption[day] ? c.dailyConsumption[day].toFixed(1) : '0.0'}</TableCell>
                                            ))}
                                            <TableCell className="text-right font-semibold">{c.totalWeek ? c.totalWeek.toFixed(2) : '0.00'}</TableCell>
                                            <TableCell className="text-right">{accumulatedConsumption ? accumulatedConsumption.toFixed(2) : '0.00'}</TableCell>
                                            <TableCell className="text-center">{currentPigletCount}</TableCell>
                                            <TableCell className="text-right">{currentPigletCount > 0 ? (accumulatedConsumption / currentPigletCount).toFixed(2) : '0.00'}</TableCell>
                                            <TableCell className="text-right">{c.avgPigPerDay ? c.avgPigPerDay.toFixed(2) : '0.00'}</TableCell>
                                        </TableRow>
                                    )
                                })}
                                {consumption.length === 0 && <TableRow><TableCell colSpan={15} className="text-center h-24">No hay registros de consumo.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            
            {/* Consumption Dialog */}
            <Dialog open={isConsumptionModalOpen} onOpenChange={setIsConsumptionModalOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Registrar Consumo Semanal</DialogTitle>
                        <DialogDescription>Ingrese los kilos de alimento consumidos cada día.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleConsumptionSubmit} className="space-y-4">
                        <div className="space-y-2">
                             <Label htmlFor="feedType">Tipo de Alimento</Label>
                             <Select name="feedType" required>
                                <SelectTrigger><SelectValue placeholder="Seleccionar alimento..." /></SelectTrigger>
                                <SelectContent>
                                    {feedOptions.map(opt => <SelectItem key={opt.id} value={opt.name}>{opt.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            {daysOfWeek.map(day => (
                                <div key={day} className="space-y-2">
                                    <Label htmlFor={day}>{weekDayLabels[day].charAt(0).toUpperCase() + weekDayLabels[day].slice(1)}</Label>
                                    <Input id={day} name={day} type="number" step="0.1" placeholder="kg" />
                                </div>
                            ))}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsConsumptionModalOpen(false)}>Cancelar</Button>
                            <Button type="submit">Guardar Semana</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Mortality Dialog */}
            <Dialog open={isMortalityModalOpen} onOpenChange={setIsMortalityModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Bajas (Mortalidad/Venta)</DialogTitle>
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

    
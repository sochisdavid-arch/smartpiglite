
"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, PlusCircle, MinusCircle } from 'lucide-react';
import { format, parseISO, isValid, addDays, startOfWeek } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// --- Types ---
interface DailyConsumption {
    saturday: number;
    sunday: number;
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
}

interface WeeklyConsumption {
    id: string; // unique id for the week, e.g., 'week-1'
    weekNumber: number;
    startDate: string;
    dailyConsumption: DailyConsumption;
    totalWeek: number;
    avgPigPerDay: number;
}

interface MortalityRecord {
    id: string;
    date: string;
    quantity: number;
    cause: string;
}

interface NurseryBatch {
    id: string;
    creationDate: string;
    pigletCount: number;
    avgWeight: number;
    avgAge: number;
    sows: string[];
    status: 'Activo' | 'Finalizado';
    corral: string;
}

const initialBatchData: NurseryBatch = {
    id: 'L-P-03',
    creationDate: '2024-07-20',
    pigletCount: 98,
    avgWeight: 6.80,
    avgAge: 22,
    sows: [],
    status: 'Activo',
    corral: 'Precebo 3'
};

const daysOfWeek: (keyof DailyConsumption)[] = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];

export default function LotePreceboPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const loteId = params.loteId as string;

    const [batch, setBatch] = React.useState<NurseryBatch | null>(null);
    const [consumption, setConsumption] = React.useState<WeeklyConsumption[]>([]);
    const [mortality, setMortality] = React.useState<MortalityRecord[]>([]);
    const [isMortalityDialogOpen, setIsMortalityDialogOpen] = React.useState(false);

    const getStorageKey = React.useCallback((type: 'consumption' | 'mortality') => `precebo_${loteId}_${type}`, [loteId]);
    
    // --- Data Loading Effect ---
    React.useEffect(() => {
        // Load batch details
        const storedBatches = localStorage.getItem('nurseryBatches');
        if (storedBatches) {
            const batchData = JSON.parse(storedBatches);
            const foundBatch = Object.values(batchData).find((b: any) => b.id === loteId);
            if (foundBatch) {
                const typedBatch = foundBatch as NurseryBatch;
                // Ensure numeric types are correct
                typedBatch.pigletCount = Number(typedBatch.pigletCount);
                typedBatch.avgWeight = Number(typedBatch.avgWeight);
                typedBatch.avgAge = Number(typedBatch.avgAge);
                setBatch(typedBatch);
            } else {
                setBatch(initialBatchData);
            }
        } else {
             setBatch(initialBatchData);
        }

        // Load consumption data
        const storedConsumption = localStorage.getItem(getStorageKey('consumption'));
        if (storedConsumption) {
            setConsumption(JSON.parse(storedConsumption));
        } else if (batch) {
            const batchStartDate = batch.creationDate;
            // Initialize with 8 empty weeks if no data
            const initialWeeks = Array.from({ length: 8 }, (_, i) => {
                const weekNumber = i + 1;
                const startDate = addDays(parseISO(batchStartDate), i * 7);
                return {
                    id: `week-${weekNumber}`,
                    weekNumber,
                    startDate: format(startDate, 'yyyy-MM-dd'),
                    dailyConsumption: { saturday: 0, sunday: 0, monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0 },
                    totalWeek: 0,
                    avgPigPerDay: 0
                };
            });
            setConsumption(initialWeeks);
        }

        // Load mortality data
        const storedMortality = localStorage.getItem(getStorageKey('mortality'));
        if (storedMortality) {
            setMortality(JSON.parse(storedMortality));
        }
    }, [loteId, getStorageKey, batch]);

    // --- Calculations ---
    const totalMortality = React.useMemo(() => mortality.reduce((sum, record) => sum + record.quantity, 0), [mortality]);
    const currentAnimalCount = batch ? Number(batch.pigletCount) - totalMortality : 0;
    
    // --- Handlers ---
    const handleConsumptionChange = (weekId: string, day: keyof DailyConsumption, value: string) => {
        const numericValue = parseFloat(value) || 0;
        const updatedConsumption = consumption.map(week => {
            if (week.id === weekId) {
                const newDailyConsumption = { ...week.dailyConsumption, [day]: numericValue };
                const newTotalWeek = Object.values(newDailyConsumption).reduce((sum, val) => sum + val, 0);
                const newAvgPigPerDay = currentAnimalCount > 0 ? (newTotalWeek / 7) / currentAnimalCount : 0;
                return { ...week, dailyConsumption: newDailyConsumption, totalWeek: newTotalWeek, avgPigPerDay: newAvgPigPerDay };
            }
            return week;
        });
        setConsumption(updatedConsumption);
        localStorage.setItem(getStorageKey('consumption'), JSON.stringify(updatedConsumption));
    };

    const handleAddWeek = () => {
        const lastWeek = consumption[consumption.length - 1];
        const newWeekNumber = lastWeek ? lastWeek.weekNumber + 1 : 1;
        const newStartDate = lastWeek ? addDays(parseISO(lastWeek.startDate), 7) : new Date();
        
        const newWeek: WeeklyConsumption = {
            id: `week-${newWeekNumber}`,
            weekNumber: newWeekNumber,
            startDate: format(newStartDate, 'yyyy-MM-dd'),
            dailyConsumption: { saturday: 0, sunday: 0, monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0 },
            totalWeek: 0,
            avgPigPerDay: 0,
        };
        const newConsumption = [...consumption, newWeek];
        setConsumption(newConsumption);
        localStorage.setItem(getStorageKey('consumption'), JSON.stringify(newConsumption));
    };

    const handleMortalitySubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newRecord: MortalityRecord = {
            id: new Date().toISOString(),
            date: formData.get('mortalityDate') as string,
            quantity: parseInt(formData.get('mortalityQuantity') as string, 10),
            cause: formData.get('mortalityCause') as string,
        };

        const updatedMortality = [...mortality, newRecord];
        setMortality(updatedMortality);
        localStorage.setItem(getStorageKey('mortality'), JSON.stringify(updatedMortality));

        toast({
            title: "Baja Registrada",
            description: `${newRecord.quantity} bajas registradas por ${newRecord.cause}.`
        });
        setIsMortalityDialogOpen(false);
    };

    // --- Derived Data for Rendering ---
    let accumulatedConsumption = 0;

    if (!batch) {
        return (
            <AppLayout>
                <div className="flex justify-center items-center h-full">Cargando...</div>
            </AppLayout>
        );
    }
    
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => router.push('/precebo')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight">Registro de Consumo del Lote</h1>
                    </div>
                     <Button onClick={() => setIsMortalityDialogOpen(true)}>
                        <MinusCircle className="mr-2 h-4 w-4" />
                        Registrar Baja
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Lote N°</p>
                            <p className="font-semibold">{batch.id}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Corral/Sitio</p>
                            <p className="font-semibold">{batch.corral || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Fecha Ingreso</p>
                            <p className="font-semibold">{isValid(parseISO(batch.creationDate)) ? format(parseISO(batch.creationDate), 'dd/MM/yyyy') : 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">N° Inicial</p>
                            <p className="font-semibold">{Number(batch.pigletCount)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">N° Actual</p>
                            <p className="font-semibold">{currentAnimalCount}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Peso Prom. Inicial</p>
                            <p className="font-semibold">{Number(batch.avgWeight).toFixed(2)} kg</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Edad Inicial</p>
                            <p className="font-semibold">{Number(batch.avgAge)} días</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table className="min-w-full">
                                <TableHeader>
                                    <TableRow>
                                        {['Sem', 'Fecha', 'Sá', 'Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Total Semana', 'Total Acum.', 'Inventario', 'Acum./Cerdo', 'Cerdo/Día'].map(h => <TableHead key={h}>{h}</TableHead>)}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {consumption.map((weekData) => {
                                        accumulatedConsumption += (weekData.totalWeek || 0);
                                        return (
                                            <TableRow key={weekData.id}>
                                                <TableCell>{weekData.weekNumber}</TableCell>
                                                <TableCell>{weekData.startDate && isValid(parseISO(weekData.startDate)) ? format(parseISO(weekData.startDate), 'dd/MM') : 'N/A'}</TableCell>
                                                {daysOfWeek.map(day => (
                                                    <TableCell key={day} className="p-1">
                                                        <Input 
                                                            type="number" 
                                                            step="0.1" 
                                                            className="h-8 w-20"
                                                            value={weekData.dailyConsumption?.[day] || 0}
                                                            onChange={(e) => handleConsumptionChange(weekData.id, day, e.target.value)}
                                                            placeholder="kg"
                                                        />
                                                    </TableCell>
                                                ))}
                                                <TableCell>{(weekData.totalWeek || 0).toFixed(2)}</TableCell>
                                                <TableCell>{accumulatedConsumption.toFixed(2)}</TableCell>
                                                <TableCell>{currentAnimalCount}</TableCell>
                                                <TableCell>{(currentAnimalCount > 0 ? accumulatedConsumption / currentAnimalCount : 0).toFixed(2)}</TableCell>
                                                <TableCell>{(weekData.avgPigPerDay || 0).toFixed(3)}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter className="p-2 justify-center">
                         <Button variant="outline" onClick={handleAddWeek}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir Semana
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Mortality Dialog */}
            <Dialog open={isMortalityDialogOpen} onOpenChange={setIsMortalityDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Baja</DialogTitle>
                        <DialogDescription>
                            Registre las muertes o ventas del lote para mantener el inventario actualizado.
                        </DialogDescription>
                    </DialogHeader>
                    <form id="mortality-form" onSubmit={handleMortalitySubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="mortalityDate" className="text-right">Fecha</Label>
                                <Input id="mortalityDate" name="mortalityDate" type="date" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="mortalityQuantity" className="text-right">Cantidad</Label>
                                <Input id="mortalityQuantity" name="mortalityQuantity" type="number" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="mortalityCause" className="text-right">Causa</Label>
                                <Input id="mortalityCause" name="mortalityCause" placeholder="Ej: Diarrea, Venta" className="col-span-3" required />
                            </div>
                        </div>
                    </form>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setIsMortalityDialogOpen(false)}>Cancelar</Button>
                        <Button type="submit" form="mortality-form">Guardar Baja</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}

    
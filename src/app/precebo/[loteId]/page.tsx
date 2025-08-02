
"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, PlusCircle, MinusCircle } from 'lucide-react';
import { format, parseISO, isValid, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockInventory } from '@/lib/mock-data';

// --- Types ---
interface DailyConsumption {
    [dayIndex: number]: number;
}

interface WeeklyConsumption {
    id: string;
    weekNumber: number;
    startDate: string;
    feedType: string;
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
    daysInPrecebo: number;
}

const feedOptions = mockInventory.filter(p => p.category === 'alimento');

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
    
    React.useEffect(() => {
        const storedBatches = localStorage.getItem('nurseryBatches');
        let currentBatch: NurseryBatch | null = null;
        if (storedBatches) {
            const batchData = JSON.parse(storedBatches);
            const foundBatch = Object.values(batchData).find((b: any) => b.id === loteId);
            if (foundBatch) {
                currentBatch = foundBatch as NurseryBatch;
                currentBatch.pigletCount = Number(currentBatch.pigletCount) || 0;
                currentBatch.avgWeight = Number(currentBatch.avgWeight) || 0;
                currentBatch.avgAge = Number(currentBatch.avgAge) || 0;
                currentBatch.daysInPrecebo = currentBatch.daysInPrecebo || 42;
            }
        }
        setBatch(currentBatch);

        if (currentBatch && isValid(parseISO(currentBatch.creationDate))) {
            const storedConsumption = localStorage.getItem(getStorageKey('consumption'));
            if (storedConsumption) {
                setConsumption(JSON.parse(storedConsumption));
            } else {
                 const batchStartDate = currentBatch.creationDate;
                 const initialWeeks = Array.from({ length: 8 }, (_, i) => {
                     const weekNumber = i + 1;
                     const startDate = addDays(parseISO(batchStartDate), i * 7);
                     return {
                         id: `week-${weekNumber}`,
                         weekNumber,
                         startDate: format(startDate, 'yyyy-MM-dd'),
                         feedType: '',
                         dailyConsumption: {},
                         totalWeek: 0,
                         avgPigPerDay: 0
                     };
                 });
                 setConsumption(initialWeeks);
            }

            const storedMortality = localStorage.getItem(getStorageKey('mortality'));
            if (storedMortality) {
                setMortality(JSON.parse(storedMortality));
            }
        }
    }, [loteId, getStorageKey]);

    const totalMortality = React.useMemo(() => mortality.reduce((sum, record) => sum + record.quantity, 0), [mortality]);
    const currentAnimalCount = batch ? Number(batch.pigletCount) - totalMortality : 0;
    
    const updateConsumption = (updatedConsumption: WeeklyConsumption[]) => {
        const recalculated = updatedConsumption.map(week => {
            const newTotalWeek = Object.values(week.dailyConsumption || {}).reduce((sum, val) => sum + Number(val || 0), 0);
            const newAvgPigPerDay = currentAnimalCount > 0 ? (newTotalWeek / 7) / currentAnimalCount : 0;
            return { 
                ...week, 
                totalWeek: newTotalWeek, 
                avgPigPerDay: newAvgPigPerDay 
            };
        });
        setConsumption(recalculated);
        localStorage.setItem(getStorageKey('consumption'), JSON.stringify(recalculated));
    }
    
    const handleConsumptionChange = (weekId: string, dayIndex: number, value: string) => {
        const numericValue = parseFloat(value) || 0;
        const updated = consumption.map(week => 
            week.id === weekId 
            ? { ...week, dailyConsumption: { ...(week.dailyConsumption || {}), [dayIndex]: numericValue } }
            : week
        );
        updateConsumption(updated);
    };

    const handleFeedTypeChange = (weekId: string, value: string) => {
        const updated = consumption.map(week => 
            week.id === weekId ? { ...week, feedType: value } : week
        );
        setConsumption(updated);
        localStorage.setItem(getStorageKey('consumption'), JSON.stringify(updated));
    }

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
        updateConsumption(consumption);

        toast({
            title: "Baja Registrada",
            description: `${newRecord.quantity} bajas registradas por ${newRecord.cause}.`
        });
        setIsMortalityDialogOpen(false);
    };
    
    if (!batch) {
        return (
            <AppLayout>
                <div className="flex justify-center items-center h-full">Cargando datos del lote...</div>
            </AppLayout>
        );
    }
    
    const getWeekDayHeaders = (startDateString: string) => {
        if (!startDateString || !isValid(parseISO(startDateString))) return [];
        const baseDate = parseISO(startDateString);
        return Array.from({ length: 7 }).map((_, i) => {
            const day = addDays(baseDate, i);
            return {
                dayIndex: day.getDay(),
                label: format(day, 'EEE', { locale: es }),
            };
        });
    };
    
    const exitDate = isValid(parseISO(batch.creationDate)) ? format(addDays(parseISO(batch.creationDate), batch.daysInPrecebo), 'dd/MM/yyyy') : 'N/A';
    
    const weekDayHeaders = getWeekDayHeaders(batch.creationDate);

    const formatWeekRange = (startDateString: string) => {
        if (!startDateString || !isValid(parseISO(startDateString))) return 'N/A';
        const startDate = parseISO(startDateString);
        const endDate = addDays(startDate, 6);
        return `${format(startDate, 'dd/MMM', { locale: es })} al ${format(endDate, 'dd/MMM', { locale: es })}`;
    };
    
    let accumulatedConsumption = 0;

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
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Información General</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 text-center">
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
                            <p className="text-sm font-medium text-muted-foreground">Fecha Salida</p>
                            <p className="font-semibold">{exitDate}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">N° Inicial</p>
                            <p className="font-semibold">{batch.pigletCount}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">N° Días</p>
                            <p className="font-semibold">{batch.daysInPrecebo}</p>
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
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Historial de Consumo</CardTitle>
                             <Button size="sm" variant="outline" onClick={() => setIsMortalityDialogOpen(true)}>
                                <MinusCircle className="mr-2 h-4 w-4" />
                                Registrar Baja
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table className="min-w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sem</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Alimento</TableHead>
                                        {weekDayHeaders.map(h => (
                                            <TableHead key={h.dayIndex} className="capitalize text-center">
                                                {h.label}
                                            </TableHead>
                                        ))}
                                        <TableHead>Total Semana</TableHead>
                                        <TableHead>Total Acum.</TableHead>
                                        <TableHead>Inventario</TableHead>
                                        <TableHead>Acum./Cerdo</TableHead>
                                        <TableHead>Cerdo/Día</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {consumption.map((weekData) => {
                                        accumulatedConsumption += Number(weekData.totalWeek || 0);
                                        const weekDays = getWeekDayHeaders(weekData.startDate);
                                        return (
                                            <TableRow key={weekData.id}>
                                                <TableCell>{weekData.weekNumber}</TableCell>
                                                <TableCell>{formatWeekRange(weekData.startDate)}</TableCell>
                                                <TableCell className="p-1">
                                                     <Select value={weekData.feedType} onValueChange={(value) => handleFeedTypeChange(weekData.id, value)}>
                                                         <SelectTrigger className="h-8 w-40">
                                                             <SelectValue placeholder="Seleccionar" />
                                                         </SelectTrigger>
                                                         <SelectContent>
                                                             {feedOptions.map(option => (
                                                                 <SelectItem key={option.id} value={option.id}>{option.name} ({option.stock}kg)</SelectItem>
                                                             ))}
                                                         </SelectContent>
                                                     </Select>
                                                </TableCell>
                                                {weekDays.map(day => (
                                                    <TableCell key={day.dayIndex} className="p-1">
                                                        <Input 
                                                            type="number" 
                                                            step="0.1" 
                                                            className="h-8 w-20 text-center"
                                                            value={weekData.dailyConsumption?.[day.dayIndex] || ''}
                                                            onChange={(e) => handleConsumptionChange(weekData.id, day.dayIndex, e.target.value)}
                                                            placeholder="kg"
                                                        />
                                                    </TableCell>
                                                ))}
                                                <TableCell className="text-center">{Number(weekData.totalWeek || 0).toFixed(2)}</TableCell>
                                                <TableCell className="text-center">{accumulatedConsumption.toFixed(2)}</TableCell>
                                                <TableCell className="text-center">{currentAnimalCount}</TableCell>
                                                <TableCell className="text-center">{(currentAnimalCount > 0 ? accumulatedConsumption / currentAnimalCount : 0).toFixed(2)}</TableCell>
                                                <TableCell className="text-center">{Number(weekData.avgPigPerDay || 0).toFixed(3)}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

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

    
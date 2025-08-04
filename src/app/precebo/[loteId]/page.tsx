
"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle, Syringe, Move, Banknote, PackagePlus, ShieldPlus, Skull, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format, parseISO, isValid, addDays, getDay, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockInventory } from '@/lib/mock-data';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PreceboReportData } from '@/components/PreceboReport';


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
    events: BatchEvent[];
}

interface ConsumptionRecord {
    id: string;
    weekNumber: number;
    startDate: string;
    endDate: string;
    feedType: string;
    consumption: (number | string)[];
    totalWeek: number;
    totalAccumulated: number;
    accumulatedPerPig: number;
    consumptionPerPigPerDay: number;
}

type PreceboEventType = "Muerte en lote" | "Traslado de lote" | "Venta de lote" | "Ingreso a lote" | "Tratamiento" | "Vacunación";

interface BatchEvent {
    id: string;
    type: PreceboEventType;
    date: string;
    details?: string;
    animalCount?: number;
    totalWeight?: number;
    avgWeight?: number;
    cause?: string;
    product?: string;
    dose?: number;
    destination?: string;
    saleValue?: number;
}

const eventIcons: { [key in PreceboEventType]: React.ReactElement } = {
    "Muerte en lote": <Skull className="h-5 w-5 text-destructive" />,
    "Traslado de lote": <Move className="h-5 w-5 text-blue-500" />,
    "Venta de lote": <Banknote className="h-5 w-5 text-green-500" />,
    "Ingreso a lote": <PackagePlus className="h-5 w-5 text-purple-500" />,
    "Tratamiento": <Syringe className="h-5 w-5 text-red-500" />,
    "Vacunación": <ShieldPlus className="h-5 w-5 text-green-500" />,
};

const allEventTypes: PreceboEventType[] = ["Muerte en lote", "Traslado de lote", "Venta de lote", "Ingreso a lote", "Tratamiento", "Vacunación"];

export default function LotePreceboPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const loteId = params.loteId as string;
    
    const [batch, setBatch] = React.useState<NurseryBatch | null>(null);
    const [consumptionHistory, setConsumptionHistory] = React.useState<ConsumptionRecord[]>([]);
    
    const [isEventFormOpen, setIsEventFormOpen] = React.useState(false);
    const [selectedEventType, setSelectedEventType] = React.useState<PreceboEventType | null>(null);
    const [editingEvent, setEditingEvent] = React.useState<BatchEvent | null>(null);
    const [eventToDelete, setEventToDelete] = React.useState<BatchEvent | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);


    const getConsumptionStorageKey = React.useCallback(() => `consumptionHistory_precebo_${loteId}`, [loteId]);
    
    const loadData = React.useCallback(() => {
        const storedBatches = localStorage.getItem('nurseryBatches');
        if (storedBatches) {
            const batchData = JSON.parse(storedBatches);
            const foundBatch = batchData[loteId];
            if (foundBatch) {
                const processedBatch: NurseryBatch = {
                    ...foundBatch,
                    pigletCount: Number(foundBatch.pigletCount),
                    initialPigletCount: Number(foundBatch.initialPigletCount || foundBatch.pigletCount),
                    totalWeight: Number(foundBatch.totalWeight),
                    avgWeight: Number(foundBatch.avgWeight),
                    avgAge: Number(foundBatch.avgAge),
                    events: foundBatch.events || [],
                };
                setBatch(processedBatch);

                const storageKey = getConsumptionStorageKey();
                const storedConsumption = localStorage.getItem(storageKey);
                let history: ConsumptionRecord[] = storedConsumption ? JSON.parse(storedConsumption) : [];
                
                if (history.length < 8 && foundBatch.creationDate) {
                    const additionalWeeks = Array.from({ length: 8 - history.length }).map((_, weekIndex) => {
                        const currentWeekIndex = history.length + weekIndex;
                        const weekStartDate = addDays(parseISO(foundBatch.creationDate), currentWeekIndex * 7);
                        const weekEndDate = addDays(weekStartDate, 6);
                        return {
                            id: `week-${currentWeekIndex + 1}`,
                            weekNumber: currentWeekIndex + 1,
                            startDate: weekStartDate.toISOString(),
                            endDate: weekEndDate.toISOString(),
                            feedType: '',
                            consumption: Array(7).fill(''),
                            totalWeek: 0,
                            totalAccumulated: 0,
                            accumulatedPerPig: 0,
                            consumptionPerPigPerDay: 0,
                        };
                    });
                    history = [...history, ...additionalWeeks];
                }
                setConsumptionHistory(history);
            }
        }
    }, [loteId, getConsumptionStorageKey]);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    const calculateConsumption = (history: ConsumptionRecord[], currentBatch: NurseryBatch) => {
        let accumulatedFeed = 0;
        const deaths = currentBatch.events.filter(e => e.type === 'Muerte en lote').reduce((sum, e) => sum + (e.animalCount || 0), 0);
        const currentAnimalCount = currentBatch.initialPigletCount - deaths;

        const calculatedHistory = history.map(week => {
            const weeklyConsumption = week.consumption.reduce((sum, val) => sum + Number(val || 0), 0);
            accumulatedFeed += weeklyConsumption;
            
            const accumulatedPerPig = currentAnimalCount > 0 ? accumulatedFeed / currentAnimalCount : 0;
            const consumptionPerPigPerDay = currentAnimalCount > 0 ? weeklyConsumption / currentAnimalCount / 7 : 0;

            return {
                ...week,
                totalWeek: weeklyConsumption,
                totalAccumulated: accumulatedFeed,
                accumulatedPerPig,
                consumptionPerPigPerDay,
            };
        });

        setConsumptionHistory(calculatedHistory);
        localStorage.setItem(getConsumptionStorageKey(), JSON.stringify(calculatedHistory));
        if (batch && currentAnimalCount !== batch.pigletCount) {
             setBatch(prev => prev ? {...prev, pigletCount: currentAnimalCount} : null);
        }
    };

    const handleConsumptionChange = (weekId: string, dayIndex: number, value: string) => {
        if (!batch) return;
        const updatedHistory = consumptionHistory.map(week => {
            if (week.id === weekId) {
                const newConsumption = [...week.consumption];
                newConsumption[dayIndex] = value;
                return { ...week, consumption: newConsumption };
            }
            return week;
        });
        calculateConsumption(updatedHistory, batch);
    };

    const handleFeedTypeChange = (weekId: string, feedType: string) => {
        if (!batch) return;
        const updatedHistory = consumptionHistory.map(week =>
            week.id === weekId ? { ...week, feedType } : week
        );
        calculateConsumption(updatedHistory, batch);
    };
    
    const openEventDialog = (eventType: PreceboEventType) => {
        setSelectedEventType(eventType);
        setEditingEvent(null);
        setIsEventFormOpen(true);
    };

    const openEditEventDialog = (event: BatchEvent) => {
        setSelectedEventType(event.type);
        setEditingEvent(event);
        setIsEventFormOpen(true);
    };

    const openDeleteEventDialog = (event: BatchEvent) => {
        setEventToDelete(event);
        setIsDeleteDialogOpen(true);
    };

    const EventForm = () => {
        if (!selectedEventType || !batch) return null;
    
        const [animalCount, setAnimalCount] = React.useState<number | string>(editingEvent?.animalCount || '');
        const [totalWeight, setTotalWeight] = React.useState<number | string>(editingEvent?.totalWeight || '');
        const [avgWeight, setAvgWeight] = React.useState<number | string>(editingEvent?.avgWeight || '0.00');

        React.useEffect(() => {
            const numCount = Number(animalCount);
            const numTotalWeight = Number(totalWeight);
            if (numCount > 0 && numTotalWeight > 0) {
                setAvgWeight((numTotalWeight / numCount).toFixed(2));
            } else {
                setAvgWeight('0.00');
            }
        }, [animalCount, totalWeight]);


        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);

            const newEvent: BatchEvent = {
                id: editingEvent ? editingEvent.id : `evt-${Date.now()}`,
                type: selectedEventType,
                date: formData.get('eventDate') as string,
                details: formData.get('eventNotes') as string || undefined,
                animalCount: Number(formData.get('animalCount')) || undefined,
                totalWeight: Number(formData.get('totalWeight')) || undefined,
                avgWeight: Number(avgWeight) || undefined,
                cause: formData.get('cause') as string || undefined,
                product: formData.get('product') as string || undefined,
                dose: Number(formData.get('dose')) || undefined,
                destination: formData.get('destination') as string || undefined,
                saleValue: Number(formData.get('saleValue')) || undefined,
            };
            
            let updatedBatch = { ...batch };
            if (editingEvent) {
                updatedBatch.events = updatedBatch.events.map(ev => ev.id === editingEvent.id ? newEvent : ev);
            } else {
                updatedBatch.events = [...updatedBatch.events, newEvent];
            }

            if(newEvent.type === 'Muerte en lote' && newEvent.animalCount) {
                const totalDeaths = updatedBatch.events
                    .filter(ev => ev.type === 'Muerte en lote')
                    .reduce((sum, current) => sum + (current.animalCount || 0), 0);
                updatedBatch.pigletCount = updatedBatch.initialPigletCount - totalDeaths;
            }

            if (['Traslado de lote', 'Venta de lote'].includes(selectedEventType)) {
                updatedBatch.status = 'Finalizado';
                generateLiquidationReport(updatedBatch, newEvent);
                
                if (selectedEventType === 'Traslado de lote') {
                    createCebaBatch(updatedBatch, newEvent);
                }

                toast({
                    title: "¡Lote Finalizado!",
                    description: `El lote ${loteId} ha sido marcado como finalizado. Se ha generado un informe de liquidación.`,
                });
                router.push('/analysis/liquidated-batches');
            } else {
                 toast({
                    title: `¡Evento ${editingEvent ? 'Actualizado' : 'Registrado'}!`,
                    description: `El evento "${selectedEventType}" ha sido ${editingEvent ? 'actualizado' : 'registrado'} para el lote ${loteId}.`,
                });
            }

            setBatch(updatedBatch);
            const storedBatches = JSON.parse(localStorage.getItem('nurseryBatches') || '{}');
            storedBatches[loteId] = updatedBatch;
            localStorage.setItem('nurseryBatches', JSON.stringify(storedBatches));

            calculateConsumption(consumptionHistory, updatedBatch);
            
            setIsEventFormOpen(false);
            setEditingEvent(null);
        }
        
        return (
            <DialogContent className="max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{editingEvent ? 'Editar' : 'Registrar'} Evento: {selectedEventType}</DialogTitle>
                    <DialogDescription>
                        Complete la información del evento para el lote {loteId}.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto -mx-6 px-6">
                    <ScrollArea className="h-full pr-6">
                        <form onSubmit={handleSubmit} id="event-form" className="space-y-4 pt-2 pb-6">
                            <div className="space-y-2">
                                <Label htmlFor="eventDate">Fecha del Evento</Label>
                                <Input id="eventDate" name="eventDate" type="date" required defaultValue={editingEvent?.date} />
                            </div>

                            {['Tratamiento', 'Vacunación'].includes(selectedEventType) && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="product">Producto</Label>
                                        <Select name="product" required defaultValue={editingEvent?.product}>
                                            <SelectTrigger><SelectValue placeholder={`Seleccionar ${selectedEventType === 'Tratamiento' ? 'medicamento' : 'vacuna'}`} /></SelectTrigger>
                                            <SelectContent>
                                                {mockInventory.filter(p => p.category === (selectedEventType === 'Tratamiento' ? 'medicamento' : 'vacuna')).map(item => (
                                                    <SelectItem key={item.id} value={item.id}>{item.name} (Stock: {item.stock})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="animalCount">Número de Animales</Label>
                                        <Input id="animalCount" name="animalCount" type="number" placeholder="Ej: 120" required defaultValue={editingEvent?.animalCount} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dose">Dosis por Animal (ml)</Label>
                                        <Input id="dose" name="dose" type="number" step="0.1" placeholder="Ej. 2.0" required defaultValue={editingEvent?.dose}/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="treatmentReason">Motivo / Enfermedad</Label>
                                        <Input id="treatmentReason" name="treatmentReason" placeholder="Ej: Preventivo, tratamiento para diarrea" required defaultValue={editingEvent?.details}/>
                                    </div>
                                </>
                            )}
                            
                            {selectedEventType === 'Muerte en lote' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="animalCount">Número de Animales</Label>
                                        <Input id="animalCount" name="animalCount" type="number" required defaultValue={editingEvent?.animalCount}/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="avgWeight">Peso Promedio (kg) - Opcional</Label>
                                        <Input id="avgWeight" name="avgWeight" type="number" step="0.1" placeholder="Ej. 15.5" defaultValue={editingEvent?.avgWeight}/>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="cause">Causa</Label>
                                        <Input id="cause" name="cause" placeholder="Causa de la muerte" required defaultValue={editingEvent?.cause}/>
                                    </div>
                                </>
                            )}
                            
                            {['Venta de lote', 'Ingreso a lote', 'Traslado de lote'].includes(selectedEventType) && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="animalCount">Número de Animales</Label>
                                        <Input id="animalCount" name="animalCount" type="number" required value={animalCount} onChange={e => setAnimalCount(e.target.value)} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="totalWeight">Peso Total del Grupo (kg)</Label>
                                        <Input id="totalWeight" name="totalWeight" type="number" step="0.1" required value={totalWeight} onChange={e => setTotalWeight(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Peso Promedio por Animal (kg)</Label>
                                        <Input value={avgWeight} readOnly className="font-semibold bg-muted" />
                                    </div>
                                </>
                            )}

                            {selectedEventType === 'Venta de lote' && (
                                 <div className="space-y-2">
                                    <Label htmlFor="saleValue">Valor Total de Venta ($)</Label>
                                    <Input id="saleValue" name="saleValue" type="number" step="0.01" placeholder="Valor total" defaultValue={editingEvent?.saleValue}/>
                                </div>
                            )}

                            {selectedEventType === 'Traslado de lote' && (
                                 <>
                                     <div className="space-y-2">
                                        <Label htmlFor="destination">Destino del Lote</Label>
                                        <Input id="destination" name="destination" placeholder="Ej: Módulo de Ceba 1" required defaultValue={editingEvent?.destination}/>
                                    </div>
                                 </>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="eventNotes">Notas Adicionales</Label>
                                <Textarea id="eventNotes" name="eventNotes" placeholder="Cualquier nota adicional relevante para este evento." defaultValue={editingEvent?.details}/>
                            </div>
                        </form>
                    </ScrollArea>
                </div>
                <DialogFooter className="flex-shrink-0 pt-4 border-t -mx-6 px-6 bg-background">
                    <Button type="button" variant="ghost" onClick={() => { setIsEventFormOpen(false); setEditingEvent(null); }}>Cancelar</Button>
                    <Button type="submit" form="event-form">Guardar Evento</Button>
                </DialogFooter>
            </DialogContent>
        )
    }

     const generateLiquidationReport = (finalBatch: NurseryBatch, finalEvent: BatchEvent) => {
        const deathsEvents = finalBatch.events.filter(e => e.type === 'Muerte en lote');
        const totalDeaths = deathsEvents.reduce((sum, e) => sum + (e.animalCount || 0), 0);
        
        const finalCount = (finalEvent.animalCount || finalBatch.pigletCount);
        const daysInPrecebo = differenceInDays(parseISO(finalEvent.date), parseISO(finalBatch.creationDate));
        const finalAge = finalBatch.avgAge + daysInPrecebo;
        const totalFeedConsumed = consumptionHistory.reduce((sum, week) => sum + week.totalWeek, 0);
        
        const finalAvgWeight = finalEvent.avgWeight || 0;
        const finalTotalWeight = finalAvgWeight * finalCount;
        const totalWeightGain = finalTotalWeight - finalBatch.totalWeight;

        const animalWeightGain = finalCount > 0 ? totalWeightGain / finalCount : 0;
        const dailyWeightGain = finalCount > 0 && daysInPrecebo > 0 ? (totalWeightGain / finalCount) / daysInPrecebo * 1000 : 0; // in grams
        const feedConversion = totalWeightGain > 0 ? totalFeedConsumed / totalWeightGain : 0;
        
        const report: PreceboReportData = {
            batchId: finalBatch.id,
            generationDate: new Date().toISOString(),
            liquidationReason: finalEvent.type,
            startDate: finalBatch.creationDate,
            endDate: finalEvent.date,
            initialCount: finalBatch.initialPigletCount,
            finalCount: finalCount,
            initialAge: finalBatch.avgAge,
            finalAge: finalAge,
            daysInPrecebo: daysInPrecebo,
            weeksOfLife: Math.floor(finalAge / 7),
            totalDeaths: totalDeaths,
            mortalityRate: finalBatch.initialPigletCount > 0 ? (totalDeaths / finalBatch.initialPigletCount) * 100 : 0,
            avgMortalityAge: 0, // Needs logic to be calculated
            initialTotalWeight: finalBatch.totalWeight,
            finalTotalWeight: finalTotalWeight,
            initialAvgWeight: finalBatch.avgWeight,
            finalAvgWeight: finalAvgWeight,
            totalWeightGain: totalWeightGain,
            animalWeightGain: animalWeightGain,
            dailyWeightGain: dailyWeightGain,
            totalFeedConsumed: totalFeedConsumed,
            dailyAnimalConsumption: finalCount > 0 && daysInPrecebo > 0 ? (totalFeedConsumed / finalCount) / daysInPrecebo : 0,
            feedConversion: feedConversion,
            healthRecords: finalBatch.events.filter(e => e.type === 'Tratamiento' || e.type === 'Vacunación').map(e => ({
                date: e.date,
                type: e.type,
                product: mockInventory.find(p => p.id === e.product)?.name || e.product || 'N/A',
                details: e.details || `Aplicado a ${e.animalCount} animales.`
            })),
        };

        const existingReports = JSON.parse(localStorage.getItem('liquidatedPreceboReports') || '[]');
        existingReports.push(report);
        localStorage.setItem('liquidatedPreceboReports', JSON.stringify(existingReports));
    };

    const createCebaBatch = (preceboBatch: NurseryBatch, transferEvent: BatchEvent) => {
        const cebaBatches = JSON.parse(localStorage.getItem('cebaBatches') || '{}');
        const newCebaId = preceboBatch.id.replace('PRECEBO', 'CEBA');
        const daysInPrecebo = differenceInDays(parseISO(transferEvent.date), parseISO(preceboBatch.creationDate));

        const newCebaBatch = {
            id: newCebaId,
            creationDate: transferEvent.date,
            pigletCount: transferEvent.animalCount,
            initialPigletCount: transferEvent.animalCount,
            avgWeight: transferEvent.avgWeight,
            totalWeight: (transferEvent.animalCount || 0) * (transferEvent.avgWeight || 0),
            avgAge: preceboBatch.avgAge + daysInPrecebo,
            sows: preceboBatch.sows,
            status: 'Activo',
            events: [],
            originBatchId: preceboBatch.id,
            module: transferEvent.destination || 'CEBA-01'
        };

        cebaBatches[newCebaId] = newCebaBatch;
        localStorage.setItem('cebaBatches', JSON.stringify(cebaBatches));

        toast({
            title: "¡Lote Transferido a Ceba!",
            description: `El lote ${newCebaId} ha sido creado en el módulo de ceba.`,
        });
    };

    const handleDeleteEvent = () => {
        if (!eventToDelete || !batch) return;

        const updatedBatch = {
            ...batch,
            events: batch.events.filter(ev => ev.id !== eventToDelete.id)
        };
        
        setBatch(updatedBatch);
        
        const storedBatches = JSON.parse(localStorage.getItem('nurseryBatches') || '{}');
        storedBatches[loteId] = updatedBatch;
        localStorage.setItem('nurseryBatches', JSON.stringify(storedBatches));
        
        toast({
            title: "Evento Eliminado",
            description: `El evento "${eventToDelete.type}" ha sido eliminado.`,
        });

        setIsDeleteDialogOpen(false);
        setEventToDelete(null);
    };

    if (!batch) {
        return (
            <AppLayout>
                <div className="flex justify-center items-center h-full">
                    <p>Cargando datos del lote...</p>
                </div>
            </AppLayout>
        );
    }
    
    const feedOptions = mockInventory.filter(p => p.category === 'alimento');
    const daysOfWeek = (batch && isValid(parseISO(batch.creationDate))) ? (() => {
        const startDate = parseISO(batch.creationDate);
        const startDayIndex = getDay(startDate) === 0 ? 6 : getDay(startDate) - 1; 
        const dayNames = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
        return [...dayNames.slice(startDayIndex), ...dayNames.slice(0, startDayIndex)];
    })() : ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];


    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => router.push('/precebo')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight">Registro de Consumo del Lote: {loteId}</h1>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button disabled={batch.status === 'Finalizado'}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Agregar Evento
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {allEventTypes.map(eventType => (
                                <DropdownMenuItem key={eventType} onSelect={() => openEventDialog(eventType)}>
                                    <div className="flex items-center gap-2">
                                        {eventIcons[eventType]}
                                        <span>{eventType}</span>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Información del Lote</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 text-sm">
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground">Lote N°</span>
                            <span className="font-semibold">{batch.id}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground">Módulo Precebo</span>
                            <span className="font-semibold">{batch.module || 'PRE-01'}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground">Fecha Ingreso</span>
                            <span className="font-semibold">{isValid(parseISO(batch.creationDate)) ? format(parseISO(batch.creationDate), 'dd/MM/yyyy') : 'N/A'}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground">Nº Inicial</span>
                            <span className="font-semibold">{Number(batch.initialPigletCount).toFixed(0)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground">Nº Actual</span>
                            <span className="font-semibold">{Number(batch.pigletCount).toFixed(0)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground">Peso Total (kg)</span>
                            <span className="font-semibold">{Number(batch.totalWeight).toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground">Peso Prom. (kg)</span>
                            <span className="font-semibold">{Number(batch.avgWeight).toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground">Edad Inicial (días)</span>
                            <span className="font-semibold">{batch.avgAge}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Registro de Consumo Semanal</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[80px]">Semana</TableHead>
                                    <TableHead className="min-w-[150px]">Fecha</TableHead>
                                    <TableHead className="min-w-[200px]">Alimento</TableHead>
                                    {daysOfWeek.map(day => (
                                        <TableHead key={day} className="capitalize min-w-[70px] text-center">{day}</TableHead>
                                    ))}
                                    <TableHead className="min-w-[120px]">Total Semana</TableHead>
                                    <TableHead className="min-w-[130px]">Total Acumulado</TableHead>
                                    <TableHead className="min-w-[130px]">Acumulado/Cerdo</TableHead>
                                    <TableHead className="min-w-[140px]">Consumo Cerdo/Día</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {consumptionHistory.map((weekData) => (
                                    <TableRow key={weekData.id}>
                                        <TableCell>{weekData.weekNumber}</TableCell>
                                        <TableCell>
                                            {isValid(parseISO(weekData.startDate)) ? 
                                            `${format(parseISO(weekData.startDate), 'dd/MMM', { locale: es })} al ${format(parseISO(weekData.endDate), 'dd/MMM', { locale: es })}`
                                            : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                             <Select value={weekData.feedType} onValueChange={(value) => handleFeedTypeChange(weekData.id, value)}>
                                                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                                <SelectContent>
                                                    {feedOptions.map(option => (
                                                        <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        {weekData.consumption.map((dayConsumption, dayIndex) => (
                                            <TableCell key={`${weekData.id}-day-${dayIndex}`}>
                                                <Input 
                                                    type="number"
                                                    value={dayConsumption}
                                                    onChange={(e) => handleConsumptionChange(weekData.id, dayIndex, e.target.value)}
                                                    className="w-20 text-center"
                                                    disabled={batch.status === 'Finalizado'}
                                                />
                                            </TableCell>
                                        ))}
                                        <TableCell className="font-medium text-right">{weekData.totalWeek.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">{weekData.totalAccumulated.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">{weekData.accumulatedPerPig.toFixed(3)}</TableCell>
                                        <TableCell className="text-right">{weekData.consumptionPerPigPerDay.toFixed(3)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Historial de Eventos del Lote</CardTitle>
                        <CardDescription>Eventos registrados para este lote, del más reciente al más antiguo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Tipo de Evento</TableHead>
                                    <TableHead>Detalles</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {batch.events.length > 0 ? batch.events.map(event => (
                                    <TableRow key={event.id}>
                                        <TableCell>{isValid(parseISO(event.date)) ? format(parseISO(event.date), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {eventIcons[event.type]}
                                                <span>{event.type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {event.details || `Animales: ${event.animalCount || 'N/A'}${event.cause ? `, Causa: ${event.cause}` : ''}`}
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onSelect={() => openEditEventDialog(event)}>Editar</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => openDeleteEventDialog(event)} className="text-destructive">Eliminar</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">No hay eventos registrados para este lote.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                       </Table>
                    </CardContent>
                </Card>
            </div>
             <Dialog open={isEventFormOpen} onOpenChange={(isOpen) => {
                if (!isOpen) { setEditingEvent(null); }
                setIsEventFormOpen(isOpen)
             }}>
                <EventForm />
            </Dialog>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará el evento permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setEventToDelete(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteEvent}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

    
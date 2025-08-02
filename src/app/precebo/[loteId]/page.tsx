
"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle, Syringe, Move, Banknote, PackagePlus, ShieldPlus, Skull } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, isValid, addDays, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockInventory } from '@/lib/mock-data';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';


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
}

interface ConsumptionRecord {
    id: string;
    weekNumber: number;
    startDate: string;
    endDate: string;
    feedType: string;
    deaths: number | string;
    sales: number | string;
    consumption: (number | string)[];
    inventory: number;
    totalWeek: number;
    totalAccumulated: number;
    accumulatedPerPig: number;
    consumptionPerPigPerDay: number;
}

type PreceboEventType = "Muerte en lote" | "Traslado de lote" | "Venta de lote" | "Ingreso a lote" | "Tratamiento" | "Vacunación";

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

    const getConsumptionStorageKey = React.useCallback(() => `consumptionHistory_precebo_${loteId}`, [loteId]);
    
    const daysOfWeek = React.useMemo(() => {
        if (!batch) return [];
        const startDate = parseISO(batch.creationDate);
        if (!isValid(startDate)) return [];
        const startDayIndex = getDay(startDate) === 0 ? 6 : getDay(startDate) - 1; 
        
        const dayNames = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
        return [...dayNames.slice(startDayIndex), ...dayNames.slice(0, startDayIndex)];
    }, [batch]);

    const handleHistoryChange = (updatedHistory: ConsumptionRecord[], currentBatch: NurseryBatch) => {
      let accumulatedFeed = 0;
      let previousWeekInventory = currentBatch.initialPigletCount;
      
      const calculatedHistory = updatedHistory.map(week => {
          const weeklyConsumption = week.consumption.reduce((sum, val) => sum + Number(val || 0), 0);
          accumulatedFeed += weeklyConsumption;
          
          const deaths = Number(week.deaths || 0);
          const sales = Number(week.sales || 0);
          const currentInventory = previousWeekInventory - deaths - sales;
          
          const accumulatedPerPig = currentInventory > 0 ? accumulatedFeed / currentInventory : 0;
          const consumptionPerPigPerDay = currentInventory > 0 ? weeklyConsumption / currentInventory / 7 : 0;
          
          previousWeekInventory = currentInventory;

          return {
              ...week,
              totalWeek: weeklyConsumption,
              inventory: currentInventory,
              totalAccumulated: accumulatedFeed,
              accumulatedPerPig,
              consumptionPerPigPerDay,
          };
      });

      setConsumptionHistory(calculatedHistory);
      localStorage.setItem(getConsumptionStorageKey(), JSON.stringify(calculatedHistory));

      const finalInventory = calculatedHistory.length > 0 ? calculatedHistory[calculatedHistory.length - 1].inventory : currentBatch.initialPigletCount;
      if(currentBatch.pigletCount !== finalInventory) {
         setBatch(prev => prev ? {...prev, pigletCount: finalInventory} : null);
         const storedBatches = JSON.parse(localStorage.getItem('nurseryBatches') || '{}');
         if (storedBatches[loteId]) {
             storedBatches[loteId].pigletCount = finalInventory;
             localStorage.setItem('nurseryBatches', JSON.stringify(storedBatches));
         }
      }
    };


    React.useEffect(() => {
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
                };
                setBatch(processedBatch);

                const storageKey = getConsumptionStorageKey();
                const storedConsumption = localStorage.getItem(storageKey);
                let history: ConsumptionRecord[] = storedConsumption ? JSON.parse(storedConsumption) : [];
                
                if (history.length < 8) {
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
                            deaths: '',
                            sales: '',
                            inventory: 0,
                            totalWeek: 0,
                            totalAccumulated: 0,
                            accumulatedPerPig: 0,
                            consumptionPerPigPerDay: 0,
                        };
                    });
                    history = [...history, ...additionalWeeks];
                }
                handleHistoryChange(history, processedBatch);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loteId, getConsumptionStorageKey]);


    const updateConsumptionData = React.useCallback((updatedHistory: ConsumptionRecord[]) => {
        if (batch) {
            handleHistoryChange(updatedHistory, batch);
        }
    }, [batch, getConsumptionStorageKey]);

    const handleFeedTypeChange = React.useCallback((weekId: string, feedType: string) => {
        const updatedHistory = consumptionHistory.map(week =>
            week.id === weekId ? { ...week, feedType } : week
        );
        updateConsumptionData(updatedHistory);
    }, [consumptionHistory, updateConsumptionData]);

    const handleConsumptionChange = React.useCallback((weekId: string, dayIndex: number, value: string) => {
        const updatedHistory = consumptionHistory.map(week => {
            if (week.id === weekId) {
                const newConsumption = [...week.consumption];
                newConsumption[dayIndex] = value;
                return { ...week, consumption: newConsumption };
            }
            return week;
        });
        updateConsumptionData(updatedHistory);
    }, [consumptionHistory, updateConsumptionData]);

    const handleBajasChange = React.useCallback((weekId: string, type: 'deaths' | 'sales', value: string) => {
        const updatedHistory = consumptionHistory.map(week => {
            if (week.id === weekId) {
                return { ...week, [type]: value };
            }
            return week;
        });
        updateConsumptionData(updatedHistory);
    }, [consumptionHistory, updateConsumptionData]);
    
    const openEventDialog = (eventType: PreceboEventType) => {
        setSelectedEventType(eventType);
        setIsEventFormOpen(true);
    };

    const EventForm = () => {
        if (!selectedEventType) return null;

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            // Here you would handle form submission, save the event,
            // and potentially update the batch data.
            toast({
                title: "¡Evento Registrado!",
                description: `El evento "${selectedEventType}" ha sido registrado para el lote ${loteId}.`,
            });
            setIsEventFormOpen(false);
        }
        
        return (
            <DialogContent className="max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Registrar Evento: {selectedEventType}</DialogTitle>
                    <DialogDescription>
                        Complete la información del evento para el lote {loteId}.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto -mx-6 px-6">
                    <ScrollArea className="h-full pr-6">
                        <form onSubmit={handleSubmit} id="event-form" className="space-y-4 pt-2 pb-6">
                            <div className="space-y-2">
                                <Label htmlFor="eventDate">Fecha del Evento</Label>
                                <Input id="eventDate" name="eventDate" type="date" required />
                            </div>

                            {['Tratamiento', 'Vacunación'].includes(selectedEventType) && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="product">Producto</Label>
                                        <Select name="product" required>
                                            <SelectTrigger><SelectValue placeholder={`Seleccionar ${selectedEventType === 'Tratamiento' ? 'medicamento' : 'vacuna'}`} /></SelectTrigger>
                                            <SelectContent>
                                                {mockInventory.filter(p => p.category === (selectedEventType === 'Tratamiento' ? 'medicamento' : 'vacuna')).map(item => (
                                                    <SelectItem key={item.id} value={item.id}>{item.name} (Stock: {item.stock})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dose">Dosis por Animal (ml)</Label>
                                        <Input id="dose" name="dose" type="number" step="0.1" placeholder="Ej. 2.0" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="treatmentReason">Motivo / Enfermedad</Label>
                                        <Input id="treatmentReason" name="treatmentReason" placeholder="Ej: Preventivo, tratamiento para diarrea" required/>
                                    </div>
                                </>
                            )}
                            
                            {['Muerte en lote', 'Venta de lote', 'Ingreso a lote'].includes(selectedEventType) && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="animalCount">Número de Animales</Label>
                                        <Input id="animalCount" name="animalCount" type="number" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="avgWeight">Peso Promedio (kg) - Opcional</Label>
                                        <Input id="avgWeight" name="avgWeight" type="number" step="0.1" placeholder="Ej. 15.5" />
                                    </div>
                                </>
                            )}
                            
                            {selectedEventType === 'Venta de lote' && (
                                 <div className="space-y-2">
                                    <Label htmlFor="saleValue">Valor Total de Venta ($)</Label>
                                    <Input id="saleValue" name="saleValue" type="number" step="0.01" placeholder="Valor total"/>
                                </div>
                            )}

                            {selectedEventType === 'Traslado de lote' && (
                                 <div className="space-y-2">
                                    <Label htmlFor="destination">Destino del Lote</Label>
                                    <Input id="destination" name="destination" placeholder="Ej: Módulo de Ceba 1" required />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="eventNotes">Notas Adicionales</Label>
                                <Textarea id="eventNotes" name="eventNotes" placeholder="Cualquier nota adicional relevante para este evento."/>
                            </div>
                        </form>
                    </ScrollArea>
                </div>
                <DialogFooter className="flex-shrink-0 pt-4 border-t -mx-6 px-6 bg-background">
                    <Button type="button" variant="ghost" onClick={() => setIsEventFormOpen(false)}>Cancelar</Button>
                    <Button type="submit" form="event-form">Guardar Evento</Button>
                </DialogFooter>
            </DialogContent>
        )
    }

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
                            <Button>
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
                                    <TableHead className="min-w-[150px]">Alimento</TableHead>
                                    <TableHead className="min-w-[90px]">Muertes</TableHead>
                                    <TableHead className="min-w-[90px]">Ventas</TableHead>
                                    {daysOfWeek.map(day => (
                                        <TableHead key={day} className="capitalize min-w-[70px]">{day}</TableHead>
                                    ))}
                                    <TableHead className="min-w-[120px]">Total Semana</TableHead>
                                    <TableHead className="min-w-[130px]">Total Acumulado</TableHead>
                                    <TableHead className="min-w-[100px]">Inventario</TableHead>
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
                                        <TableCell>
                                            <Input
                                                key={`${weekData.id}-deaths`}
                                                type="number"
                                                value={weekData.deaths}
                                                onChange={(e) => handleBajasChange(weekData.id, 'deaths', e.target.value)}
                                                className="w-20 text-center"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                key={`${weekData.id}-sales`}
                                                type="number"
                                                value={weekData.sales}
                                                onChange={(e) => handleBajasChange(weekData.id, 'sales', e.target.value)}
                                                className="w-20 text-center"
                                            />
                                        </TableCell>
                                        {weekData.consumption.map((dayConsumption, dayIndex) => (
                                            <TableCell key={`${weekData.id}-day-${dayIndex}`}>
                                                <Input 
                                                    type="number"
                                                    value={dayConsumption}
                                                    onChange={(e) => handleConsumptionChange(weekData.id, dayIndex, e.target.value)}
                                                    className="w-16 text-center"
                                                />
                                            </TableCell>
                                        ))}
                                        <TableCell className="font-medium">{weekData.totalWeek.toFixed(2)}</TableCell>
                                        <TableCell>{weekData.totalAccumulated.toFixed(2)}</TableCell>
                                        <TableCell className="font-bold">{weekData.inventory}</TableCell>
                                        <TableCell>{weekData.accumulatedPerPig.toFixed(3)}</TableCell>
                                        <TableCell>{weekData.consumptionPerPigPerDay.toFixed(3)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
             <Dialog open={isEventFormOpen} onOpenChange={setIsEventFormOpen}>
                <EventForm />
            </Dialog>
        </AppLayout>
    );
}

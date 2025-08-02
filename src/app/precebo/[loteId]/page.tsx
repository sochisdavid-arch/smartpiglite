
"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, isValid, addDays, getDay, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockInventory } from '@/lib/mock-data';

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
    consumption: (number | string)[];
    deaths: number | string;
    sales: number | string;
    inventory: number;
    totalWeek: number;
    totalAccumulated: number;
    accumulatedPerPig: number;
    consumptionPerPigPerDay: number;
}


export default function LotePreceboPage() {
    const router = useRouter();
    const params = useParams();
    const loteId = params.loteId as string;
    const [batch, setBatch] = React.useState<NurseryBatch | null>(null);
    const [consumptionHistory, setConsumptionHistory] = React.useState<ConsumptionRecord[]>([]);

    const getConsumptionStorageKey = React.useCallback(() => `consumptionHistory_precebo_${loteId}`, [loteId]);
    
    const daysOfWeek = React.useMemo(() => {
        if (!batch) return [];
        const startDate = parseISO(batch.creationDate);
        const startDayIndex = getDay(startDate) === 0 ? 6 : getDay(startDate) - 1; 
        
        const dayNames = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
        const rotatedDays = [...dayNames.slice(startDayIndex), ...dayNames.slice(0, startDayIndex)];
        return rotatedDays;
    }, [batch]);
    
    const updateConsumption = React.useCallback((history: ConsumptionRecord[], currentBatch: NurseryBatch) => {
        let accumulatedFeed = 0;
        let previousWeekInventory = currentBatch.initialPigletCount;

        const newHistory = history.map(week => {
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
                accumulatedPerPig: accumulatedPerPig,
                consumptionPerPigPerDay: consumptionPerPigPerDay,
            };
        });

        setConsumptionHistory(newHistory);
        localStorage.setItem(getConsumptionStorageKey(), JSON.stringify(newHistory));
        
        const finalInventory = newHistory[newHistory.length - 1]?.inventory ?? currentBatch.initialPigletCount;
        if(batch && batch.pigletCount !== finalInventory) {
            setBatch(prev => prev ? {...prev, pigletCount: finalInventory} : null);
        }

    }, [loteId, batch]);

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
                setConsumptionHistory(history);
            }
        }
    }, [loteId, getConsumptionStorageKey]);

    React.useEffect(() => {
        if (batch && consumptionHistory.length > 0) {
            updateConsumption(consumptionHistory, batch);
        }
    }, [batch, consumptionHistory, updateConsumption]);


    const handleHistoryChange = (updatedHistory: ConsumptionRecord[]) => {
        if(batch) {
            updateConsumption(updatedHistory, batch);
        }
    };


    const handleFeedTypeChange = (weekId: string, feedType: string) => {
        const updatedHistory = consumptionHistory.map(week =>
            week.id === weekId ? { ...week, feedType } : week
        );
        handleHistoryChange(updatedHistory);
    };

    const handleConsumptionChange = (weekId: string, dayIndex: number, value: string) => {
        const updatedHistory = consumptionHistory.map(week => {
            if (week.id === weekId) {
                const newConsumption = [...week.consumption];
                newConsumption[dayIndex] = value;
                return { ...week, consumption: newConsumption };
            }
            return week;
        });
        handleHistoryChange(updatedHistory);
    };

    const handleBajasChange = (weekId: string, type: 'deaths' | 'sales', value: string) => {
        const updatedHistory = consumptionHistory.map(week => {
            if (week.id === weekId) {
                return { ...week, [type]: value };
            }
            return week;
        });
        handleHistoryChange(updatedHistory);
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
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Agregar Evento
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Información del Lote</CardTitle>
                    </CardHeader>
                     <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 text-sm">
                        <div className="space-y-1">
                            <p className="font-medium text-muted-foreground">Lote N°</p>
                            <p className="font-semibold">{batch.id}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium text-muted-foreground">Módulo Precebo</p>
                            <p className="font-semibold">{batch.module || 'PRE-01'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium text-muted-foreground">Fecha Ingreso</p>
                            <p className="font-semibold">{isValid(parseISO(batch.creationDate)) ? format(parseISO(batch.creationDate), 'dd/MM/yyyy') : 'N/A'}</p>
                        </div>
                         <div className="space-y-1">
                            <p className="font-medium text-muted-foreground">N° Inicial</p>
                            <p className="font-semibold">{Number(batch.initialPigletCount).toFixed(0)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium text-muted-foreground">N° Actual</p>
                            <p className="font-semibold">{Number(batch.pigletCount).toFixed(0)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium text-muted-foreground">Peso Total (kg)</p>
                            <p className="font-semibold">{Number(batch.totalWeight).toFixed(2)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium text-muted-foreground">Peso Prom. (kg)</p>
                            <p className="font-semibold">{Number(batch.avgWeight).toFixed(2)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium text-muted-foreground">Edad Inicial (días)</p>
                            <p className="font-semibold">{batch.avgAge}</p>
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
                                            `${format(parseISO(weekData.startDate), 'dd/MMM', { locale: es })} - ${format(parseISO(weekData.endDate), 'dd/MMM', { locale: es })}`
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
        </AppLayout>
    );
}

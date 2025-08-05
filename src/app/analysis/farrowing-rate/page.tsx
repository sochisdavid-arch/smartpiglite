
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Filter, Search, TrendingDown, TrendingUp, Circle } from 'lucide-react';
import { format, parseISO, isValid, differenceInDays, startOfDay, endOfDay, sub, eachMonthOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';

interface Event {
    id: string;
    type: string;
    date: string;
    details?: string;
    liveBorn?: number;
    [key: string]: any;
}

interface Pig {
    id: string;
    breed: string;
    birthDate: string;
    events: Event[];
}

interface MonthlyMetrics {
    name: string;
    totalServices: number;
    farrowings: number;
    abortions: number;
    repeats: number;
    emptyDetections: number;
    culls: number;
    deaths: number;
    farrowingRate: number;
    abortionRate: number;
    repeatRate: number;
    emptyRate: number;
    cullRate: number;
    deathRate: number;
}


const calculateFarrowingMetrics = (pigs: Pig[], startDate: Date, endDate: Date): MonthlyMetrics[] => {
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    const monthlyData: Record<string, Omit<MonthlyMetrics, 'name' | 'farrowingRate' | 'abortionRate' | 'repeatRate' | 'emptyRate' | 'cullRate' | 'deathRate'>> = {};

    months.forEach(month => {
        const monthKey = format(month, 'yyyy-MM');
        monthlyData[monthKey] = {
            totalServices: 0, farrowings: 0, abortions: 0, repeats: 0, 
            emptyDetections: 0, culls: 0, deaths: 0
        };
    });

    pigs.forEach(pig => {
        let lastServiceDate: string | null = null;

        const sortedEvents = [...pig.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        sortedEvents.forEach(event => {
            const eventDate = parseISO(event.date);

            if (event.type === 'Inseminación' || event.type === 'Monta Natural') {
                lastServiceDate = event.date;
                const serviceDate = parseISO(lastServiceDate);
                const monthKey = format(serviceDate, 'yyyy-MM');
                if (monthlyData[monthKey]) {
                    monthlyData[monthKey].totalServices++;
                }
            } else if (lastServiceDate) {
                 const serviceDate = parseISO(lastServiceDate);
                 const monthKey = format(serviceDate, 'yyyy-MM');

                 if (monthlyData[monthKey]) {
                     if (event.type === 'Parto') {
                         monthlyData[monthKey].farrowings++;
                         lastServiceDate = null;
                     } else if (event.type === 'Aborto') {
                         monthlyData[monthKey].abortions++;
                         lastServiceDate = null;
                     } else if (event.type === 'Celo no Servido' || event.type === 'Celo') { // Repetición
                         monthlyData[monthKey].repeats++;
                         lastServiceDate = null;
                     } else if (event.type === 'Vacia') {
                         monthlyData[monthKey].emptyDetections++;
                         lastServiceDate = null;
                     } else if (event.type === 'Descarte') {
                         monthlyData[monthKey].culls++;
                         lastServiceDate = null;
                     } else if (event.type === 'Muerte') {
                         monthlyData[monthKey].deaths++;
                         lastServiceDate = null;
                     }
                 }
            }
        });
    });

    return Object.entries(monthlyData).map(([monthKey, data]) => {
        const totalServices = data.totalServices;
        return {
            name: format(parseISO(`${monthKey}-01`), 'MMM yy', { locale: es }),
            ...data,
            farrowingRate: totalServices > 0 ? (data.farrowings / totalServices) * 100 : 0,
            abortionRate: totalServices > 0 ? (data.abortions / totalServices) * 100 : 0,
            repeatRate: totalServices > 0 ? (data.repeats / totalServices) * 100 : 0,
            emptyRate: totalServices > 0 ? (data.emptyDetections / totalServices) * 100 : 0,
            cullRate: totalServices > 0 ? (data.culls / totalServices) * 100 : 0,
            deathRate: totalServices > 0 ? (data.deaths / totalServices) * 100 : 0,
        };
    });
};


export default function FarrowingRatePage() {
    const [pigs, setPigs] = React.useState<Pig[]>([]);
    const [breedOptions, setBreedOptions] = React.useState<string[]>([]);
    
    // Filter States
    const [startDate, setStartDate] = React.useState<string>(format(sub(new Date(), { years: 1 }), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = React.useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [breedFilter, setBreedFilter] = React.useState('all');
    const [cycleStart, setCycleStart] = React.useState<number | string>('');
    const [cycleEnd, setCycleEnd] = React.useState<number | string>('');

    // Data States
    const [metricsData, setMetricsData] = React.useState<MonthlyMetrics[]>([]);

    React.useEffect(() => {
        const pigsFromStorage = localStorage.getItem('pigs');
        const allPigs: Pig[] = pigsFromStorage ? JSON.parse(pigsFromStorage) : [];
        setPigs(allPigs);
        const breeds = new Set(allPigs.map(p => p.breed));
        setBreedOptions(['all', ...Array.from(breeds)]);
    }, []);

     const handleFilter = React.useCallback(() => {
        const start = startOfDay(parseISO(startDate));
        const end = endOfDay(parseISO(endDate));
        
        let filteredPigs = pigs;
        if(breedFilter !== 'all') filteredPigs = filteredPigs.filter(s => s.breed === breedFilter);
        // Cycle filter logic would need to be implemented if cycle data is available per pig

        const calculatedMetrics = calculateFarrowingMetrics(filteredPigs, start, end);
        setMetricsData(calculatedMetrics);

    }, [pigs, startDate, endDate, breedFilter, cycleStart, cycleEnd]);

    React.useEffect(() => {
        handleFilter();
    }, [handleFilter]);


    const totalMetrics = React.useMemo(() => {
        const total = metricsData.reduce((acc, month) => {
            acc.totalServices += month.totalServices;
            acc.farrowings += month.farrowings;
            acc.abortions += month.abortions;
            acc.repeats += month.repeats;
            acc.emptyDetections += month.emptyDetections;
            acc.culls += month.culls;
            acc.deaths += month.deaths;
            return acc;
        }, { totalServices: 0, farrowings: 0, abortions: 0, repeats: 0, emptyDetections: 0, culls: 0, deaths: 0 });

        return {
            farrowingRate: total.totalServices > 0 ? (total.farrowings / total.totalServices) * 100 : 0,
            abortionRate: total.totalServices > 0 ? (total.abortions / total.totalServices) * 100 : 0,
            repeatRate: total.totalServices > 0 ? (total.repeats / total.totalServices) * 100 : 0,
            emptyRate: total.totalServices > 0 ? (total.emptyDetections / total.totalServices) * 100 : 0,
            cullRate: total.totalServices > 0 ? (total.culls / total.totalServices) * 100 : 0,
            deathRate: total.totalServices > 0 ? (total.deaths / total.totalServices) * 100 : 0,
        };
    }, [metricsData]);
    
    const kpiCards = [
        { title: 'TASA DE PARICIÓN (%)', value: totalMetrics.farrowingRate.toFixed(2), isGood: totalMetrics.farrowingRate > 85 },
        { title: 'ABORTO (%)', value: totalMetrics.abortionRate.toFixed(2), isGood: totalMetrics.abortionRate < 2 },
        { title: 'REPETICIÓN DE CELO (%)', value: totalMetrics.repeatRate.toFixed(2), isGood: totalMetrics.repeatRate < 10 },
        { title: 'DETECTADA VACÍA (%)', value: totalMetrics.emptyRate.toFixed(2), isGood: totalMetrics.emptyRate < 3 },
        { title: 'DESCARTE (%)', value: totalMetrics.cullRate.toFixed(2), isGood: totalMetrics.cullRate < 5 },
        { title: 'MUERTE (%)', value: totalMetrics.deathRate.toFixed(2), isGood: totalMetrics.deathRate < 2 },
    ];
    
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <h1 className="text-3xl font-bold tracking-tight">Análisis de Tasa de Parición</h1>
                 <Card>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                             <div className="space-y-2">
                                <Label htmlFor="start-date">Fecha inicial</Label>
                                <Input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end-date">Fecha final</Label>
                                <Input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="breed-filter">Buscar por raza</Label>
                                <Select value={breedFilter} onValueChange={setBreedFilter}>
                                    <SelectTrigger id="breed-filter"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {breedOptions.map(b => <SelectItem key={b} value={b}>{b === 'all' ? 'Todas las razas' : b}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <Button onClick={handleFilter} className="self-end">
                                <Filter className="mr-2 h-4 w-4" />
                                Filtrar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {kpiCards.map(kpi => (
                         <Card key={kpi.title}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold">{kpi.value}</span>
                                    <Circle className={`h-3 w-3 ${kpi.isGood ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'}`} />
                                </div>
                                <p className="text-xs text-muted-foreground">vs meta</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Comparación de los Principales Índices</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div>
                            <h3 className="font-semibold text-md mb-2">Tasa de parición (%)</h3>
                            <ResponsiveContainer width="100%" height={150}>
                                <BarChart data={metricsData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} unit="%"/>
                                    <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                                    <Bar dataKey="farrowingRate" name="Tasa de Parición" fill="hsl(var(--chart-3))" radius={[4,4,0,0]}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                         <div>
                            <h3 className="font-semibold text-md mb-2">Aborto (%)</h3>
                            <ResponsiveContainer width="100%" height={150}>
                                <BarChart data={metricsData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} unit="%"/>
                                    <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                                    <Bar dataKey="abortionRate" name="Tasa de Abortos" fill="hsl(var(--chart-2))" radius={[4,4,0,0]}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                            <h3 className="font-semibold text-md mb-2">Repetición de celo (%)</h3>
                            <ResponsiveContainer width="100%" height={150}>
                                <BarChart data={metricsData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} unit="%"/>
                                    <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                                    <Bar dataKey="repeatRate" name="Tasa de Repetición" fill="hsl(var(--chart-5))" radius={[4,4,0,0]}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                            <h3 className="font-semibold text-md mb-2">Detectada vacía (%)</h3>
                            <ResponsiveContainer width="100%" height={150}>
                                <BarChart data={metricsData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} unit="%"/>
                                    <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                                    <Bar dataKey="emptyRate" name="Tasa de Vacías" fill="hsl(var(--chart-4))" radius={[4,4,0,0]}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                         <div>
                            <h3 className="font-semibold text-md mb-2">Descarte (%)</h3>
                            <ResponsiveContainer width="100%" height={150}>
                                <BarChart data={metricsData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} unit="%"/>
                                    <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                                    <Bar dataKey="cullRate" name="Tasa de Descarte" fill="hsl(var(--chart-1))" radius={[4,4,0,0]}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                            <h3 className="font-semibold text-md mb-2">Muerte (%)</h3>
                            <ResponsiveContainer width="100%" height={150}>
                                <BarChart data={metricsData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} unit="%"/>
                                    <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                                    <Bar dataKey="deathRate" name="Tasa de Muertes" fill="hsl(var(--chart-3))" radius={[4,4,0,0]} style={{fill: 'purple'}}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}


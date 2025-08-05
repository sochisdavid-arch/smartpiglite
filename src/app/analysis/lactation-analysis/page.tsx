
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Filter, Download, Baby, Weight, CalendarDays, Percent } from 'lucide-react';
import { format, parseISO, isValid, differenceInDays, startOfDay, endOfDay, sub, eachMonthOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Event {
    id: string;
    type: string;
    date: string;
    details?: string;
    liveBorn?: number;
    pigletCount?: number;
    weaningWeight?: number;
    cause?: string;
    [key: string]: any;
}

interface Pig {
    id: string;
    breed: string;
    birthDate: string;
    events: Event[];
}

interface LactationRecord {
    sowId: string;
    cycle: number;
    breed: string;
    farrowingDate: string;
    weaningDate: string;
    lactationDays: number;
    liveBorn: number;
    weanedCount: number;
    weaningWeight: number;
    avgWeaningWeight: number;
    mortality: number;
    mortalityRate: number;
    mortalityCauses: { [key: string]: number };
}

const findLactations = (pigs: Pig[], startDate: Date, endDate: Date): LactationRecord[] => {
    const lactations: LactationRecord[] = [];

    pigs.forEach(pig => {
        let cycle = 0;
        const sortedEvents = [...pig.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        let currentFarrowingEvent: Event | null = null;
        
        for (const event of sortedEvents) {
            if (event.type === 'Parto') {
                cycle++;
                currentFarrowingEvent = event;
            } else if (event.type === 'Destete' && currentFarrowingEvent) {
                const farrowingDate = parseISO(currentFarrowingEvent.date);
                const weaningDate = parseISO(event.date);

                if (weaningDate >= startDate && weaningDate <= endDate) {
                    const lactationDays = differenceInDays(weaningDate, farrowingDate);
                    const liveBorn = currentFarrowingEvent.liveBorn || 0;
                    const weanedCount = event.pigletCount || 0;
                    const weaningWeight = event.weaningWeight || 0;
                    const avgWeaningWeight = weanedCount > 0 ? weaningWeight / weanedCount : 0;
                    const mortality = liveBorn - weanedCount;
                    const mortalityRate = liveBorn > 0 ? (mortality / liveBorn) * 100 : 0;
                    
                    const mortalityCauses: {[key: string]: number} = {};
                    const lactationPeriodEvents = sortedEvents.filter(e => 
                        parseISO(e.date) > farrowingDate && parseISO(e.date) <= weaningDate
                    );
                    lactationPeriodEvents.forEach(e => {
                        if(e.type === 'Muerte de Lechón' && e.cause) {
                            mortalityCauses[e.cause] = (mortalityCauses[e.cause] || 0) + (e.pigletCount || 1);
                        }
                    });

                    lactations.push({
                        sowId: pig.id,
                        cycle,
                        breed: pig.breed,
                        farrowingDate: currentFarrowingEvent.date,
                        weaningDate: event.date,
                        lactationDays,
                        liveBorn,
                        weanedCount,
                        weaningWeight,
                        avgWeaningWeight,
                        mortality,
                        mortalityRate,
                        mortalityCauses
                    });
                }
                currentFarrowingEvent = null; // Reset for the next farrowing
            }
        }
    });

    return lactations;
};


export default function LactationAnalysisPage() {
    const [pigs, setPigs] = React.useState<Pig[]>([]);
    const [lactationRecords, setLactationRecords] = React.useState<LactationRecord[]>([]);
    const [breedOptions, setBreedOptions] = React.useState<string[]>([]);
    
    // Filter States
    const [startDate, setStartDate] = React.useState<string>(format(sub(new Date(), { years: 1 }), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = React.useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [breedFilter, setBreedFilter] = React.useState('all');
    const [cycleFilter, setCycleFilter] = React.useState('all');

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
        
        let allLactations = findLactations(pigs, start, end);
        
        if (breedFilter !== 'all') {
            allLactations = allLactations.filter(l => l.breed === breedFilter);
        }
        if (cycleFilter !== 'all') {
            allLactations = allLactations.filter(l => l.cycle === parseInt(cycleFilter));
        }

        setLactationRecords(allLactations);

    }, [pigs, startDate, endDate, breedFilter, cycleFilter]);

    React.useEffect(() => {
        handleFilter();
    }, [handleFilter]);

    const kpiData = React.useMemo(() => {
        const totalRecords = lactationRecords.length;
        if(totalRecords === 0) return { avgWeaned: 0, avgWeaningWeight: 0, avgLactationDays: 0, avgMortalityRate: 0 };

        const totalWeaned = lactationRecords.reduce((sum, r) => sum + r.weanedCount, 0);
        const totalWeaningWeight = lactationRecords.reduce((sum, r) => sum + r.weaningWeight, 0);
        const totalLactationDays = lactationRecords.reduce((sum, r) => sum + r.lactationDays, 0);
        const totalLiveBorn = lactationRecords.reduce((sum, r) => sum + r.liveBorn, 0);
        
        return {
            avgWeaned: totalWeaned / totalRecords,
            avgWeaningWeight: totalWeaned > 0 ? totalWeaningWeight / totalWeaned : 0,
            avgLactationDays: totalLactationDays / totalRecords,
            avgMortalityRate: totalLiveBorn > 0 ? ((totalLiveBorn - totalWeaned) / totalLiveBorn) * 100 : 0
        }
    }, [lactationRecords]);

    const mortalityCausesData = React.useMemo(() => {
        const causes: { [key: string]: number } = {};
        lactationRecords.forEach(record => {
            Object.entries(record.mortalityCauses).forEach(([cause, count]) => {
                causes[cause] = (causes[cause] || 0) + count;
            });
        });
        return Object.entries(causes).map(([name, value]) => ({ name, 'Muertes': value })).sort((a,b)=> b.Muertes - a.Muertes);
    }, [lactationRecords]);

    const weaningWeightDistribution = React.useMemo(() => {
        const categories = ['< 4 kg', '4-5 kg', '5-6 kg', '6-7 kg', '> 7 kg'];
        const data = categories.map(name => ({ name, 'Lechones': 0 }));
        lactationRecords.forEach(r => {
            if(r.avgWeaningWeight < 4) data[0]['Lechones']++;
            else if (r.avgWeaningWeight < 5) data[1]['Lechones']++;
            else if (r.avgWeaningWeight < 6) data[2]['Lechones']++;
            else if (r.avgWeaningWeight < 7) data[3]['Lechones']++;
            else data[4]['Lechones']++;
        });
        return data;
    }, [lactationRecords]);

    const kpiCards = [
        { title: 'Destetados / Parto', value: kpiData.avgWeaned.toFixed(2), icon: Baby, goal: '> 11.5' },
        { title: 'Peso Prom. Destete (kg)', value: kpiData.avgWeaningWeight.toFixed(2), icon: Weight, goal: '> 6.0 kg' },
        { title: 'Días de Lactancia', value: kpiData.avgLactationDays.toFixed(1), icon: CalendarDays, goal: '21 días' },
        { title: 'Mortalidad Pre-Destete (%)', value: kpiData.avgMortalityRate.toFixed(2), icon: Percent, goal: '< 8%' },
    ];
    
    const handleExport = (formatType: 'pdf' | 'csv' | 'xlsx') => {
        const head = [
            'Madre', 'Ciclo', 'Raza', 'F. Parto', 'F. Destete', 'Días Lact.', 'Nacidos Vivos', 'Destetados', 'Peso Prom. Destete (kg)'
        ];
        const body = lactationRecords.map(r => [
            r.sowId,
            r.cycle,
            r.breed,
            format(parseISO(r.farrowingDate), 'dd/MM/yyyy'),
            format(parseISO(r.weaningDate), 'dd/MM/yyyy'),
            r.lactationDays,
            r.liveBorn,
            r.weanedCount,
            r.avgWeaningWeight.toFixed(2)
        ]);

        const title = "Análisis de Lactancia";
        const dateRange = `Período: ${format(parseISO(startDate), 'dd/MM/yyyy')} - ${format(parseISO(endDate), 'dd/MM/yyyy')}`;

        if (formatType === 'pdf') {
            const doc = new jsPDF({ orientation: 'landscape' });
            doc.text(title, 14, 16);
            doc.setFontSize(10);
            doc.text(dateRange, 14, 22);
            autoTable(doc, { head: [head], body, startY: 28, theme: 'grid' });
            doc.save(`analisis_lactancia_${new Date().toISOString().split('T')[0]}.pdf`);
        }

        if (formatType === 'csv' || formatType === 'xlsx') {
            const ws = XLSX.utils.aoa_to_sheet([head, ...body]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Análisis Lactancia");
            XLSX.writeFile(wb, `analisis_lactancia_${new Date().toISOString().split('T')[0]}.${formatType}`);
        }
    };


    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Análisis de Lactancia</h1>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Exportar</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => handleExport('pdf')}>PDF</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleExport('csv')}>CSV</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleExport('xlsx')}>Excel (XLSX)</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                 <Card>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                             <div className="space-y-2">
                                <Label htmlFor="start-date">Fecha inicial</Label>
                                <Input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end-date">Fecha final</Label>
                                <Input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="breed-filter">Raza</Label>
                                <Select value={breedFilter} onValueChange={setBreedFilter}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las razas</SelectItem>
                                        {breedOptions.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cycle-filter">Ciclo</Label>
                                <Select value={cycleFilter} onValueChange={setCycleFilter}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los ciclos</SelectItem>
                                        {Array.from({length: 10}, (_, i) => i + 1).map(c => <SelectItem key={c} value={c.toString()}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleFilter} className="self-end w-full lg:w-auto">
                                <Filter className="mr-2 h-4 w-4" />
                                Filtrar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpiCards.map(kpi => (
                         <Card key={kpi.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                                <kpi.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{kpi.value}</div>
                                <p className="text-xs text-muted-foreground">Meta: {kpi.goal}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Causas de Mortalidad Pre-Destete</CardTitle>
                            <CardDescription>Principales causas de muerte de lechones durante la lactancia.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={mortalityCausesData} layout="vertical" margin={{ right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" width={80} tick={{fontSize: 12}}/>
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Muertes" fill="hsl(var(--chart-5))" radius={[0, 4, 4, 0]}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Distribución del Peso al Destete</CardTitle>
                             <CardDescription>Clasificación de los partos según el peso promedio de los lechones destetados.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={weaningWeightDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis allowDecimals={false}/>
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Lechones" name="Nº de Lechones" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                 <Card>
                    <CardHeader>
                        <CardTitle>Listado de Lactancias</CardTitle>
                        <CardDescription>Detalle de cada lactancia finalizada en el período seleccionado.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Madre</TableHead>
                                    <TableHead>Ciclo</TableHead>
                                    <TableHead>F. Parto</TableHead>
                                    <TableHead>F. Destete</TableHead>
                                    <TableHead>Días Lact.</TableHead>
                                    <TableHead>Nac. Vivos</TableHead>
                                    <TableHead>Destetados</TableHead>
                                    <TableHead>Peso Prom. (kg)</TableHead>
                                    <TableHead>Mortalidad (%)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lactationRecords.map((r, i) => (
                                    <TableRow key={`${r.sowId}-${i}`}>
                                        <TableCell><Link href={`/gestation/${r.sowId}`} className="text-primary underline">{r.sowId}</Link></TableCell>
                                        <TableCell>{r.cycle}</TableCell>
                                        <TableCell>{format(parseISO(r.farrowingDate), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>{format(parseISO(r.weaningDate), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>{r.lactationDays}</TableCell>
                                        <TableCell>{r.liveBorn}</TableCell>
                                        <TableCell>{r.weanedCount}</TableCell>
                                        <TableCell>{r.avgWeaningWeight.toFixed(2)}</TableCell>
                                        <TableCell>{r.mortalityRate.toFixed(1)}%</TableCell>
                                    </TableRow>
                                ))}
                                {lactationRecords.length === 0 && <TableRow><TableCell colSpan={9} className="text-center h-24">No hay datos para los filtros seleccionados.</TableCell></TableRow>}
                             </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}


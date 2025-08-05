
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Repeat, Baby, XCircle, LineChart, BarChart as BarChartIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, LineChart as RechartsLineChart } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { differenceInDays, parseISO, getMonth, isWithinInterval, startOfYear, endOfYear, format, getYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


interface Event {
    id: string;
    type: "Celo" | "Celo no Servido" | "Inseminación" | "Parto" | "Aborto" | "Tratamiento" | "Vacunación" | "Venta" | "Descarte" | "Muerte" | "Destete";
    date: string;
    liveBorn?: number;
    stillborn?: number;
    mummified?: number;
    details?: string;
}

interface Pig {
    id: string;
    breed: string;
    birthDate: string;
    events: Event[];
}

type GroupBy = 'month' | 'year';

interface KpiTableData {
    headers: string[];
    rows: {
        metric: string;
        isTotal?: boolean;
        isPercentage?: boolean;
        values: (string | number)[];
    }[];
}


const pigBreeds = [
  "Duroc", "Yorkshire", "Landrace", "Hampshire", "Pietrain",
];

const geneticLines = [
  "PIC", "Topigs Norsvin", "Hypor (Hendrix Genetics)", "DanBred", "Genus", "Choice Genetics", "Genesus",
];

const allGenetics = [...pigBreeds, ...geneticLines];

export default function GestationPerformancePage() {
    const [dateRange, setDateRange] = React.useState<{ from: string, to: string }>({
        from: format(startOfYear(new Date()), 'yyyy-MM-dd'),
        to: format(endOfYear(new Date()), 'yyyy-MM-dd'),
    });
    const [genetics, setGenetics] = React.useState('todas');
    const [groupBy, setGroupBy] = React.useState<GroupBy>('year');
    const [filteredData, setFilteredData] = React.useState<any>(null);

    const handleDateChange = (field: 'from' | 'to', value: string) => {
        setDateRange(prev => ({...prev, [field]: value}));
    };

    const calculateMetrics = React.useCallback((pigs: Pig[], selectedGenetics: string, range: {from: string, to: string}, groupBy: GroupBy) => {
        if (!range || !range.from || !range.to) {
            return null;
        }

        const dateRangeForFiltering = { start: parseISO(range.from), end: parseISO(range.to) };

        let relevantPigs = pigs;
        if (selectedGenetics !== 'todas') {
            relevantPigs = pigs.filter(p => 
                p.breed.toLowerCase() === selectedGenetics.toLowerCase() ||
                p.breed.toLowerCase().replace(/ /g, '-') === selectedGenetics.toLowerCase()
            );
        }
        
        const periodData: { [key: string]: any } = {};
        const periodKeys: string[] = [];

        const getPeriodKey = (date: Date) => {
            if (groupBy === 'year') return getYear(date).toString();
            return format(date, 'yyyy-MM');
        };
        
        const formatPeriodKey = (key: string) => {
            if (groupBy === 'year') return key;
            return format(parseISO(key), 'MMM yy', { locale: es });
        };
        
        // Initialize data structure for each period
        relevantPigs.forEach(pig => {
            pig.events.forEach(event => {
                const eventDate = parseISO(event.date);
                if (!isWithinInterval(eventDate, dateRangeForFiltering)) return;
                
                const periodKey = getPeriodKey(eventDate);
                if (!periodData[periodKey]) {
                    periodData[periodKey] = {
                        services: 0, farrowings: 0, totalLiveBorn: 0, abortions: 0, heatRepeats: 0,
                        idsSum: 0, idsCount: 0,
                    };
                    if(!periodKeys.includes(periodKey)) periodKeys.push(periodKey);
                }
            });
        });
        
        periodKeys.sort();

        relevantPigs.forEach(pig => {
            pig.events.forEach((event, index) => {
                const eventDate = parseISO(event.date);
                if (!isWithinInterval(eventDate, dateRangeForFiltering)) return;

                const periodKey = getPeriodKey(eventDate);
                const data = periodData[periodKey];

                if (event.type === 'Inseminación') data.services++;
                if (event.type === 'Parto') {
                    data.farrowings++;
                    data.totalLiveBorn += event.liveBorn || 0;
                }
                if (event.type === 'Aborto') data.abortions++;
                if (event.type === 'Celo no Servido' || (event.type === 'Celo' && pig.events[index-1]?.type !== 'Inseminación')) {
                    data.heatRepeats++;
                }
                if (event.type === 'Destete' && index > 0 && pig.events[index - 1].type === 'Inseminación') {
                    const inseminationDate = parseISO(pig.events[index-1].date);
                    const diff = differenceInDays(inseminationDate, eventDate);
                    if (diff > 0) {
                        data.idsSum += diff;
                        data.idsCount++;
                    }
                }
            });
        });

        // --- Grand Totals ---
        const totalServices = Object.values(periodData).reduce((sum, d) => sum + d.services, 0);
        const totalFarrowings = Object.values(periodData).reduce((sum, d) => sum + d.farrowings, 0);
        const totalLiveBorn = Object.values(periodData).reduce((sum, d) => sum + d.totalLiveBorn, 0);
        const totalHeatRepeats = Object.values(periodData).reduce((sum, d) => sum + d.heatRepeats, 0);
        const totalAbortions = Object.values(periodData).reduce((sum, d) => sum + d.abortions, 0);
        const totalIdsSum = Object.values(periodData).reduce((sum, d) => sum + d.idsSum, 0);
        const totalIdsCount = Object.values(periodData).reduce((sum, d) => sum + d.idsCount, 0);

        const totalFarrowingRate = totalServices > 0 ? (totalFarrowings / totalServices) * 100 : 0;
        const totalAvgLiveBorn = totalFarrowings > 0 ? totalLiveBorn / totalFarrowings : 0;
        const totalAvgIds = totalIdsCount > 0 ? totalIdsSum / totalIdsCount : 0;
        const totalDnp = totalAvgIds + 21;
        const totalHeatRepeatRate = totalServices > 0 ? (totalHeatRepeats / totalServices) * 100 : 0;
        const totalAbortionRate = totalServices > 0 ? (totalAbortions / totalServices) * 100 : 0;

        const kpiData = [
            { title: "Tasa de Partos", value: `${totalFarrowingRate.toFixed(1)}%`, icon: Baby, description: "Porcentaje de servicios que finalizan en parto." },
            { title: "Promedio Nacidos Vivos / Parto", value: totalAvgLiveBorn.toFixed(1), icon: Baby, description: "Promedio de lechones nacidos vivos por cada parto." },
            { title: "Días No Productivos (DNP)", value: `${totalDnp.toFixed(1)} días`, icon: Activity, description: "Promedio de días que una cerda no está gestando ni lactando." },
            { title: "Tasa de Repetición de Celo", value: `${totalHeatRepeatRate.toFixed(1)}%`, icon: Repeat, description: "Porcentaje de cerdas que repiten celo." },
            { title: "Tasa de Abortos", value: `${totalAbortionRate.toFixed(1)}%`, icon: XCircle, description: "Porcentaje de gestaciones que terminan en aborto." },
            { title: "Intervalo Destete-Servicio (IDS)", value: `${totalAvgIds.toFixed(1)} días`, icon: Activity, description: "Tiempo promedio desde el destete hasta la siguiente cubrición." },
        ];
        
        // --- Detailed Tables Data ---
        const tableHeaders = ["Métrica", ...periodKeys.map(formatPeriodKey)];
        
        const createTableRows = (metrics: {key: string, label: string, isPercentage?: boolean, isTotal?: boolean}[], dataSource: (data: any, totals: any, key: string) => number) => {
            return metrics.map(metric => ({
                metric: metric.label,
                isTotal: metric.isTotal,
                isPercentage: metric.isPercentage,
                values: periodKeys.map(key => {
                    const periodTotals = { services: periodData[key].services };
                    const value = dataSource(periodData[key], periodTotals, metric.key);
                    return metric.isPercentage ? `${value.toFixed(1)}%` : value.toFixed(metric.isPercentage ? 1 : 0);
                })
            }));
        }

        const servicesKpiData: KpiTableData = {
            headers: tableHeaders,
            rows: createTableRows([
                { key: 'services', label: 'Total de Servicios', isTotal: true },
                { key: 'heatRepeats', label: 'Reservicios' },
                { key: 'heatRepeatRate', label: 'Reservicios (%)', isPercentage: true },
            ], (data, totals, key) => {
                if (key === 'heatRepeatRate') return totals.services > 0 ? (data.heatRepeats / totals.services) * 100 : 0;
                return data[key] || 0;
            })
        };

        const reproductiveLossData: KpiTableData = {
            headers: tableHeaders,
            rows: createTableRows([
                { key: 'heatRepeats', label: 'Repetición de celo' },
                { key: 'heatRepeatRate', label: 'Repetición de celo (%)', isPercentage: true },
                { key: 'abortions', label: 'Aborto' },
                { key: 'abortionRate', label: 'Aborto (%)', isPercentage: true },
                 { key: 'totalLosses', label: 'Total de pérdidas reproductivas', isTotal: true },
            ], (data, totals, key) => {
                if (key === 'heatRepeatRate') return totals.services > 0 ? (data.heatRepeats / totals.services) * 100 : 0;
                if (key === 'abortionRate') return totals.services > 0 ? (data.abortions / totals.services) * 100 : 0;
                if (key === 'totalLosses') return data.heatRepeats + data.abortions;
                return data[key] || 0;
            })
        };
        
         const intervalsData: KpiTableData = {
            headers: tableHeaders,
            rows: createTableRows([
                { key: 'avgIds', label: 'Destete - Servicio (días)' },
            ], (data) => data.idsCount > 0 ? data.idsSum / data.idsCount : 0)
        };
        
        
        // --- Charts Data ---
        const monthlyLiveBorn = Object.entries(periodData).reduce((acc, [key, data]) => {
            const month = getMonth(parseISO(key));
            if (!acc[month]) acc[month] = { total: 0, count: 0 };
            acc[month].total += data.totalLiveBorn;
            acc[month].count += data.farrowings;
            return acc;
        }, {} as { [key: string]: { total: number, count: number } });

        const liveBornDataChart = Object.entries(monthlyLiveBorn).map(([month, data]) => ({
            period: new Date(0, Number(month)).toLocaleString('es', { month: 'short' }),
            value: data.count > 0 ? data.total / data.count : 0,
        })).sort((a,b)=> new Date(`1970 ${a.period} 1`) > new Date(`1970 ${b.period} 1`) ? 1 : -1 );


        const farrowingRateByBreed = relevantPigs.reduce((acc, pig) => {
             const breedKey = pig.breed || 'Desconocida';
             if (!acc[breedKey]) acc[breedKey] = { services: 0, farrowings: 0 };
             pig.events.forEach(event => {
                 if (!isWithinInterval(parseISO(event.date), dateRangeForFiltering)) return;
                 if (event.type === 'Inseminación') acc[breedKey].services++;
                 if (event.type === 'Parto') acc[breedKey].farrowings++;
             });
             return acc;
        }, {} as { [key: string]: { services: number, farrowings: number } });


        const farrowingRateDataChart = Object.entries(farrowingRateByBreed).map(([breed, data]) => ({
            name: breed,
            rate: data.services > 0 ? (data.farrowings / data.services) * 100 : 0,
        }));
        
        return { kpiData, servicesKpiData, reproductiveLossData, intervalsData, liveBornDataChart, farrowingRateDataChart };
    }, []);

    React.useEffect(() => {
        const pigsFromStorage = localStorage.getItem('pigs');
        if (pigsFromStorage) {
            const allPigs = JSON.parse(pigsFromStorage);
            setFilteredData(calculateMetrics(allPigs, genetics, dateRange, groupBy));
        }
    }, [dateRange, genetics, groupBy, calculateMetrics]);
    
    if (!filteredData) {
        return (
            <AppLayout>
                <div className="flex flex-col gap-6">
                    <h1 className="text-3xl font-bold tracking-tight">Análisis de Desempeño de Gestación</h1>
                    <Card>
                        <CardHeader>
                            <CardTitle>Cargando Datos...</CardTitle>
                            <CardDescription>Por favor espere mientras se procesan los datos de la granja.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center justify-center h-48">
                                <Activity className="h-12 w-12 animate-spin text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        )
    }

    const { kpiData, servicesKpiData, reproductiveLossData, intervalsData, liveBornDataChart, farrowingRateDataChart } = filteredData;
    
    const KpiTable = ({data}: {data: KpiTableData}) => (
        <Table>
            <TableHeader>
                <TableRow>
                    {data.headers.map(header => <TableHead key={header}>{header}</TableHead>)}
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.rows.map(row => (
                    <TableRow key={row.metric}>
                        <TableCell className={row.isTotal ? "font-bold" : ""}>{row.metric}</TableCell>
                        {row.values.map((value, index) => (
                            <TableCell key={index} className={`text-right ${row.isTotal ? "font-bold" : ""}`}>{value !== 'NaN' ? value : 'N/A'}</TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Análisis de Desempeño de Gestación</h1>
                </div>
                <CardDescription>
                    Analice las informaciones de desempeño de la gestación, a través de los indicadores de servicio y pérdidas reproductivas.
                    Estos indicadores son clave para optimizar la eficiencia reproductiva de la granja.
                </CardDescription>

                 <Card>
                    <CardHeader>
                        <CardTitle>Filtros de Visualización</CardTitle>
                         <CardDescription>Seleccione los filtros para visualizar los gráficos de tendencias.</CardDescription>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                             <div className="grid gap-2">
                                <Label htmlFor="start-date">Fecha de Inicio</Label>
                                <Input id="start-date" type="date" value={dateRange.from} onChange={(e) => handleDateChange('from', e.target.value)} />
                             </div>
                             <div className="grid gap-2">
                                <Label htmlFor="end-date">Fecha de Fin</Label>
                                <Input id="end-date" type="date" value={dateRange.to} onChange={(e) => handleDateChange('to', e.target.value)} />
                             </div>
                             <div className="grid gap-2">
                                <Label>Genética</Label>
                                 <Select value={genetics} onValueChange={setGenetics}>
                                    <SelectTrigger><SelectValue placeholder="Filtrar por Genética" /></SelectTrigger>
                                    <SelectContent>
                                         <SelectItem value="todas">Todas las Genéticas</SelectItem>
                                         <SelectGroup>
                                            <SelectLabel>Razas</SelectLabel>
                                            {pigBreeds.map(b => <SelectItem key={b} value={b.toLowerCase()}>{b}</SelectItem>)}
                                         </SelectGroup>
                                         <SelectGroup>
                                            <SelectLabel>Líneas Genéticas</SelectLabel>
                                            {geneticLines.map(gl => <SelectItem key={gl} value={gl.toLowerCase().replace(/ /g, '-')}>{gl}</SelectItem>)}
                                         </SelectGroup>
                                    </SelectContent>
                                </Select>
                             </div>
                             <div className="grid gap-2">
                                <Label>Agrupar por</Label>
                                 <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                         <SelectItem value="year">Año</SelectItem>
                                         <SelectItem value="month">Mes</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kpiData.map((kpi, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium">{kpi.title}</CardTitle>
                                <kpi.icon className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{kpi.value}</div>
                                <p className="text-xs text-muted-foreground">{kpi.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Indicadores de Desempeño Detallados</CardTitle>
                        <CardDescription>Expanda cada sección para ver los detalles de los indicadores agrupados por {groupBy === 'year' ? 'año' : 'mes'}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Análisis de Servicios</AccordionTrigger>
                                <AccordionContent>
                                    <KpiTable data={servicesKpiData} />
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-2">
                                <AccordionTrigger>Pérdida Reproductiva</AccordionTrigger>
                                <AccordionContent>
                                   <KpiTable data={reproductiveLossData} />
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>Intervalos</AccordionTrigger>
                                <AccordionContent>
                                    <KpiTable data={intervalsData} />
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4">
                                <AccordionTrigger>Índices Complementarios</AccordionTrigger>
                                <AccordionContent>
                                     <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>Peso de la madre en el servicio</TableCell>
                                                <TableCell className="text-right">N/A</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Alimento consumido (Kg)</TableCell>
                                                <TableCell className="text-right">N/A</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Consumo hembra/dia (Kg)</TableCell>
                                                <TableCell className="text-right">N/A</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tasa de Partos por Genética</CardTitle>
                            <CardDescription>Comparativo de la tasa de partos (%) entre las diferentes genéticas.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {farrowingRateDataChart.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={farrowingRateDataChart}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                                        <YAxis unit="%" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                            formatter={(value) => `${(value as number).toFixed(1)}%`}
                                        />
                                        <Bar dataKey="rate" fill="hsl(var(--chart-1))" name="Tasa de Partos" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                                    <BarChartIcon className="h-10 w-10 mb-2"/>
                                    <p>No hay datos suficientes para mostrar el gráfico.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Evolución de Nacidos Vivos</CardTitle>
                            <CardDescription>Promedio de nacidos vivos por parto a lo largo del tiempo.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {liveBornDataChart.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <RechartsLineChart data={liveBornDataChart}>
                                         <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                         <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                                         <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                                         <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                            formatter={(value) => (value as number).toFixed(1)}
                                        />
                                         <Legend />
                                         <Line type="monotone" dataKey="value" name="Nacidos Vivos" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--chart-2))" }} activeDot={{ r: 6 }}/>
                                    </RechartsLineChart>
                                </ResponsiveContainer>
                             ) : (
                                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                                    <LineChart className="h-10 w-10 mb-2"/>
                                    <p>No hay datos suficientes para mostrar el gráfico.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </AppLayout>
    );
}

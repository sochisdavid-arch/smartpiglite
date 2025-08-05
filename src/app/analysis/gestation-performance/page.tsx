
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
import { differenceInDays, parseISO, getMonth, getYear, isWithinInterval, startOfYear, endOfYear, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

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

const pigBreeds = [
  "Duroc", "Yorkshire", "Landrace", "Hampshire", "Pietrain",
];

const geneticLines = [
  "PIC", "Topigs Norsvin", "Hypor (Hendrix Genetics)", "DanBred", "Genus", "Choice Genetics", "Genesus",
];

const allGenetics = [...pigBreeds, ...geneticLines];

export default function GestationPerformancePage() {
    const [period, setPeriod] = React.useState('anual');
    const [year, setYear] = React.useState(new Date().getFullYear().toString());
    const [genetics, setGenetics] = React.useState('todas');
    const [filteredData, setFilteredData] = React.useState<any>(null);

    const calculateMetrics = React.useCallback((pigs: Pig[], selectedGenetics: string, dateRange: { start: Date, end: Date }) => {
        let relevantPigs = pigs;
        if (selectedGenetics !== 'todas') {
            relevantPigs = pigs.filter(p => 
                p.breed.toLowerCase() === selectedGenetics.toLowerCase() ||
                p.breed.toLowerCase().replace(/ /g, '-') === selectedGenetics.toLowerCase()
            );
        }

        let services = 0;
        let successfulServices = 0;
        let totalLiveBorn = 0;
        let farrowings = 0;
        let abortions = 0;
        let heatRepeats = 0;
        let emptyDetections = 0; // Not tracked yet
        let sowDiscards = 0; // Not tracked yet
        let sowDeaths = 0; // Not tracked yet
        let idsSum = 0;
        let idsCount = 0;

        const monthlyLiveBorn: { [key: string]: { total: number, count: number } } = {};
        const farrowingRateByBreed: { [key: string]: { services: number, farrowings: number } } = {};

        relevantPigs.forEach(pig => {
            const breedKey = pig.breed || 'Desconocida';
            if (!farrowingRateByBreed[breedKey]) {
                farrowingRateByBreed[breedKey] = { services: 0, farrowings: 0 };
            }

            pig.events.forEach((event, index) => {
                const eventDate = parseISO(event.date);
                if (!isWithinInterval(eventDate, dateRange)) return;

                if (event.type === 'Inseminación') {
                    services++;
                    farrowingRateByBreed[breedKey].services++;
                }
                if (event.type === 'Parto') {
                    farrowings++;
                    farrowingRateByBreed[breedKey].farrowings++;
                    totalLiveBorn += event.liveBorn || 0;
                    
                    const month = getMonth(eventDate);
                    if (!monthlyLiveBorn[month]) {
                        monthlyLiveBorn[month] = { total: 0, count: 0 };
                    }
                    monthlyLiveBorn[month].total += event.liveBorn || 0;
                    monthlyLiveBorn[month].count++;
                }
                if (event.type === 'Aborto') {
                    abortions++;
                }
                if (event.type === 'Celo no Servido' || (event.type === 'Celo' && pig.events[index-1]?.type !== 'Inseminación')) {
                    heatRepeats++;
                }
                if (event.type === 'Destete' && index > 0 && pig.events[index - 1].type === 'Inseminación') {
                    const inseminationDate = parseISO(pig.events[index-1].date);
                    const diff = differenceInDays(inseminationDate, eventDate);
                    if (diff > 0) {
                        idsSum += diff;
                        idsCount++;
                    }
                }
            });
        });
        
        successfulServices = farrowings;
        const totalServicesForRate = services;

        const farrowingRate = totalServicesForRate > 0 ? (successfulServices / totalServicesForRate) * 100 : 0;
        const avgLiveBorn = farrowings > 0 ? totalLiveBorn / farrowings : 0;
        const avgIds = idsCount > 0 ? idsSum / idsCount : 0;
        const dnp = avgIds + 21; // Simplified DNP
        const heatRepeatRate = services > 0 ? (heatRepeats / services) * 100 : 0;
        const abortionRate = services > 0 ? (abortions / services) * 100 : 0;
        
        const reproductiveLosses = heatRepeats + abortions + emptyDetections + sowDiscards + sowDeaths;

        const servicesKpiData = [
            { metric: "I.A.", value: services },
            { metric: "I.A. (%)", value: `100.0%` }, // Assuming all are IA for now
            { metric: "Monta natural", value: "0" },
            { metric: "Monta natural (%)", value: "0.0%" },
            { metric: "Total de Servicios", value: services, isTotal: true },
            { metric: "Reservicios", value: heatRepeats },
            { metric: "Reservicios (%)", value: `${heatRepeatRate.toFixed(1)}%` },
        ];
        
        const reproductiveLossData = [
            { metric: "Repetición de celo", value: heatRepeats },
            { metric: "Repetición de celo (%)", value: `${heatRepeatRate.toFixed(1)}%` },
            { metric: "Aborto", value: abortions },
            { metric: "Aborto (%)", value: `${abortionRate.toFixed(1)}%` },
            { metric: "Total de pérdidas reproductivas", value: reproductiveLosses, isTotal: true },
        ];

        const intervalsData = [
            { metric: "Destete - Servicio", value: `${avgIds.toFixed(1)} días` },
        ];

        const kpiData = [
            { title: "Tasa de Partos", value: `${farrowingRate.toFixed(1)}%`, icon: Baby, description: "Porcentaje de servicios que finalizan en parto." },
            { title: "Promedio Nacidos Vivos / Parto", value: avgLiveBorn.toFixed(1), icon: Baby, description: "Promedio de lechones nacidos vivos por cada parto." },
            { title: "Días No Productivos (DNP)", value: `${dnp.toFixed(1)} días`, icon: Activity, description: "Promedio de días que una cerda no está gestando ni lactando." },
            { title: "Tasa de Repetición de Celo", value: `${heatRepeatRate.toFixed(1)}%`, icon: Repeat, description: "Porcentaje de cerdas que repiten celo." },
            { title: "Tasa de Abortos", value: `${abortionRate.toFixed(1)}%`, icon: XCircle, description: "Porcentaje de gestaciones que terminan en aborto." },
            { title: "Intervalo Destete-Servicio (IDS)", value: `${avgIds.toFixed(1)} días`, icon: Activity, description: "Tiempo promedio desde el destete hasta la siguiente cubrición." },
        ];

        const liveBornDataChart = Object.entries(monthlyLiveBorn).map(([month, data]) => ({
            period: new Date(0, Number(month)).toLocaleString('es', { month: 'short' }),
            value: data.count > 0 ? data.total / data.count : 0,
        })).sort((a,b)=> new Date(`1970 ${a.period} 1`) > new Date(`1970 ${b.period} 1`) ? 1 : -1 );


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
            const selectedYear = parseInt(year);
            let dateRange;
            switch(period) {
                case 'mensual':
                    dateRange = { start: startOfMonth(new Date(selectedYear, 0)), end: endOfMonth(new Date(selectedYear, 11)) }; // Placeholder for now
                    break;
                case 'semanal':
                     dateRange = { start: startOfWeek(new Date(selectedYear, 0, 1)), end: endOfWeek(new Date(selectedYear, 11, 31)) }; // Placeholder
                    break;
                default: // anual
                    dateRange = { start: startOfYear(new Date(selectedYear, 0)), end: endOfYear(new Date(selectedYear, 11)) };
            }
            
            setFilteredData(calculateMetrics(allPigs, genetics, dateRange));
        }
    }, [period, year, genetics, calculateMetrics]);
    
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
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                            <Select value={period} onValueChange={setPeriod}>
                                <SelectTrigger><SelectValue placeholder="Filtrar por Periodo" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="anual">Anual</SelectItem>
                                    <SelectItem value="semestral" disabled>Semestral</SelectItem>
                                    <SelectItem value="trimestral" disabled>Trimestral</SelectItem>
                                    <SelectItem value="mensual">Mensual</SelectItem>
                                    <SelectItem value="semanal" disabled>Semanal</SelectItem>
                                </SelectContent>
                            </Select>
                             <Select value={year} onValueChange={setYear}>
                                <SelectTrigger><SelectValue placeholder="Filtrar por Año" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2024">2024</SelectItem>
                                    <SelectItem value="2023">2023</SelectItem>
                                    <SelectItem value="2022">2022</SelectItem>
                                </SelectContent>
                            </Select>
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
                        <CardDescription>Expanda cada sección para ver los detalles de los indicadores.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Análisis de Servicios</AccordionTrigger>
                                <AccordionContent>
                                    <Table>
                                        <TableBody>
                                            {servicesKpiData.map((item) => (
                                                <TableRow key={item.metric}>
                                                    <TableCell className={item.isTotal ? "font-bold" : ""}>{item.metric}</TableCell>
                                                    <TableCell className={`text-right ${item.isTotal ? "font-bold" : ""}`}>{item.value}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-2">
                                <AccordionTrigger>Pérdida Reproductiva</AccordionTrigger>
                                <AccordionContent>
                                   <Table>
                                        <TableBody>
                                            {reproductiveLossData.map((item) => (
                                                <TableRow key={item.metric}>
                                                    <TableCell className={item.isTotal ? "font-bold" : ""}>{item.metric}</TableCell>
                                                    <TableCell className={`text-right ${item.isTotal ? "font-bold" : ""}`}>{item.value}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>Intervalos</AccordionTrigger>
                                <AccordionContent>
                                    <Table>
                                        <TableBody>
                                            {intervalsData.map((item) => (
                                                <TableRow key={item.metric}>
                                                    <TableCell>{item.metric}</TableCell>
                                                    <TableCell className="text-right">{item.value}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
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

    
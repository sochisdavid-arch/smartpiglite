
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Filter, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { differenceInDays, parseISO, format, getYear, getMonth, getWeek, startOfDay, endOfDay, eachYearOfInterval, eachMonthOfInterval, eachWeekOfInterval, eachDayOfInterval, add, sub } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Event {
    id: string;
    type: string;
    date: string;
    liveBorn?: number;
    stillborn?: number;
    mummified?: number;
    details?: string;
    [key: string]: any;
}

interface Pig {
    id: string;
    breed: string;
    birthDate: string;
    events: Event[];
}

type GroupingUnit = 'year' | 'month' | 'week' | 'day';

interface Metrics {
    [key: string]: number;
}

const METRIC_DEFINITIONS = [
    { key: 'partos', label: 'PARTOS', isHeader: true },
    { key: 'partosPrevistos', label: 'Previstos' },
    { key: 'partosRealizados', label: 'Realizados de los previstos' },
    { key: 'tasaParicion', label: 'Tasa de parición', isPercentage: true },
    { key: 'partosPeriodo', label: 'Partos del periodo' },
    { key: 'partosHembraAno', label: 'Partos/Hembra/Año' , isBold: true},
    { key: 'vivosHembraAno', label: 'Vivos/Hembra/Año', isBold: true },
    
    { key: 'nacimientos', label: 'NACIMIENTOS', isHeader: true },
    { key: 'vivos', label: 'Vivos' },
    { key: 'vivos_p', label: 'Vivos (%)', isPercentage: true },
    { key: 'vivosMedia', label: 'Vivos (media)' },
    { key: 'nacidosMuertos', label: 'Nacidos muertos' },
    { key: 'nacidosMuertos_p', label: 'Nacidos muertos (%)', isPercentage: true },
    { key: 'nacidosMuertosMedia', label: 'Nacidos muertos (media)' },
    { key: 'momificados', label: 'Momificados' },
    { key: 'momificados_p', label: 'Momificados (%)', isPercentage: true },
    { key: 'momificadosMedia', label: 'Momificados (media)' },
    { key: 'nacidosTotales', label: 'Nacidos Totales' },
    { key: 'nacidosTotalesMedia', label: 'Nacidos totales (media)' },
    { key: 'pesoTotalNacimiento', label: 'Peso total (Kg)' },
    { key: 'pesoMedioNacimiento', label: 'Peso medio (Kg)' },
    { key: 'hembrasNacidas', label: 'Hembras' },
    { key: 'hembrasNacidas_p', label: 'Hembras (%)', isPercentage: true },
    { key: 'hembrasNacidasMedia', label: 'Hembras (media)' },
    { key: 'reproductoresNacidos', label: 'Reproductores' },
    { key: 'reproductoresNacidos_p', label: 'Reproductores (%)', isPercentage: true },
    { key: 'reproductoresNacidosMedia', label: 'Reproductores (media)' },
    { key: 'bajaViabilidad', label: 'Lechones de baja viabilidad' },
    { key: 'bajaViabilidad_p', label: 'Lechones de baja viabilidad (%)', isPercentage: true },
    { key: 'bajaViabilidadMedia', label: 'Lechones de baja viabilidad (media)' },

    { key: 'indicesParto', label: 'ÍNDICES COMPLEMENTARIOS DE PARTO', isHeader: true },
    { key: 'cicloMedioParto', label: 'Ciclo medio' },
    { key: 'mediaDuracionHoras', label: 'Media de duración (horas)' },
    { key: 'periodoGestacion', label: 'Periodo de gestación' },
    { key: 'intervaloEntrePartos', label: 'Intervalo entre partos' },
    { key: 'pesoMadreParto', label: 'Peso de la madre en el parto' },
    { key: 'variacionPesoServicioParto', label: 'Variación del peso (servicio, parto)', isPercentage: true },

    { key: 'destete', label: 'DESTETE', isHeader: true },
    { key: 'totalDestetes', label: 'Total de destetes' },
    { key: 'desteteNodriza', label: 'Destete nodriza' },
    { key: 'desteteNodriza_p', label: 'Destete nodriza (%)', isPercentage: true },
    { key: 'periodoLactancia', label: 'Periodo de lactancia' },
    { key: 'destetadosHembraAno', label: 'Destetados/Hembra/Año' , isBold: true},
    { key: 'kgDestetadosHembraAno', label: 'Kg/Destetados/Hembra/Año', isBold: true },
    
    { key: 'destetados', label: 'DESTETADOS', isHeader: true },
    { key: 'lechonesADestetar', label: 'Lechones a destetar' },
    { key: 'destetadosRelacDest', label: 'Destetados relac. dest.' },
    { key: 'destetadosRelacDest_p', label: 'Destetados relac. dest. (%)', isPercentage: true },
    { key: 'destetadosMedia', label: 'Destetados (media)' },
    { key: 'destetadosPeriodo', label: 'Destetados en el periodo' },
    { key: 'edadMediaDestete', label: 'Edad media' },
    { key: 'muertesRelacDest', label: 'Muertes relac. dest.' },
    { key: 'muertesRelacDest_p', label: 'Muertes relac. dest. (%)', isPercentage: true },
    { key: 'muertesRelacDestMedia', label: 'Muertes relac. dest. (media)' },
    { key: 'muertesPeriodo', label: 'Muertes en el periodo' },
    { key: 'muertesPeriodo_p', label: 'Muertes en el periodo (%)', isPercentage: true },
    { key: 'pesoTotalDestete', label: 'Peso total (Kg)' },
    { key: 'pesoMedioDestete', label: 'Peso medio (Kg)' },
    { key: 'pesoNacidosKg', label: 'Peso de los nacidos (Kg)' },
    { key: 'gpdKg', label: 'G.P.D. (Kg)' },

    { key: 'indicesDestete', label: 'ÍNDICES COMPLEMENTARIOS DE DESTETE', isHeader: true },
    { key: 'cicloMedio', label: 'Ciclo medio' },
    { key: 'peso21dias', label: 'Peso a los 21 días' },
    { key: 'pesoMadreDestete', label: 'Peso de la madre en el destete' },
    { key: 'variacionPeso', label: 'Variación de Peso (Parto-Destete) (%)', isPercentage: true },
    { key: 'alimentoConsumidoHembra', label: 'Alimento consum. hembra (Kg)' },
    { key: 'consumoHembraDia', label: 'Consumo hembra/día (Kg)' },
    { key: 'alimentoConsumidoLechones', label: 'Alimento consum. lechones (Kg)' },
];


const formatPeriodKey = (date: Date, unit: GroupingUnit): string => {
    switch (unit) {
        case 'year': return getYear(date).toString();
        case 'month': return format(date, 'yyyy-MM');
        case 'week': return `${getYear(date)}-W${getWeek(date, { weekStartsOn: 1, firstWeekContainsDate: 4 })}`;
        case 'day': return format(date, 'yyyy-MM-dd');
    }
};

const getPeriodLabel = (key: string, unit: GroupingUnit): string => {
    try {
        if (unit === 'year') return key;
        if (unit === 'month') return format(parseISO(`${key}-01`), 'MMM yyyy', { locale: es });
        if (unit === 'week') {
            const [year, weekNum] = key.split('-W');
            return `Sem ${weekNum}, ${year}`;
        }
        if (unit === 'day') return format(parseISO(key), 'dd MMM yyyy', { locale: es });
    } catch {
        return key; // Fallback
    }
    return key;
};

const calculateMetrics = (pigs: Pig[], startDate: Date, endDate: Date, unit: GroupingUnit): Map<string, Metrics> => {
    const periodMetrics = new Map<string, Metrics>();
    // This is a placeholder. In a real app, you would have a comprehensive calculation logic
    // based on all pig events.
    return periodMetrics;
};

export default function MaternityPerformancePage() {
    const [pigs, setPigs] = React.useState<Pig[]>([]);
    const [metrics, setMetrics] = React.useState<Map<string, Metrics>>(new Map());
    
    // Period navigation state
    const [currentPeriodIndex, setCurrentPeriodIndex] = React.useState(0);
    const [visiblePeriods, setVisiblePeriods] = React.useState<string[]>([]);
    const [allPeriodKeys, setAllPeriodKeys] = React.useState<string[]>([]);
    const periodsPerPage = 1;


    const [startDate, setStartDate] = React.useState<string>(format(sub(new Date(), { years: 1 }), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = React.useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [groupBy, setGroupBy] = React.useState<GroupingUnit>('month');
    const [breedFilter, setBreedFilter] = React.useState('all');
    const [breedOptions, setBreedOptions] = React.useState<string[]>([]);

    const [openCategories, setOpenCategories] = React.useState<{[key: string]: boolean}>({
        'partos': true, 'nacimientos': true, 'indicesParto': true, 'destete': true,
        'destetados': true, 'indicesDestete': true
    });
    
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
        
        const calculatedMetrics = calculateMetrics(pigs, start, end, groupBy);
        setMetrics(calculatedMetrics);

        let headers: Date[] = [];
        if (groupBy === 'year') headers = eachYearOfInterval({ start, end });
        else if (groupBy === 'month') headers = eachMonthOfInterval({ start, end });
        else if (groupBy === 'week') headers = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
        else if (groupBy === 'day') headers = eachDayOfInterval({ start, end });
        
        const headerKeys = headers.map(d => formatPeriodKey(d, groupBy)).sort();
        setAllPeriodKeys(headerKeys);
        setCurrentPeriodIndex(headerKeys.length > 0 ? headerKeys.length - 1 : 0);

    }, [pigs, startDate, endDate, groupBy, breedFilter]);

     React.useEffect(() => {
        const end = Math.min(currentPeriodIndex + periodsPerPage, allPeriodKeys.length);
        setVisiblePeriods(allPeriodKeys.slice(currentPeriodIndex, end));
    }, [currentPeriodIndex, allPeriodKeys]);

    React.useEffect(() => {
        handleFilter();
    }, [handleFilter]);
    
    const navigatePeriods = (direction: 'next' | 'prev') => {
        if (direction === 'next') {
            setCurrentPeriodIndex(prev => Math.min(prev + periodsPerPage, allPeriodKeys.length - periodsPerPage));
        } else {
            setCurrentPeriodIndex(prev => Math.max(prev - periodsPerPage, 0));
        }
    };


    const toggleCategory = (key: string) => {
        setOpenCategories(prev => ({ ...prev, [key]: !prev[key] }));
    }

    const formatValue = (value?: number, isPercentage = false) => {
        if (value === undefined || value === null || isNaN(value)) return '-';
        if (isPercentage) return value.toFixed(2);
        return Math.round(value).toString();
    };

    const getTableData = () => {
        const head = ['Métricas', 'Metas', ...visiblePeriods.map(p => getPeriodLabel(p, groupBy)), 'Media', 'Total'];
        const body = METRIC_DEFINITIONS.map(metric => {
             if (metric.isHeader) {
                return { isHeader: true, label: metric.label, key: metric.key };
            }
             const categoryKey = METRIC_DEFINITIONS.find(m => m.isHeader && m.key !== metric.key && METRIC_DEFINITIONS.indexOf(m) < METRIC_DEFINITIONS.indexOf(metric))?.key || 'default';

            return {
                isHeader: false, label: metric.label, goal: '-',
                values: visiblePeriods.map(p => '-'),
                average: '-', total: '-',
                isBold: !!metric.isBold,
                isPercentage: !!metric.isPercentage,
                categoryKey
            };
        }).filter(Boolean);

        return { head, body };
    };

    const { head, body } = getTableData();
    
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Desempeño de la maternidad</h1>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Exportar
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>Exportar a PDF</DropdownMenuItem>
                            <DropdownMenuItem>Exportar a CSV</DropdownMenuItem>
                            <DropdownMenuItem>Exportar a Excel (XLSX)</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                
                <Card>
                    <CardContent className="p-4 space-y-4">
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
                                <Label htmlFor="group-by">Agrupar resultados por</Label>
                                <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupingUnit)}>
                                    <SelectTrigger id="group-by"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="year">Año</SelectItem>
                                        <SelectItem value="month">Mes</SelectItem>
                                        <SelectItem value="week">Semana</SelectItem>
                                        <SelectItem value="day">Día</SelectItem>
                                    </SelectContent>
                                </Select>
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
                            <Button className="w-full lg:w-auto"><Filter className="mr-2 h-4 w-4" />Filtrar</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[250px] sticky left-0 bg-card z-10">Mes</TableHead>
                                        <TableHead className="w-[100px] text-center">Metas</TableHead>
                                        {visiblePeriods.length > 0 && (
                                            <TableHead className="min-w-[100px] text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigatePeriods('prev')} disabled={currentPeriodIndex === 0}><ChevronLeft className="h-4 w-4" /></Button>
                                                    <span>{getPeriodLabel(visiblePeriods[0], groupBy)}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigatePeriods('next')} disabled={currentPeriodIndex + periodsPerPage >= allPeriodKeys.length}><ChevronRight className="h-4 w-4" /></Button>
                                                </div>
                                            </TableHead>
                                        )}
                                        <TableHead className="min-w-[100px] text-center font-bold">Media</TableHead>
                                        <TableHead className="min-w-[100px] text-center font-bold">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {body.map((row, index) => {
                                        if (row.isHeader) {
                                            return (
                                                <TableRow key={index} className="bg-muted/50 hover:bg-muted/60 sticky left-0">
                                                    <TableCell 
                                                        className="font-bold sticky left-0 bg-muted/50 z-10 cursor-pointer" 
                                                        onClick={() => toggleCategory(row.key)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {openCategories[row.key] ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                                                            {row.label}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell colSpan={visiblePeriods.length + 3}></TableCell>
                                                </TableRow>
                                            )
                                        }

                                        if (!openCategories[row.categoryKey!]) return null;

                                        return (
                                            <TableRow key={index}>
                                                <TableCell className={cn("sticky left-0 bg-card z-10", row.isBold && "font-bold")}>{row.label}</TableCell>
                                                <TableCell className="text-center">{row.goal}</TableCell>
                                                {row.values.map((val, i) => <TableCell key={i} className="text-center">{val}</TableCell>)}
                                                <TableCell className="text-center">{row.average}</TableCell>
                                                <TableCell className="text-center font-bold">{row.total}</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

    
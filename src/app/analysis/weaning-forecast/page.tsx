
"use client";

import * as React from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Filter, Download, AlertCircle } from 'lucide-react';
import { format, parseISO, isValid, differenceInDays, startOfDay, endOfDay, addDays } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface Event {
    id: string;
    type: string;
    date: string;
    details?: string;
    liveBorn?: number;
    pigletCount?: number;
    [key: string]: any;
}

interface Pig {
    id: string;
    id2?: string;
    breed: string;
    birthDate: string;
    events: Event[];
}

interface WeaningForecast {
    sowId: string;
    sowId2?: string;
    cycle: number;
    farrowingDate: string;
    lactationDays: number;
    weaningDate: string;
    currentPiglets: number;
}

const pigBreeds = [
  "Duroc", "Yorkshire", "Landrace", "Hampshire", "Pietrain", "Berkshire", "Chester White", "Spotted", "Poland China", "Tamworth", "Large Black", "Cerdo Ibérico",
  "PIC", "Topigs Norsvin", "Hypor (Hendrix Genetics)", "DanBred", "Genus", "Choice Genetics", "Genesus",
  "Otro"
];

// Default lactation days, can be made a setting later
const DEFAULT_LACTATION_DURATION = 21;

const findWeaningForecasts = (pigs: Pig[]): WeaningForecast[] => {
    const forecasts: WeaningForecast[] = [];

    pigs.forEach(pig => {
        let cycle = 0;
        let lastFarrowingDate: string | null = null;
        let liveBorn = 0;

        const sortedEvents = [...pig.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        let pigletCount = 0;

        for (const event of sortedEvents) {
            if (event.type === 'Parto') {
                // If there's a pending farrowing, it's finalized here.
                if (lastFarrowingDate) {
                    // This means there was a farrowing without a weaning, which is unlikely but we handle it.
                    cycle++;
                }
                lastFarrowingDate = event.date;
                liveBorn = event.liveBorn || 0;
                pigletCount = liveBorn;
            } else if (event.type === 'Destete') {
                cycle++;
                lastFarrowingDate = null;
                pigletCount = 0;
            } else if (lastFarrowingDate) {
                 if (event.type === 'Muerte de Lechón') pigletCount -= (event.pigletCount || 0);
                 if (event.type === 'Adopción de Lechón') pigletCount += (event.pigletCount || 0);
                 if (event.type === 'Donación de Lechón') pigletCount -= (event.pigletCount || 0);
            }
        }
        
        // If there's a pending farrowing after all events, it's a potential lactation
        if (lastFarrowingDate) {
            const lactationDays = differenceInDays(new Date(), parseISO(lastFarrowingDate));
            const weaningDate = addDays(parseISO(lastFarrowingDate), DEFAULT_LACTATION_DURATION);
            forecasts.push({
                sowId: pig.id,
                sowId2: pig.id2,
                cycle: cycle + 1,
                farrowingDate: lastFarrowingDate,
                lactationDays,
                weaningDate: weaningDate.toISOString(),
                currentPiglets: pigletCount,
            });
        }
    });

    return forecasts;
};

export default function WeaningForecastPage() {
    const [pigs, setPigs] = React.useState<Pig[]>([]);
    const [forecasts, setForecasts] = React.useState<WeaningForecast[]>([]);
    
    // Filter States
    const [startDate, setStartDate] = React.useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = React.useState<string>(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
    const [breedFilter, setBreedFilter] = React.useState('all');
    const [cycleStart, setCycleStart] = React.useState<number | string>('');
    const [cycleEnd, setCycleEnd] = React.useState<number | string>('');

    React.useEffect(() => {
        const pigsFromStorage = localStorage.getItem('pigs');
        const allPigs: Pig[] = pigsFromStorage ? JSON.parse(pigsFromStorage) : [];
        setPigs(allPigs);
    }, []);

    const handleFilter = React.useCallback(() => {
        let filteredPigs = pigs;
        if (breedFilter !== 'all') {
            filteredPigs = filteredPigs.filter(p => p.breed === breedFilter);
        }

        let allForecasts = findWeaningForecasts(filteredPigs);
        
        // Filter by date range
        const start = startOfDay(parseISO(startDate));
        const end = endOfDay(parseISO(endDate));
        allForecasts = allForecasts.filter(f => {
            const farrowDate = parseISO(f.weaningDate);
            return farrowDate >= start && farrowDate <= end;
        });

        // Filter by cycle
        if(cycleStart) allForecasts = allForecasts.filter(f => f.cycle >= Number(cycleStart));
        if(cycleEnd) allForecasts = allForecasts.filter(f => f.cycle <= Number(cycleEnd));
        
        setForecasts(allForecasts.sort((a,b) => new Date(a.weaningDate).getTime() - new Date(b.weaningDate).getTime()));
    }, [pigs, startDate, endDate, breedFilter, cycleStart, cycleEnd]);

    React.useEffect(() => {
        handleFilter();
    }, [handleFilter]);
    
    const handleExport = (formatType: 'pdf' | 'csv' | 'xlsx') => {
        const head = [['ID 1', 'ID 2', 'Ciclo', 'Fecha de Parto', 'Lechones Actuales', 'Días Lact.', 'Prev. Destete']];
        const body = forecasts.map(f => [
            f.sowId,
            f.sowId2 || '-',
            f.cycle,
            format(parseISO(f.farrowingDate), 'dd/MM/yyyy'),
            f.currentPiglets,
            f.lactationDays,
            format(parseISO(f.weaningDate), 'dd/MM/yyyy')
        ]);

        const title = "Previsión de Destete";
        const dateRange = `Período: ${format(parseISO(startDate), 'dd/MM/yyyy')} - ${format(parseISO(endDate), 'dd/MM/yyyy')}`;

        if (formatType === 'pdf') {
            const doc = new jsPDF({ orientation: 'landscape' });
            doc.text(title, 14, 16);
            doc.setFontSize(10);
            doc.text(dateRange, 14, 22);
            autoTable(doc, {
                head: head,
                body: body,
                startY: 28,
                theme: 'grid',
                headStyles: { fillColor: '#e07a5f' },
            });
            doc.save(`prevision_destete_${new Date().toISOString().split('T')[0]}.pdf`);
        }

        if (formatType === 'csv' || formatType === 'xlsx') {
            const dataToExport = [head[0], ...body];
            const ws = XLSX.utils.aoa_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Prevision Destete");
            XLSX.writeFile(wb, `prevision_destete_${new Date().toISOString().split('T')[0]}.${formatType}`);
        }
    };

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <h1 className="text-3xl font-bold tracking-tight">Previsión de Destete</h1>
                
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
                                <Label htmlFor="breed-filter">Buscar por raza de la madre</Label>
                                <Select value={breedFilter} onValueChange={setBreedFilter}>
                                    <SelectTrigger id="breed-filter"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las razas</SelectItem>
                                        {pigBreeds.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Ciclo entre</Label>
                                <div className="flex items-center gap-2">
                                    <Input type="number" placeholder="0" value={cycleStart} onChange={e => setCycleStart(e.target.value)} />
                                    <span>a</span>
                                    <Input type="number" placeholder="20" value={cycleEnd} onChange={e => setCycleEnd(e.target.value)} />
                                </div>
                            </div>
                            <Button onClick={handleFilter}>
                                <Filter className="mr-2 h-4 w-4" />
                                Filtrar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                 <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Información</AlertTitle>
                    <AlertDescription>
                       El listado muestra las madres lactantes cuya fecha de destete (calculada a los {DEFAULT_LACTATION_DURATION} días post-parto) cae dentro del período seleccionado.
                    </AlertDescription>
                </Alert>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Listado de madres con la previsión de destete</CardTitle>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Download className="mr-2 h-4 w-4" />
                                        Exportar
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onSelect={() => handleExport('pdf')}>Exportar a PDF</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleExport('csv')}>Exportar a CSV</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleExport('xlsx')}>Exportar a Excel (XLSX)</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID 1</TableHead>
                                        <TableHead>ID 2</TableHead>
                                        <TableHead>Ciclo</TableHead>
                                        <TableHead>Fecha de Parto</TableHead>
                                        <TableHead>Lechones Act.</TableHead>
                                        <TableHead>Días Lact.</TableHead>
                                        <TableHead>Prev. Destete</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {forecasts.length > 0 ? forecasts.map((record) => (
                                        <TableRow key={record.sowId}>
                                            <TableCell>
                                                <Link href={`/lactation/${record.sowId}`} className="text-primary underline hover:text-primary/80">
                                                    {record.sowId}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{record.sowId2 || '-'}</TableCell>
                                            <TableCell>{record.cycle}</TableCell>
                                            <TableCell>{format(parseISO(record.farrowingDate), 'dd/MM/yyyy')}</TableCell>
                                            <TableCell>{record.currentPiglets}</TableCell>
                                            <TableCell>{record.lactationDays}</TableCell>
                                            <TableCell className="font-semibold">{format(parseISO(record.weaningDate), 'dd/MM/yyyy')}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">No hay destetes previstos para el período y filtros seleccionados.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

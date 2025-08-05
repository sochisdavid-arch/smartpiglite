
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, ChevronsUpDown, UserSearch, Download } from 'lucide-react';
import { format, parseISO, isValid, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
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
    stillborn?: number;
    mummified?: number;
    pigletsWeaned?: number;
    weaningWeight?: number;
    [key: string]: any;
}

interface Pig {
    id: string;
    breed: string;
    birthDate: string;
    status: string;
    gender: string;
    events: Event[];
}

interface CycleData {
    cycle: number;
    serviceDate: string | null;
    farrowingDate: string | null;
    weaningDate: string | null;
    liveBorn: number;
    stillborn: number;
    mummified: number;
    pigletsWeaned: number;
    nonProductiveDays: number;
}

const processSowHistory = (sow: Pig): { cycles: CycleData[], kpis: any } => {
    const cycles: CycleData[] = [];
    let currentCycle: Partial<CycleData> = { cycle: 1 };
    let lastWeaningDate: string | null = null;

    const sortedEvents = [...sow.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedEvents.forEach(event => {
        if (event.type === 'Inseminación' || event.type === 'Monta Natural') {
            if (!currentCycle.serviceDate) {
                 currentCycle.serviceDate = event.date;
                 if(lastWeaningDate) {
                     currentCycle.nonProductiveDays = differenceInDays(parseISO(event.date), parseISO(lastWeaningDate));
                 }
            }
        }
        if (event.type === 'Parto') {
            currentCycle.farrowingDate = event.date;
            currentCycle.liveBorn = event.liveBorn || 0;
            currentCycle.stillborn = event.stillborn || 0;
            currentCycle.mummified = event.mummified || 0;
        }
        if (event.type === 'Destete') {
            currentCycle.weaningDate = event.date;
            currentCycle.pigletsWeaned = event.pigletCount || 0;
            
            // Finalize and push cycle
            if(currentCycle.farrowingDate) {
                 cycles.push(currentCycle as CycleData);
            }
           
            // Reset for next cycle
            lastWeaningDate = event.date;
            currentCycle = { cycle: (currentCycle.cycle || 0) + 1 };
        }
    });

    // Handle ongoing cycle
    if(currentCycle.serviceDate && !currentCycle.weaningDate) {
        cycles.push(currentCycle as CycleData);
    }
    
    // KPIs Calculation
    const totalFarrowings = cycles.filter(c => c.farrowingDate).length;
    const totalLiveBorn = cycles.reduce((sum, c) => sum + c.liveBorn, 0);
    const totalWeaned = cycles.reduce((sum, c) => sum + c.pigletsWeaned, 0);
    const totalNPD = cycles.reduce((sum, c) => sum + (c.nonProductiveDays || 0), 0);
    const farrowingIntervals: number[] = [];
    for(let i = 1; i < cycles.length; i++) {
        if (cycles[i].farrowingDate && cycles[i-1].farrowingDate) {
            farrowingIntervals.push(differenceInDays(parseISO(cycles[i].farrowingDate!), parseISO(cycles[i-1].farrowingDate!)));
        }
    }

    const kpis = {
        totalFarrowings,
        avgLiveBorn: totalFarrowings > 0 ? (totalLiveBorn / totalFarrowings).toFixed(1) : '0.0',
        avgWeaned: totalFarrowings > 0 ? (totalWeaned / totalFarrowings).toFixed(1) : '0.0',
        avgFarrowingInterval: farrowingIntervals.length > 0 ? (farrowingIntervals.reduce((a,b)=> a+b,0) / farrowingIntervals.length).toFixed(0) : '0',
        totalWeanedYear: totalFarrowings > 0 && farrowingIntervals.length > 0 ? ((totalWeaned / totalFarrowings) * (365 / (farrowingIntervals.reduce((a,b)=> a+b,0) / farrowingIntervals.length))).toFixed(1) : '0.0',
        avgNPD: totalFarrowings > 0 ? (totalNPD / totalFarrowings).toFixed(0) : '0',
    }

    return { cycles: cycles.reverse(), kpis }; // reverse to show latest first
};

const EventTimelineStep: React.FC<{event?: Event, title: string, isCompleted: boolean}> = ({ event, title, isCompleted }) => (
    <div className="flex items-start">
        <div className="flex flex-col items-center mr-4">
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", isCompleted ? "bg-primary text-primary-foreground" : "bg-muted border-2")}>
                {isCompleted && <Check className="w-4 h-4" />}
            </div>
            <div className="w-px h-16 bg-border mt-1"></div>
        </div>
        <div className={cn("pt-1", !isCompleted && "text-muted-foreground")}>
            <p className="font-semibold">{title}</p>
            {isCompleted && event && <p className="text-sm">{format(parseISO(event.date), 'dd/MM/yyyy')}</p>}
        </div>
    </div>
);


export default function SowCardPage() {
    const [allSows, setAllSows] = React.useState<Pig[]>([]);
    const [selectedSow, setSelectedSow] = React.useState<Pig | null>(null);
    const [open, setOpen] = React.useState(false);

    const [sowData, setSowData] = React.useState<{cycles: CycleData[], kpis: any} | null>(null);

    React.useEffect(() => {
        const pigsFromStorage = localStorage.getItem('pigs');
        const allPigs: Pig[] = pigsFromStorage ? JSON.parse(pigsFromStorage) : [];
        setAllSows(allPigs.filter(p => p.gender === 'Hembra'));
    }, []);

    React.useEffect(() => {
        if (selectedSow) {
            setSowData(processSowHistory(selectedSow));
        } else {
            setSowData(null);
        }
    }, [selectedSow]);

    const currentCycleEvents = React.useMemo(() => {
        if (!sowData || sowData.cycles.length === 0) return {};
        const lastCycle = sowData.cycles[0];
        if (lastCycle.weaningDate) return {}; // Cycle is complete

        const events = selectedSow?.events.filter(e => lastCycle.serviceDate && e.date >= lastCycle.serviceDate).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        return {
            service: events?.find(e => ['Inseminación', 'Monta Natural'].includes(e.type)),
            pregnancyCheck: events?.find(e => e.type === 'Diagnóstico de Gestación'),
            farrowing: events?.find(e => e.type === 'Parto'),
            weaning: events?.find(e => e.type === 'Destete'),
        }
    }, [sowData, selectedSow]);

    const kpiCards = [
        { title: "Total de Partos", value: sowData?.kpis.totalFarrowings || 0 },
        { title: "Prom. Nacidos Vivos", value: sowData?.kpis.avgLiveBorn || '0.0' },
        { title: "Prom. Destetados", value: sowData?.kpis.avgWeaned || '0.0' },
        { title: "Int. entre Partos (días)", value: sowData?.kpis.avgFarrowingInterval || 0 },
        { title: "Destetados/Hembra/Año", value: sowData?.kpis.totalWeanedYear || '0.0' },
        { title: "Prom. Días No Productivos", value: sowData?.kpis.avgNPD || 0 },
    ];
    
     const handleExport = (formatType: 'pdf' | 'csv' | 'xlsx') => {
        if (!sowData) return;

        const head = [
            ['Ciclo', 'F. Servicio', 'F. Parto', 'F. Destete', 'NV', 'Dest.', 'DNP']
        ];
        const body = sowData.cycles.map(cycle => [
            cycle.cycle,
            cycle.serviceDate ? format(parseISO(cycle.serviceDate), 'dd/MM/yy') : '-',
            cycle.farrowingDate ? format(parseISO(cycle.farrowingDate), 'dd/MM/yy') : '-',
            cycle.weaningDate ? format(parseISO(cycle.weaningDate), 'dd/MM/yy') : '-',
            cycle.liveBorn || 0,
            cycle.pigletsWeaned || 0,
            cycle.nonProductiveDays || 0
        ]);

        const title = `Ficha de la Madre: ${selectedSow?.id}`;

        if (formatType === 'pdf') {
            const doc = new jsPDF();
            doc.text(title, 14, 16);
            autoTable(doc, {
                head: head,
                body: body,
                startY: 22,
                theme: 'grid',
                headStyles: { fillColor: '#e07a5f' },
            });
            doc.save(`ficha_madre_${selectedSow?.id}_${new Date().toISOString().split('T')[0]}.pdf`);
        }

        if (formatType === 'csv' || formatType === 'xlsx') {
            const dataToExport = [head[0], ...body];
            const ws = XLSX.utils.aoa_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Historial Ciclos");
            XLSX.writeFile(wb, `ficha_madre_${selectedSow?.id}_${new Date().toISOString().split('T')[0]}.${formatType}`);
        }
    };

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <UserSearch className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold tracking-tight">Ficha de la Madre</h1>
                    </div>
                </div>

                 <Card>
                    <CardHeader>
                        <CardTitle>Seleccionar Madre</CardTitle>
                        <CardDescription>Busque y seleccione una hembra para ver su historial reproductivo y de productividad.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full max-w-sm justify-between">
                                    {selectedSow ? selectedSow.id : "Seleccionar madre..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Buscar por ID..." />
                                    <CommandList>
                                        <CommandEmpty>No se encontraron madres.</CommandEmpty>
                                        <CommandGroup>
                                            {allSows.map((sow) => (
                                                <CommandItem
                                                    key={sow.id}
                                                    value={sow.id}
                                                    onSelect={(currentValue) => {
                                                        const sowToSelect = allSows.find(s => s.id.toLowerCase() === currentValue.toLowerCase());
                                                        setSelectedSow(sowToSelect || null);
                                                        setOpen(false);
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", selectedSow?.id === sow.id ? "opacity-100" : "opacity-0")}/>
                                                    {sow.id}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </CardContent>
                </Card>

                {selectedSow && sowData && (
                    <>
                        <Card>
                             <CardHeader>
                                <CardTitle>Información General: {selectedSow.id}</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div><span className="font-semibold">Raza:</span> {selectedSow.breed}</div>
                                <div><span className="font-semibold">Edad:</span> {differenceInDays(new Date(), parseISO(selectedSow.birthDate))} días</div>
                                <div><span className="font-semibold">Estado:</span> {selectedSow.status}</div>
                                 <div><span className="font-semibold">Nº Partos:</span> {sowData.kpis.totalFarrowings}</div>
                            </CardContent>
                        </Card>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                           {kpiCards.map(kpi => (
                               <Card key={kpi.title}>
                                   <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{kpi.title}</CardTitle></CardHeader>
                                   <CardContent><p className="text-2xl font-bold">{kpi.value}</p></CardContent>
                               </Card>
                           ))}
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>Historial de Ciclos</CardTitle>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <Download className="mr-2 h-4 w-4" /> Exportar
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onSelect={() => handleExport('pdf')}>PDF</DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleExport('csv')}>CSV</DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleExport('xlsx')}>Excel</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader><TableRow>
                                            <TableHead>Ciclo</TableHead><TableHead>F. Servicio</TableHead><TableHead>F. Parto</TableHead>
                                            <TableHead>F. Destete</TableHead><TableHead>NV</TableHead><TableHead>Dest.</TableHead>
                                            <TableHead>DNP</TableHead>
                                        </TableRow></TableHeader>
                                        <TableBody>
                                            {sowData.cycles.map(cycle => (
                                                <TableRow key={cycle.cycle}>
                                                    <TableCell>{cycle.cycle}</TableCell>
                                                    <TableCell>{cycle.serviceDate ? format(parseISO(cycle.serviceDate), 'dd/MM/yy') : '-'}</TableCell>
                                                    <TableCell>{cycle.farrowingDate ? format(parseISO(cycle.farrowingDate), 'dd/MM/yy') : '-'}</TableCell>
                                                    <TableCell>{cycle.weaningDate ? format(parseISO(cycle.weaningDate), 'dd/MM/yy') : '-'}</TableCell>
                                                    <TableCell>{cycle.liveBorn || 0}</TableCell>
                                                    <TableCell>{cycle.pigletsWeaned || 0}</TableCell>
                                                    <TableCell>{cycle.nonProductiveDays || 0}</TableCell>
                                                </TableRow>
                                            ))}
                                            {sowData.cycles.length === 0 && <TableRow><TableCell colSpan={7} className="h-24 text-center">No hay ciclos finalizados.</TableCell></TableRow>}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle>Línea de Tiempo del Ciclo Actual</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="relative">
                                         <EventTimelineStep event={currentCycleEvents.service} title="Servicio" isCompleted={!!currentCycleEvents.service} />
                                         <EventTimelineStep event={currentCycleEvents.pregnancyCheck} title="Diagnóstico Gestación" isCompleted={!!currentCycleEvents.pregnancyCheck} />
                                         <EventTimelineStep event={currentCycleEvents.farrowing} title="Parto" isCompleted={!!currentCycleEvents.farrowing} />
                                         <EventTimelineStep event={currentCycleEvents.weaning} title="Destete" isCompleted={!!currentCycleEvents.weaning} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

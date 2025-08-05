
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Filter, Search, Calendar as CalendarIcon, MoreHorizontal } from 'lucide-react';
import { format, parseISO, isValid, differenceInDays, startOfDay, endOfDay, sub, eachMonthOfInterval, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Event {
    id: string;
    type: string;
    date: string;
    details?: string;
    [key: string]: any;
}

interface Pig {
    id: string;
    breed: string;
    birthDate: string;
    events: Event[];
}

interface ServiceRecord {
    sowId: string;
    date: string;
    cycle: number;
    breed: string;
    mounts: number;
    employee: string;
    type: 'Inseminación' | 'Monta Natural';
    isRepeat: boolean;
    isGilt: boolean;
}


export default function ServiceAnalysisPage() {
    const { toast } = useToast();
    const [pigs, setPigs] = React.useState<Pig[]>([]);
    const [serviceRecords, setServiceRecords] = React.useState<ServiceRecord[]>([]);

    const [startDate, setStartDate] = React.useState<string>(format(sub(new Date(), { years: 1 }), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = React.useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [breedFilter, setBreedFilter] = React.useState('all');
    const [cycleStart, setCycleStart] = React.useState<number | string>('');
    const [cycleEnd, setCycleEnd] = React.useState<number | string>('');
    const [breedOptions, setBreedOptions] = React.useState<string[]>([]);
    
    // KPI States
    const [totalServices, setTotalServices] = React.useState(0);
    const [giltPercentage, setGiltPercentage] = React.useState(0);
    const [repeatPercentage, setRepeatPercentage] = React.useState(0);
    const [weanedServicePercentage, setWeanedServicePercentage] = React.useState(0);

    // Chart Data
    const [serviceTypeData, setServiceTypeData] = React.useState<{name: string, 'I.A.': number, 'Monta Natural': number}[]>([]);
    const [serviceEvolutionData, setServiceEvolutionData] = React.useState<{name: string, 'Servicios': number}[]>([]);


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
        
        const allServices: ServiceRecord[] = [];
        
        pigs.forEach(pig => {
            let cycle = 0;
            const sortedEvents = [...pig.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            sortedEvents.forEach((event, index) => {
                if(event.type === 'Parto') cycle++;

                if (event.type === 'Inseminación' || event.type === 'Monta Natural') {
                    const eventDate = parseISO(event.date);
                    if (eventDate >= start && eventDate <= end) {
                        
                        const isGilt = cycle === 0 && !pig.events.some(e => e.type === 'Parto' && parseISO(e.date) < eventDate);

                        const previousEvents = sortedEvents.slice(0, index);
                        const lastService = previousEvents.reverse().find(e => e.type === 'Inseminación' || e.type === 'Monta Natural');
                        const isRepeat = !!lastService && differenceInDays(eventDate, parseISO(lastService.date)) < 45; // Example logic for repeat service

                        allServices.push({
                            sowId: pig.id,
                            date: event.date,
                            cycle: cycle + 1,
                            breed: pig.breed,
                            mounts: event.details?.mounts || 1, // Placeholder
                            employee: event.details?.employee || 'N/A', // Placeholder
                            type: event.type,
                            isGilt,
                            isRepeat,
                        });
                    }
                }
            });
        });

        let filtered = allServices;
        if(breedFilter !== 'all') {
            filtered = filtered.filter(s => s.breed === breedFilter);
        }
        if(cycleStart) {
            filtered = filtered.filter(s => s.cycle >= Number(cycleStart));
        }
        if(cycleEnd) {
            filtered = filtered.filter(s => s.cycle <= Number(cycleEnd));
        }

        setServiceRecords(filtered);

        // Calculate KPIs
        const total = filtered.length;
        if (total > 0) {
            const gilts = filtered.filter(s => s.isGilt).length;
            const repeats = filtered.filter(s => s.isRepeat).length;
            const desteteEvents = new Set(pigs.flatMap(p => p.events.filter(e => e.type === 'Destete').map(e => p.id)));
            const weanedServices = filtered.filter(s => !s.isGilt && !s.isRepeat && desteteEvents.has(s.sowId)).length;

            setTotalServices(total);
            setGiltPercentage((gilts / total) * 100);
            setRepeatPercentage((repeats / total) * 100);
            setWeanedServicePercentage((weanedServices / total) * 100);
            
            // Prepare Chart Data
            const iaCount = filtered.filter(s => s.type === 'Inseminación').length;
            const montaCount = filtered.filter(s => s.type === 'Monta Natural').length;
            setServiceTypeData([{ name: 'Tipo de Servicio', 'I.A.': iaCount, 'Monta Natural': montaCount }]);

            const months = eachMonthOfInterval({ start, end });
            const evolutionData = months.map(month => {
                const monthKey = format(month, 'yyyy-MM');
                const monthName = format(month, 'MMM yy', { locale: es });
                const servicesInMonth = filtered.filter(s => format(parseISO(s.date), 'yyyy-MM') === monthKey).length;
                return { name: monthName, 'Servicios': servicesInMonth };
            });
            setServiceEvolutionData(evolutionData);

        } else {
            setTotalServices(0);
            setGiltPercentage(0);
            setRepeatPercentage(0);
            setWeanedServicePercentage(0);
            setServiceTypeData([]);
            setServiceEvolutionData([]);
        }


    }, [pigs, startDate, endDate, breedFilter, cycleStart, cycleEnd]);

    React.useEffect(() => {
        handleFilter();
    }, [handleFilter]);


    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Análisis de Servicios</h1>
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
                                <Label htmlFor="breed-filter">Buscar por raza</Label>
                                <Select value={breedFilter} onValueChange={setBreedFilter}>
                                    <SelectTrigger id="breed-filter"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {breedOptions.map(b => <SelectItem key={b} value={b}>{b === 'all' ? 'Todas las razas' : b}</SelectItem>)}
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">TOTAL DE SERVICIOS</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{totalServices}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">PRIMERIZAS</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{giltPercentage.toFixed(2)}%</div>
                            <p className="text-xs text-muted-foreground">Edad Media: N/A</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">RESERVICIOS</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{repeatPercentage.toFixed(2)}%</div>
                             <p className="text-xs text-muted-foreground">Días entre servicios: N/A</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">DESTETADAS</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{weanedServicePercentage.toFixed(2)}%</div>
                             <p className="text-xs text-muted-foreground">IDS: N/A</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="analysis">
                    <TabsList>
                        <TabsTrigger value="analysis">Análisis de servicios</TabsTrigger>
                        <TabsTrigger value="employee">Servicios por empleado</TabsTrigger>
                        <TabsTrigger value="boar">Servicios por reproductor</TabsTrigger>
                    </TabsList>
                    <TabsContent value="analysis" className="mt-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Servicios por tipo</CardTitle>
                                </CardHeader>
                                <CardContent>
                                     <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={serviceTypeData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" />
                                            <YAxis type="category" dataKey="name" width={110} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="I.A." fill="hsl(var(--chart-1))" name="I.A." radius={[0, 4, 4, 0]} />
                                            <Bar dataKey="Monta Natural" fill="hsl(var(--chart-2))" name="Monta Natural" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle>Evolución de los servicios</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={serviceEvolutionData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="Servicios" stroke="hsl(var(--chart-1))" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="employee"><p>Análisis por empleado próximamente.</p></TabsContent>
                    <TabsContent value="boar"><p>Análisis por reproductor próximamente.</p></TabsContent>
                </Tabs>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Listado de Servicios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Madre</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Ciclo</TableHead>
                                    <TableHead>Raza</TableHead>
                                    <TableHead>Nº de Montas</TableHead>
                                    <TableHead>Empleado</TableHead>
                                    <TableHead>Tipo de Servicio</TableHead>
                                    <TableHead>Reservicio</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {serviceRecords.length > 0 ? serviceRecords.map((record, index) => (
                                    <TableRow key={`${record.sowId}-${index}`}>
                                        <TableCell>
                                            <Link href={`/gestation/${record.sowId}`} className="text-primary underline hover:text-primary/80">
                                                {record.sowId}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{isValid(parseISO(record.date)) ? format(parseISO(record.date), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                        <TableCell>{record.cycle}</TableCell>
                                        <TableCell>{record.breed}</TableCell>
                                        <TableCell>{record.mounts}</TableCell>
                                        <TableCell>{record.employee}</TableCell>
                                        <TableCell>{record.type}</TableCell>
                                        <TableCell>{record.isRepeat ? 'Sí' : 'No'}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">No hay servicios registrados para el período seleccionado.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

    
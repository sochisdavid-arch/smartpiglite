
"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, parseISO, isValid, differenceInDays, addDays } from 'date-fns';
import { Separator } from './ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Award, Baby, HeartPulse, Hourglass, Repeat, Syringe, Weight } from 'lucide-react';

interface Event {
    id: string;
    type: string;
    date: string;
    details?: string;
    liveBorn?: number;
    stillborn?: number;
    mummified?: number;
    pigletCount?: number;
    weaningWeight?: number;
    cause?: string;
    boarId?: string;
    [key: string]: any;
}

interface Pig {
    id: string;
    breed: string;
    birthDate: string;
    status: string;
    gender: string;
    events: Event[];
    [key: string]: any;
}

interface CycleData {
    cycle: number;
    serviceDate?: string;
    farrowingDate?: string;
    weaningDate?: string;
    liveBorn: number;
    stillborn: number;
    mummified: number;
    pigletsWeaned: number;
    nonProductiveDays: number;
    gestationDays?: number;
    lactationDays?: number;
    weaningToServiceDays?: number;
    farrowingInterval?: number;
    boarId?: string;
    totalBorn: number;
    servicesInCycle: number;
}

export interface SowData {
    cycles: CycleData[];
    generalEvents: Event[];
    kpis: any;
}

const KpiCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactElement }) => (
    <Card className="bg-muted/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);


const processSowHistory = (sow: Pig): SowData => {
    const cycles: CycleData[] = [];
    const generalEvents: Event[] = [];
    let cycleCounter = 1;
    let lastWeaningDate: string | null = null;
    let lastFarrowingDate: string | null = null;
    
    let currentCycle: Partial<CycleData> = { cycle: cycleCounter, servicesInCycle: 0, liveBorn: 0, stillborn: 0, mummified: 0, totalBorn: 0, pigletsWeaned: 0, nonProductiveDays: 0 };
    
    const sortedEvents = [...sow.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const event of sortedEvents) {
        switch (event.type) {
            case 'Inseminación':
            case 'Monta Natural':
                if (!currentCycle.serviceDate) {
                    currentCycle.serviceDate = event.date;
                    currentCycle.boarId = event.boarId;
                    if(lastWeaningDate) {
                        currentCycle.weaningToServiceDays = differenceInDays(parseISO(event.date), parseISO(lastWeaningDate));
                    }
                }
                currentCycle.servicesInCycle = (currentCycle.servicesInCycle || 0) + 1;
                break;
            case 'Parto':
                currentCycle.farrowingDate = event.date;
                currentCycle.liveBorn = event.liveBorn || 0;
                currentCycle.stillborn = event.stillborn || 0;
                currentCycle.mummified = event.mummified || 0;
                currentCycle.totalBorn = (event.liveBorn || 0) + (event.stillborn || 0) + (event.mummified || 0);

                if (currentCycle.serviceDate) {
                    currentCycle.gestationDays = differenceInDays(parseISO(event.date), parseISO(currentCycle.serviceDate));
                }
                if (lastFarrowingDate) {
                    currentCycle.farrowingInterval = differenceInDays(parseISO(event.date), parseISO(lastFarrowingDate));
                }

                cycles.push(currentCycle as CycleData);
                
                lastFarrowingDate = event.date;
                cycleCounter++;
                currentCycle = { cycle: cycleCounter, servicesInCycle: 0, liveBorn: 0, stillborn: 0, mummified: 0, totalBorn: 0, pigletsWeaned: 0 };
                break;
            case 'Destete':
                const cycleToUpdate = cycles.find(c => c.farrowingDate === lastFarrowingDate);
                if (cycleToUpdate) {
                    cycleToUpdate.weaningDate = event.date;
                    cycleToUpdate.pigletsWeaned = event.pigletCount || 0;
                    cycleToUpdate.lactationDays = differenceInDays(parseISO(event.date), parseISO(cycleToUpdate.farrowingDate!));
                }
                lastWeaningDate = event.date;
                break;
            default:
                generalEvents.push(event);
        }
    }
    
    // Add current open cycle if it has a service date
    if (currentCycle.serviceDate && !currentCycle.farrowingDate) {
        cycles.push(currentCycle as CycleData);
    }
    
    const farrowingCycles = cycles.filter(c => c.farrowingDate);
    const weanedCycles = cycles.filter(c => c.weaningDate);
    
    const kpis = {
        totalFarrowings: farrowingCycles.length,
        avgTotalBorn: farrowingCycles.length > 0 ? farrowingCycles.reduce((s, c) => s + (c.totalBorn || 0), 0) / farrowingCycles.length : 0,
        avgLiveBorn: farrowingCycles.length > 0 ? farrowingCycles.reduce((s, c) => s + (c.liveBorn || 0), 0) / farrowingCycles.length : 0,
        avgWeaned: weanedCycles.length > 0 ? weanedCycles.reduce((s, c) => s + (c.pigletsWeaned || 0), 0) / weanedCycles.length : 0,
        avgFarrowingInterval: farrowingCycles.filter(c=>c.farrowingInterval).length > 0 ? farrowingCycles.reduce((s, c) => s + (c.farrowingInterval || 0), 0) / farrowingCycles.filter(c=>c.farrowingInterval).length : 0,
        avgGestation: farrowingCycles.filter(c=>c.gestationDays).length > 0 ? farrowingCycles.reduce((s, c) => s + (c.gestationDays || 0), 0) / farrowingCycles.filter(c=>c.gestationDays).length : 0,
        avgLactation: weanedCycles.filter(c=>c.lactationDays).length > 0 ? weanedCycles.reduce((s, c) => s + (c.lactationDays || 0), 0) / weanedCycles.filter(c=>c.lactationDays).length : 0,
        avgWeanToService: cycles.filter(c=>c.weaningToServiceDays).length > 0 ? cycles.reduce((s, c) => s + (c.weaningToServiceDays || 0), 0) / cycles.filter(c=>c.weaningToServiceDays).length : 0,
    };

    return { cycles: cycles.reverse(), generalEvents: generalEvents.reverse(), kpis };
};


export function SowProfileCard({ sow }: { sow: Pig }) {
    const { cycles, generalEvents, kpis } = React.useMemo(() => processSowHistory(sow), [sow]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-3xl">{sow.id}</CardTitle>
                            <CardDescription>{sow.breed} - {isValid(parseISO(sow.birthDate)) ? `${differenceInDays(new Date(), parseISO(sow.birthDate))} días de vida` : 'Fecha de nacimiento inválida'}</CardDescription>
                        </div>
                        <Badge variant={sow.status === 'Gestante' || sow.status === 'Lactante' ? 'default' : 'secondary'} className="text-lg">{sow.status}</Badge>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Indicadores de Rendimiento Clave (Promedios)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KpiCard title="Total de Partos" value={kpis.totalFarrowings.toString()} icon={<Award className="h-4 w-4 text-muted-foreground" />} />
                    <KpiCard title="Nacidos Vivos" value={kpis.avgLiveBorn.toFixed(1)} icon={<Baby className="h-4 w-4 text-muted-foreground" />} />
                    <KpiCard title="Destetados" value={kpis.avgWeaned.toFixed(1)} icon={<Repeat className="h-4 w-4 text-muted-foreground" />} />
                    <KpiCard title="Int. Partos (días)" value={kpis.avgFarrowingInterval.toFixed(0)} icon={<Hourglass className="h-4 w-4 text-muted-foreground" />} />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Historial Reproductivo</CardTitle>
                    <CardDescription>Detalle de cada ciclo productivo de la cerda.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">Ciclo</TableHead>
                                <TableHead>Fecha Servicio</TableHead>
                                <TableHead>Fecha Parto</TableHead>
                                <TableHead>Fecha Destete</TableHead>
                                <TableHead className="text-center">Nac. Vivos</TableHead>
                                <TableHead className="text-center">Destetados</TableHead>
                                <TableHead className="text-center">IPP</TableHead>
                                <TableHead className="text-center">Gest (d)</TableHead>
                                <TableHead className="text-center">Lact (d)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cycles.length > 0 ? cycles.map(cycle => (
                                <TableRow key={cycle.cycle}>
                                    <TableCell className="text-center font-bold">{cycle.cycle}</TableCell>
                                    <TableCell>{cycle.serviceDate ? format(parseISO(cycle.serviceDate), 'dd/MM/yy') : '--'}</TableCell>
                                    <TableCell>{cycle.farrowingDate ? format(parseISO(cycle.farrowingDate), 'dd/MM/yy') : '--'}</TableCell>
                                    <TableCell>{cycle.weaningDate ? format(parseISO(cycle.weaningDate), 'dd/MM/yy') : '--'}</TableCell>
                                    <TableCell className="text-center">{cycle.farrowingDate ? cycle.liveBorn : '--'}</TableCell>
                                    <TableCell className="text-center">{cycle.weaningDate ? cycle.pigletsWeaned : '--'}</TableCell>
                                    <TableCell className="text-center">{cycle.farrowingInterval || '--'}</TableCell>
                                    <TableCell className="text-center">{cycle.gestationDays || '--'}</TableCell>
                                    <TableCell className="text-center">{cycle.lactationDays || '--'}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center">No hay ciclos reproductivos registrados.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Otros Eventos Registrados</CardTitle>
                </CardHeader>
                 <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Tipo de Evento</TableHead>
                                <TableHead>Detalles</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {generalEvents.length > 0 ? generalEvents.map(event => (
                                <TableRow key={event.id}>
                                    <TableCell>{format(parseISO(event.date), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>{event.type}</TableCell>
                                    <TableCell>{event.details}</TableCell>
                                </TableRow>
                             )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">No hay eventos adicionales registrados.</TableCell>
                                </TableRow>
                             )}
                        </TableBody>
                    </Table>
                 </CardContent>
            </Card>
        </div>
    );
}


"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, parseISO, isValid, differenceInDays } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

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
    lastServiceDate?: string;
}

const processSowHistory = (sow: Pig): SowData => {
    const cycles: CycleData[] = [];
    const generalEvents: Event[] = [];
    let cycleCounter = 0;
    let lastWeaningDate: string | null = null;
    let lastFarrowingDate: string | null = null;
    let lastServiceDate: string | null = null;
    
    let currentCycle: Partial<CycleData> = { cycle: 1, servicesInCycle: 0, liveBorn: 0, stillborn: 0, mummified: 0, totalBorn: 0, pigletsWeaned: 0 };
    
    const sortedEvents = [...sow.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const event of sortedEvents) {
        if (event.type === 'Inseminación' || event.type === 'Monta Natural') {
            if (!currentCycle.serviceDate) {
                currentCycle.serviceDate = event.date;
                currentCycle.boarId = event.boarId;
                if(lastWeaningDate) {
                    currentCycle.weaningToServiceDays = differenceInDays(parseISO(event.date), parseISO(lastWeaningDate));
                }
            }
            lastServiceDate = event.date;
            currentCycle.servicesInCycle = (currentCycle.servicesInCycle || 0) + 1;
        } else if (event.type === 'Parto') {
            cycleCounter++;
            currentCycle.cycle = cycleCounter;
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
            currentCycle = { cycle: cycleCounter + 1, servicesInCycle: 0, liveBorn: 0, stillborn: 0, mummified: 0, totalBorn: 0, pigletsWeaned: 0 };
        } else if (event.type === 'Destete') {
            const cycleToUpdate = cycles.find(c => c.farrowingDate === lastFarrowingDate);
            if (cycleToUpdate) {
                cycleToUpdate.weaningDate = event.date;
                cycleToUpdate.pigletsWeaned = event.pigletCount || 0;
                cycleToUpdate.lactationDays = differenceInDays(parseISO(event.date), parseISO(cycleToUpdate.farrowingDate!));
            }
            lastWeaningDate = event.date;
        } else {
            generalEvents.push(event);
        }
    }

    if (currentCycle.serviceDate && !currentCycle.farrowingDate) {
        lastServiceDate = currentCycle.serviceDate;
    }
    
    const farrowingCycles = cycles.filter(c => c.farrowingDate);
    const weanedCycles = cycles.filter(c => c.weaningDate);
    
    const kpis = {
        totalFarrowings: farrowingCycles.length,
        avgTotalBorn: farrowingCycles.length > 0 ? farrowingCycles.reduce((s, c) => s + (c.totalBorn || 0), 0) / farrowingCycles.length : 0,
        avgLiveBorn: farrowingCycles.length > 0 ? farrowingCycles.reduce((s, c) => s + (c.liveBorn || 0), 0) / farrowingCycles.length : 0,
        avgStillborn: farrowingCycles.length > 0 ? farrowingCycles.reduce((s, c) => s + (c.stillborn || 0), 0) / farrowingCycles.length : 0,
        avgMummified: farrowingCycles.length > 0 ? farrowingCycles.reduce((s, c) => s + (c.mummified || 0), 0) / farrowingCycles.length : 0,
        avgWeaned: weanedCycles.length > 0 ? weanedCycles.reduce((s, c) => s + (c.pigletsWeaned || 0), 0) / weanedCycles.length : 0,
        avgFarrowingInterval: farrowingCycles.filter(c=>c.farrowingInterval).length > 0 ? farrowingCycles.reduce((s, c) => s + (c.farrowingInterval || 0), 0) / farrowingCycles.filter(c=>c.farrowingInterval).length : 0,
        avgGestation: farrowingCycles.filter(c=>c.gestationDays).length > 0 ? farrowingCycles.reduce((s, c) => s + (c.gestationDays || 0), 0) / farrowingCycles.filter(c=>c.gestationDays).length : 0,
        avgLactation: weanedCycles.filter(c=>c.lactationDays).length > 0 ? weanedCycles.reduce((s, c) => s + (c.lactationDays || 0), 0) / weanedCycles.filter(c=>c.lactationDays).length : 0,
        avgWeanToService: cycles.filter(c=>c.weaningToServiceDays).length > 0 ? cycles.reduce((s, c) => s + (c.weaningToServiceDays || 0), 0) / cycles.filter(c=>c.weaningToServiceDays).length : 0,
    };

    return { cycles, generalEvents, kpis, lastServiceDate };
};

const FormRow = ({ label, lastValue, avgValue, emptyCols = 4 }: { label: string, lastValue?: string | number, avgValue?: string | number, emptyCols?: number }) => (
    <TableRow className="h-6">
        <TableCell className="font-semibold border p-1 text-xs">{label}</TableCell>
        <TableCell className="border p-1 text-center text-xs">{lastValue ?? '--'}</TableCell>
        <TableCell className="border p-1 text-center text-xs">{avgValue ?? '--'}</TableCell>
        {Array.from({ length: emptyCols }).map((_, i) => <TableCell key={i} className="border p-1"></TableCell>)}
    </TableRow>
);

export function SowProfileCard({ sow }: { sow: Pig }) {
    const { cycles, kpis, lastServiceDate } = React.useMemo(() => processSowHistory(sow), [sow]);
    const lastCycle = cycles[0] || {};
    
    return (
        <div className="bg-white p-4 space-y-2">
            {/* Header */}
            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                <div className="space-y-1">
                    <p><strong>CÓDIGO:</strong> {sow.id}</p>
                    <p><strong>FECHA NACIMIENTO:</strong> {isValid(parseISO(sow.birthDate)) ? format(parseISO(sow.birthDate), 'dd/MM/yyyy') : '--'}</p>
                    <p><strong>GENÉTICA:</strong> {sow.breed}</p>
                </div>
                <div className="flex items-center justify-center">
                    {/* Logo can go here */}
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(window.location.href)}`} alt="QR Code" />
                </div>
                <div className="space-y-1 text-right">
                    <p><strong>ESTADO:</strong> {sow.status}</p>
                    <p><strong>Nº PARTOS:</strong> {kpis.totalFarrowings}</p>
                    <p><strong>UBICACIÓN:</strong> {sow.location || '--'}</p>
                </div>
            </div>

            {/* Main Table */}
            <Table className="border text-xs">
                <TableHeader>
                    <TableRow className="h-6 bg-gray-200">
                        <TableHead className="border p-1 font-bold w-[20%]">PARTOS</TableHead>
                        <TableHead className="border p-1 text-center font-bold">{lastCycle.cycle || '1'}</TableHead>
                        <TableHead className="border p-1 text-center font-bold">PROMEDIO</TableHead>
                        <TableHead className="border p-1 text-center font-bold"></TableHead>
                        <TableHead className="border p-1 text-center font-bold"></TableHead>
                        <TableHead className="border p-1 text-center font-bold"></TableHead>
                        <TableHead className="border p-1 text-center font-bold"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <FormRow label="Fecha Parto" lastValue={lastCycle.farrowingDate ? format(parseISO(lastCycle.farrowingDate), 'dd/MM/yy') : '--'} avgValue="--" />
                    <FormRow label="Total Nacidos" lastValue={lastCycle.totalBorn} avgValue={kpis.avgTotalBorn.toFixed(2)} />
                    <FormRow label="Nacidos Vivos" lastValue={lastCycle.liveBorn} avgValue={kpis.avgLiveBorn.toFixed(2)} />
                    <FormRow label="Nacidos Muertos" lastValue={lastCycle.stillborn} avgValue={kpis.avgStillborn.toFixed(2)} />
                    <FormRow label="Momificados" lastValue={lastCycle.mummified} avgValue={kpis.avgMummified.toFixed(2)} />
                    <FormRow label="Destetados" lastValue={lastCycle.pigletsWeaned} avgValue={kpis.avgWeaned.toFixed(2)} />
                    <FormRow label="Fecha Destete" lastValue={lastCycle.weaningDate ? format(parseISO(lastCycle.weaningDate), 'dd/MM/yy') : '--'} avgValue="--" />
                    <FormRow label="Peso Promedio" />
                    <FormRow label="Intervalo Partos (días)" lastValue={lastCycle.farrowingInterval} avgValue={kpis.avgFarrowingInterval.toFixed(0)} />
                    <FormRow label="Días Gestación" lastValue={lastCycle.gestationDays} avgValue={kpis.avgGestation.toFixed(0)} />
                    <FormRow label="Días Lactancia" lastValue={lastCycle.lactationDays} avgValue={kpis.avgLactation.toFixed(0)} />
                    <FormRow label="Destete a Servicio (días)" lastValue={lastCycle.weaningToServiceDays} avgValue={kpis.avgWeanToService.toFixed(0)} />
                    <TableRow className="h-6 bg-gray-200">
                       <TableCell className="font-semibold border p-1 text-xs" colSpan={7}>CICLO DE SERVICIO ACTUAL</TableCell>
                    </TableRow>
                     <TableRow className="h-6">
                        <TableCell className="font-semibold border p-1">Machos</TableCell>
                        <TableCell className="border p-1 text-center" colSpan={1}>{lastServiceDate ? (cycles.find(c=>c.serviceDate === lastServiceDate)?.boarId || '--') : '--'}</TableCell>
                        <TableCell className="font-semibold border p-1 text-center" colSpan={2}>Servicio + 21 Días</TableCell>
                        <TableCell className="font-semibold border p-1 text-center" colSpan={3}>Servicio + 35 Días</TableCell>
                     </TableRow>
                     <TableRow className="h-6">
                        <TableCell className="font-semibold border p-1">Servicio</TableCell>
                        <TableCell className="border p-1 text-center">{lastServiceDate ? format(parseISO(lastServiceDate), 'dd/MM/yy') : '--'}</TableCell>
                        <TableCell className="font-semibold border p-1 text-center" colSpan={2}>{lastServiceDate ? format(addDays(parseISO(lastServiceDate), 21), 'dd/MM/yy') : '--'}</TableCell>
                        <TableCell className="font-semibold border p-1 text-center" colSpan={3}>{lastServiceDate ? format(addDays(parseISO(lastServiceDate), 35), 'dd/MM/yy') : '--'}</TableCell>
                     </TableRow>
                     <TableRow className="h-6">
                        <TableCell className="font-semibold border p-1">Control Celo</TableCell>
                        <TableCell className="border p-1"></TableCell>
                        <TableCell className="font-semibold border p-1 text-center" colSpan={2}>Diag. Gestación</TableCell>
                        <TableCell className="font-semibold border p-1 text-center" colSpan={3}>F. Estimada Parto</TableCell>
                     </TableRow>
                     <TableRow className="h-6">
                        <TableCell className="border p-1"></TableCell>
                        <TableCell className="border p-1"></TableCell>
                        <TableCell className="border p-1 text-center" colSpan={2}></TableCell>
                        <TableCell className="font-semibold border p-1 text-center" colSpan={3}>{lastServiceDate ? format(addDays(parseISO(lastServiceDate), 114), 'dd/MM/yy') : '--'}</TableCell>
                     </TableRow>

                </TableBody>
            </Table>
            
            {/* Event Tables */}
            <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="col-span-1">
                    <Table className="border text-xs">
                         <TableHeader><TableRow className="bg-gray-200 h-6"><TableHead className="p-1 font-bold text-center">MUERTE LECHONES</TableHead></TableRow></TableHeader>
                         <TableBody>
                            {Array.from({length: 4}).map((_, i) => <TableRow key={i}><TableCell className="border p-1 h-6"></TableCell></TableRow>)}
                         </TableBody>
                    </Table>
                </div>
                 <div className="col-span-1">
                    <Table className="border text-xs">
                         <TableHeader><TableRow className="bg-gray-200 h-6"><TableHead className="p-1 font-bold text-center">CAUSAS MUERTE</TableHead></TableRow></TableHeader>
                         <TableBody>
                            {Array.from({length: 4}).map((_, i) => <TableRow key={i}><TableCell className="border p-1 h-6"></TableCell></TableRow>)}
                         </TableBody>
                    </Table>
                </div>
                 <div className="col-span-1">
                    <Table className="border text-xs">
                         <TableHeader><TableRow className="bg-gray-200 h-6"><TableHead className="p-1 font-bold text-center">CUBRICIONES</TableHead></TableRow></TableHeader>
                         <TableBody>
                           {Array.from({length: 4}).map((_, i) => <TableRow key={i}><TableCell className="border p-1 h-6"></TableCell></TableRow>)}
                         </TableBody>
                    </Table>
                </div>
                 <div className="col-span-1">
                    <Table className="border text-xs">
                         <TableHeader><TableRow className="bg-gray-200 h-6"><TableHead className="p-1 font-bold text-center">ADOPCIONES</TableHead></TableRow></TableHeader>
                         <TableBody>
                           {Array.from({length: 4}).map((_, i) => <TableRow key={i}><TableCell className="border p-1 h-6"></TableCell></TableRow>)}
                         </TableBody>
                    </Table>
                </div>
                 <div className="col-span-1">
                    <Table className="border text-xs">
                         <TableHeader><TableRow className="bg-gray-200 h-6"><TableHead className="p-1 font-bold text-center">NOTAS</TableHead></TableRow></TableHeader>
                         <TableBody>
                            {Array.from({length: 4}).map((_, i) => <TableRow key={i}><TableCell className="border p-1 h-6"></TableCell></TableRow>)}
                         </TableBody>
                    </Table>
                </div>
                 <div className="col-span-1">
                    <Table className="border text-xs">
                         <TableHeader><TableRow className="bg-gray-200 h-6"><TableHead className="p-1 font-bold text-center">DESTETES (PARCIALES)</TableHead></TableRow></TableHeader>
                         <TableBody>
                            {Array.from({length: 4}).map((_, i) => <TableRow key={i}><TableCell className="border p-1 h-6"></TableCell></TableRow>)}
                         </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}

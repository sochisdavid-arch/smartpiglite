
"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, parseISO, isValid, differenceInDays, addDays } from 'date-fns';
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
    lastService?: {
        date: string;
        boarId?: string;
    };
}

const processSowHistory = (sow: Pig): SowData => {
    const cycles: CycleData[] = [];
    const generalEvents: Event[] = [];
    let cycleCounter = 0;
    let lastWeaningDate: string | null = null;
    let lastFarrowingDate: string | null = null;
    
    let servicesSinceLastParto: {date: string, boarId?: string}[] = [];
    
    const sortedEvents = [...sow.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const event of sortedEvents) {
        if (event.type === 'Inseminación' || event.type === 'Monta Natural') {
            servicesSinceLastParto.push({ date: event.date, boarId: event.boarId });
        } else if (event.type === 'Parto') {
            cycleCounter++;
            
            const serviceForCycle = servicesSinceLastParto.length > 0 ? servicesSinceLastParto.shift() : {date: undefined, boarId: undefined};
            
            let farrowingInterval;
            if (lastFarrowingDate) {
                farrowingInterval = differenceInDays(parseISO(event.date), parseISO(lastFarrowingDate));
            }

            let gestationDays;
            if (serviceForCycle?.date) {
                gestationDays = differenceInDays(parseISO(event.date), parseISO(serviceForCycle.date));
            }
            
            cycles.push({
                cycle: cycleCounter,
                serviceDate: serviceForCycle?.date,
                boarId: serviceForCycle?.boarId,
                farrowingDate: event.date,
                liveBorn: event.liveBorn || 0,
                stillborn: event.stillborn || 0,
                mummified: event.mummified || 0,
                totalBorn: (event.liveBorn || 0) + (event.stillborn || 0) + (event.mummified || 0),
                pigletsWeaned: 0,
                gestationDays,
                farrowingInterval,
                servicesInCycle: 1, 
                weaningToServiceDays: lastWeaningDate && serviceForCycle?.date ? differenceInDays(parseISO(serviceForCycle.date), parseISO(lastWeaningDate)) : undefined,
                lactationDays: undefined,
                weaningDate: undefined,
            });
            
             lastFarrowingDate = event.date;
             lastWeaningDate = null;
             servicesSinceLastParto = [];

        } else if (event.type === 'Destete') {
             const farrowingCycle = cycles.find(c => c.farrowingDate === lastFarrowingDate);
             if (farrowingCycle) {
                 farrowingCycle.weaningDate = event.date;
                 farrowingCycle.pigletsWeaned = event.pigletCount || 0;
                 farrowingCycle.lactationDays = differenceInDays(parseISO(event.date), parseISO(farrowingCycle.farrowingDate!));
             }
             lastWeaningDate = event.date;
        } else {
            generalEvents.push(event);
        }
    }
    
    const lastService = servicesSinceLastParto.pop();
    
    const farrowingCycles = cycles.filter(c => c.farrowingDate);
    const weanedCycles = cycles.filter(c => c.weaningDate);
    
    const kpis = {
        totalFarrowings: farrowingCycles.length,
        avgTotalBorn: farrowingCycles.length > 0 ? farrowingCycles.reduce((s, c) => s + (c.totalBorn || 0), 0) / farrowingCycles.length : 0,
        avgLiveBorn: farrowingCycles.length > 0 ? farrowingCycles.reduce((s, c) => s + (c.liveBorn || 0), 0) / farrowingCycles.length : 0,
        avgStillborn: farrowingCycles.length > 0 ? farrowingCycles.reduce((s, c) => s + (c.stillborn || 0), 0) / farrowingCycles.length : 0,
        avgMummified: farrowingCycles.length > 0 ? farrowingCycles.reduce((s, c) => s + (c.mummified || 0), 0) / farrowingCycles.length : 0,
        avgWeaned: weanedCycles.length > 0 ? weanedCycles.reduce((s, c) => s + (c.pigletsWeaned || 0), 0) / weanedCycles.length : 0,
        avgFarrowingInterval: farrowingCycles.filter(c=>c.farrowingInterval).length > 1 ? farrowingCycles.filter(c=>c.farrowingInterval).reduce((s, c) => s + (c.farrowingInterval || 0), 0) / (farrowingCycles.filter(c=>c.farrowingInterval).length - 1) : 0,
        avgGestation: farrowingCycles.filter(c=>c.gestationDays).length > 0 ? farrowingCycles.reduce((s, c) => s + (c.gestationDays || 0), 0) / farrowingCycles.filter(c=>c.gestationDays).length : 0,
        avgLactation: weanedCycles.filter(c=>c.lactationDays).length > 0 ? weanedCycles.reduce((s, c) => s + (c.lactationDays || 0), 0) / weanedCycles.filter(c=>c.lactationDays).length : 0,
        avgWeanToService: cycles.filter(c=>c.weaningToServiceDays && c.weaningToServiceDays >= 0).length > 0 ? cycles.filter(c=>c.weaningToServiceDays && c.weaningToServiceDays >= 0).reduce((s, c) => s + (c.weaningToServiceDays || 0), 0) / cycles.filter(c=>c.weaningToServiceDays && c.weaningToServiceDays >= 0).length : 0,
    };

    return { cycles: cycles.reverse(), generalEvents, kpis, lastService };
};

export function SowProfileCard({ sow }: { sow: Pig }) {
    const { cycles, kpis, lastService } = React.useMemo(() => processSowHistory(sow), [sow]);
    const lastCycle = cycles[0] || {};
    const lastServiceDate = lastService?.date;
    const lastBoarId = lastService?.boarId;
    
    return (
        <div className="bg-white p-2 space-y-1 text-[10px] w-full">
            {/* Encabezado */}
            <div className="grid grid-cols-12 gap-x-2 mb-1">
                <div className="col-span-5 space-y-px">
                    <p className="flex justify-between"><strong>CÓDIGO:</strong> <span className="font-normal">{sow.id}</span></p>
                    <p className="flex justify-between"><strong>ID:</strong> <span className="font-normal">{sow.id}</span></p>
                    <p className="flex justify-between"><strong>FECHA NACIMIENTO:</strong> <span className="font-normal">{isValid(parseISO(sow.birthDate)) ? format(parseISO(sow.birthDate), 'dd/MM/yyyy') : '--'}</span></p>
                    <p className="flex justify-between"><strong>GENÉTICA:</strong> <span className="font-normal">{sow.breed}</span></p>
                </div>
                <div className="col-span-2 flex items-center justify-center">
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${encodeURIComponent(`${window.location.origin}/analysis/sow-card?sowId=${sow.id}`)}`}
                        alt="QR Code"
                        width={50}
                        height={50}
                    />
                </div>
                <div className="col-span-5 space-y-px">
                    <p className="flex justify-between"><strong>GRANJA:</strong> <span className="font-normal">Granja Demo</span></p>
                    <p className="flex justify-between"><strong>ESTADO:</strong> <span className="font-normal">{sow.status}</span></p>
                    <p className="flex justify-between"><strong>Nº PARTOS:</strong> <span className="font-normal">{kpis.totalFarrowings}</span></p>
                    <p className="flex justify-between"><strong>UBICACIÓN:</strong> <span className="font-normal">{sow.location || '--'}</span></p>
                </div>
            </div>

            {/* Tabla Principal */}
            <Table className="border text-[10px]">
                <TableHeader>
                    <TableRow className="h-5 bg-gray-200">
                        <TableHead className="p-1 font-bold w-[25%]">PARTOS</TableHead>
                        <TableHead className="p-1 font-bold text-center w-[10%]">ÚLTIMO</TableHead>
                        <TableHead className="p-1 font-bold text-center w-[10%]">PROMEDIO</TableHead>
                        <TableHead className="p-1 font-bold text-center w-[13%]"></TableHead>
                        <TableHead className="p-1 font-bold text-center w-[13%]"></TableHead>
                        <TableHead className="p-1 font-bold text-center w-[13%]"></TableHead>
                        <TableHead className="p-1 font-bold text-center w-[13%]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                     <TableRow className="h-5"><TableCell className="font-semibold border p-1">Fecha Parto</TableCell><TableCell className="border p-1 text-center">{lastCycle.farrowingDate ? format(parseISO(lastCycle.farrowingDate), 'dd/MM/yy') : '--'}</TableCell><TableCell className="border p-1 text-center">--</TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell></TableRow>
                     <TableRow className="h-5"><TableCell className="font-semibold border p-1">Total Nacidos</TableCell><TableCell className="border p-1 text-center">{lastCycle.totalBorn || '--'}</TableCell><TableCell className="border p-1 text-center">{kpis.avgTotalBorn.toFixed(2)}</TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell></TableRow>
                     <TableRow className="h-5"><TableCell className="font-semibold border p-1">Nacidos Vivos</TableCell><TableCell className="border p-1 text-center">{lastCycle.liveBorn || '--'}</TableCell><TableCell className="border p-1 text-center">{kpis.avgLiveBorn.toFixed(2)}</TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell></TableRow>
                     <TableRow className="h-5"><TableCell className="font-semibold border p-1">Nacidos Muertos</TableCell><TableCell className="border p-1 text-center">{lastCycle.stillborn || '--'}</TableCell><TableCell className="border p-1 text-center">{kpis.avgStillborn.toFixed(2)}</TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell></TableRow>
                     <TableRow className="h-5"><TableCell className="font-semibold border p-1">Momificados</TableCell><TableCell className="border p-1 text-center">{lastCycle.mummified || '--'}</TableCell><TableCell className="border p-1 text-center">{kpis.avgMummified.toFixed(2)}</TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell></TableRow>
                     <TableRow className="h-5"><TableCell className="font-semibold border p-1">Destetados</TableCell><TableCell className="border p-1 text-center">{lastCycle.pigletsWeaned || '--'}</TableCell><TableCell className="border p-1 text-center">{kpis.avgWeaned.toFixed(2)}</TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell></TableRow>
                     <TableRow className="h-5"><TableCell className="font-semibold border p-1">Fecha Destete</TableCell><TableCell className="border p-1 text-center">{lastCycle.weaningDate ? format(parseISO(lastCycle.weaningDate), 'dd/MM/yy') : '--'}</TableCell><TableCell className="border p-1 text-center">--</TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell></TableRow>
                     <TableRow className="h-5"><TableCell className="font-semibold border p-1">Peso Promedio</TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell></TableRow>
                     <TableRow className="h-5"><TableCell className="font-semibold border p-1">Intervalo Partos (días)</TableCell><TableCell className="border p-1 text-center">{lastCycle.farrowingInterval || '--'}</TableCell><TableCell className="border p-1 text-center">{kpis.avgFarrowingInterval.toFixed(0)}</TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell></TableRow>
                     <TableRow className="h-5"><TableCell className="font-semibold border p-1">Días Gestación</TableCell><TableCell className="border p-1 text-center">{lastCycle.gestationDays || '--'}</TableCell><TableCell className="border p-1 text-center">{kpis.avgGestation.toFixed(0)}</TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell></TableRow>
                     <TableRow className="h-5"><TableCell className="font-semibold border p-1">Días Lactancia</TableCell><TableCell className="border p-1 text-center">{lastCycle.lactationDays || '--'}</TableCell><TableCell className="border p-1 text-center">{kpis.avgLactation.toFixed(0)}</TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell></TableRow>
                     <TableRow className="h-5"><TableCell className="font-semibold border p-1">Destete a Servicio (días)</TableCell><TableCell className="border p-1 text-center">{lastCycle.weaningToServiceDays ?? '--'}</TableCell><TableCell className="border p-1 text-center">{kpis.avgWeanToService.toFixed(0)}</TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell><TableCell className="border p-1"></TableCell></TableRow>
                </TableBody>
            </Table>
            
            <Table className="border text-[10px]">
                 <TableBody>
                     <TableRow className="h-6">
                        <TableCell className="font-semibold border p-1 w-[12.5%]">Machos</TableCell>
                        <TableCell className="border p-1 text-center" colSpan={3}>{lastBoarId || '--'}</TableCell>
                        <TableCell className="font-semibold border p-1">Servicio</TableCell>
                        <TableCell className="border p-1 text-center w-[12.5%]">{lastServiceDate ? format(parseISO(lastServiceDate), 'dd/MM/yy') : '--'}</TableCell>
                        <TableCell className="font-semibold border p-1 text-center w-[12.5%]">Servicio + 21 Días</TableCell>
                        <TableCell className="border p-1 text-center w-[12.5%]">{lastServiceDate ? format(addDays(parseISO(lastServiceDate), 21), 'dd/MM/yy') : '--'}</TableCell>
                     </TableRow>
                     <TableRow className="h-6">
                        <TableCell className="font-semibold border p-1">Control Celo</TableCell>
                        <TableCell className="border p-1" colSpan={3}></TableCell>
                        <TableCell className="font-semibold border p-1">Diag. Gestación</TableCell>
                        <TableCell className="border p-1"></TableCell>
                        <TableCell className="font-semibold border p-1 text-center">Servicio + 35 Días</TableCell>
                        <TableCell className="border p-1 text-center">{lastServiceDate ? format(addDays(parseISO(lastServiceDate), 35), 'dd/MM/yy') : '--'}</TableCell>
                     </TableRow>
                      <TableRow className="h-6">
                        <TableCell className="font-semibold border p-1" colSpan={4}></TableCell>
                        <TableCell className="font-semibold border p-1 text-center" colSpan={2}>F. Estimada Parto</TableCell>
                        <TableCell className="border p-1 text-center" colSpan={2}>{lastServiceDate ? format(addDays(parseISO(lastServiceDate), 114), 'dd/MM/yy') : '--'}</TableCell>
                     </TableRow>
                      <TableRow className="h-6">
                        <TableCell className="font-semibold border p-1 text-sm bg-gray-200" colSpan={2}>Fecha Parto: ___________</TableCell>
                        <TableCell className="font-semibold border p-1 text-sm bg-gray-200">Vivos: ____</TableCell>
                        <TableCell className="font-semibold border p-1 text-sm bg-gray-200" colSpan={2}>Ubicación: ____________</TableCell>
                        <TableCell className="font-semibold border p-1 text-sm bg-gray-200" colSpan={3}>Causa de Muerte: ________________</TableCell>
                     </TableRow>
                 </TableBody>
            </Table>
            
            <div className="grid grid-cols-3 gap-1 mt-1">
                <Table className="border text-[10px]">
                     <TableHeader><TableRow className="bg-gray-200 h-5"><TableHead className="p-1 font-bold text-center">MUERTE LECHONES</TableHead></TableRow></TableHeader>
                     <TableBody>
                        {Array.from({length: 4}).map((_, i) => <TableRow key={i}><TableCell className="border p-1 h-5"></TableCell></TableRow>)}
                     </TableBody>
                </Table>
                <Table className="border text-[10px]">
                     <TableHeader><TableRow className="bg-gray-200 h-5"><TableHead className="p-1 font-bold text-center">CAUSAS MUERTE</TableHead></TableRow></TableHeader>
                     <TableBody>
                        {Array.from({length: 4}).map((_, i) => <TableRow key={i}><TableCell className="border p-1 h-5"></TableCell></TableRow>)}
                     </TableBody>
                </Table>
                <Table className="border text-[10px]">
                     <TableHeader><TableRow className="bg-gray-200 h-5"><TableHead className="p-1 font-bold text-center">CUBRICIONES</TableHead></TableRow></TableHeader>
                     <TableBody>
                       {Array.from({length: 4}).map((_, i) => <TableRow key={i}><TableCell className="border p-1 h-5"></TableCell></TableRow>)}
                     </TableBody>
                </Table>
                <Table className="border text-[10px]">
                     <TableHeader><TableRow className="bg-gray-200 h-5"><TableHead className="p-1 font-bold text-center">ADOPCIONES</TableHead></TableRow></TableHeader>
                     <TableBody>
                       {Array.from({length: 4}).map((_, i) => <TableRow key={i}><TableCell className="border p-1 h-5"></TableCell></TableRow>)}
                     </TableBody>
                </Table>
                <Table className="border text-[10px]">
                     <TableHeader><TableRow className="bg-gray-200 h-5"><TableHead className="p-1 font-bold text-center">NOTAS</TableHead></TableRow></TableHeader>
                     <TableBody>
                        {Array.from({length: 4}).map((_, i) => <TableRow key={i}><TableCell className="border p-1 h-5"></TableCell></TableRow>)}
                     </TableBody>
                </Table>
                <Table className="border text-[10px]">
                     <TableHeader><TableRow className="bg-gray-200 h-5"><TableHead className="p-1 font-bold text-center">DESTETES (PARCIALES)</TableHead></TableRow></TableHeader>
                     <TableBody>
                        {Array.from({length: 4}).map((_, i) => <TableRow key={i}><TableCell className="border p-1 h-5"></TableCell></TableRow>)}
                     </TableBody>
                </Table>
            </div>
        </div>
    );
}

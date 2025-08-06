
"use client";

import * as React from 'react';
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO, isValid, differenceInDays, addDays } from 'date-fns';
import Image from 'next/image';

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
    liveBorn?: number;
    stillborn?: number;
    mummified?: number;
    pigletsWeaned?: number;
    nonProductiveDays?: number;
    gestationDays?: number;
    lactationDays?: number;
    weaningWeight?: number;
    avgWeaningWeight?: number;
    farrowingInterval?: number;
    boarId?: string;
    totalBorn?: number;
}

export interface SowData {
    cycles: CycleData[];
    kpis: any;
    currentCycleDetails: any;
    pigletDeaths: any[];
    adoptions: any[];
    services: any[];
}

const processSowHistory = (sow: Pig): SowData => {
    const cycles: CycleData[] = [];
    const pigletDeaths: any[] = [];
    const adoptions: any[] = [];
    const services: any[] = [];
    let lastWeaningDate: string | null = null;
    let lastFarrowingDate: string | null = null;
    let cycle = 1;

    const sortedEvents = [...sow.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedEvents.forEach(event => {
        if(event.type === 'Inseminación' || event.type === 'Monta Natural') {
            services.push(event);
        }
        if(event.type === 'Muerte de Lechón' && isValid(parseISO(event.date))) {
            pigletDeaths.push(event);
        }
        if(event.type === 'Adopción de Lechón' && isValid(parseISO(event.date))) {
            adoptions.push(event);
        }
    });

    let currentCycle: Partial<CycleData> = { cycle: 1 };
    
    for (const event of sortedEvents) {
        if (event.type === 'Inseminación' || event.type === 'Monta Natural') {
            if (!currentCycle.serviceDate) {
                currentCycle.serviceDate = event.date;
                currentCycle.boarId = event.boarId;
                if (lastWeaningDate) {
                    currentCycle.nonProductiveDays = differenceInDays(parseISO(event.date), parseISO(lastWeaningDate));
                }
            }
        } else if (event.type === 'Parto') {
            currentCycle.farrowingDate = event.date;
            currentCycle.liveBorn = event.liveBorn || 0;
            currentCycle.stillborn = event.stillborn || 0;
            currentCycle.mummified = event.mummified || 0;
            currentCycle.totalBorn = (event.liveBorn || 0) + (event.stillborn || 0) + (event.mummified || 0);
            if (currentCycle.serviceDate) {
                currentCycle.gestationDays = differenceInDays(parseISO(event.date), parseISO(currentCycle.serviceDate));
            }
            if(lastFarrowingDate) {
                currentCycle.farrowingInterval = differenceInDays(parseISO(event.date), parseISO(lastFarrowingDate));
            }
            lastFarrowingDate = event.date;
        } else if (event.type === 'Destete') {
            currentCycle.weaningDate = event.date;
            currentCycle.pigletsWeaned = event.pigletCount || 0;
            currentCycle.weaningWeight = event.weaningWeight || 0;
            if (currentCycle.farrowingDate) {
                currentCycle.lactationDays = differenceInDays(parseISO(event.date), parseISO(currentCycle.farrowingDate));
            }
            if (currentCycle.pigletsWeaned > 0 && currentCycle.weaningWeight > 0) {
                 currentCycle.avgWeaningWeight = currentCycle.weaningWeight / currentCycle.pigletsWeaned;
            }
            cycles.push({ ...currentCycle, cycle } as CycleData);
            lastWeaningDate = event.date;
            cycle++;
            currentCycle = { cycle };
        }
    }

    if(currentCycle.serviceDate && !currentCycle.farrowingDate) {
         cycles.push({ ...currentCycle, cycle } as CycleData);
    }
    
    // KPIs Calculation
    const totalFarrowings = cycles.filter(c => c.farrowingDate).length;
    const totalLiveBorn = cycles.reduce((sum, c) => sum + (c.liveBorn || 0), 0);
    const totalStillborn = cycles.reduce((sum, c) => sum + (c.stillborn || 0), 0);
    const totalMummified = cycles.reduce((sum, c) => sum + (c.mummified || 0), 0);
    const totalWeaned = cycles.reduce((sum, c) => sum + (c.pigletsWeaned || 0), 0);
    const totalNPD = cycles.reduce((sum, c) => sum + (c.nonProductiveDays || 0), 0);
    const totalLactationDays = cycles.reduce((sum, c) => sum + (c.lactationDays || 0), 0);
    const totalFarrowingInterval = cycles.reduce((sum, c) => sum + (c.farrowingInterval || 0), 0);
    const weanedCycles = cycles.filter(c => c.pigletsWeaned);
    
    const kpis = {
        totalFarrowings,
        avgLiveBorn: totalFarrowings > 0 ? (totalLiveBorn / totalFarrowings) : 0,
        avgStillborn: totalFarrowings > 0 ? (totalStillborn / totalFarrowings) : 0,
        avgMummified: totalFarrowings > 0 ? (totalMummified / totalFarrowings) : 0,
        avgTotalBorn: totalFarrowings > 0 ? ((totalLiveBorn + totalStillborn + totalMummified) / totalFarrowings) : 0,
        avgWeaned: weanedCycles.length > 0 ? (totalWeaned / weanedCycles.length) : 0,
        avgFarrowingInterval: totalFarrowings > 1 ? (totalFarrowingInterval / (totalFarrowings -1 )) : 0,
        avgNPD: totalFarrowings > 0 ? (totalNPD / totalFarrowings) : 0,
        avgLactationDays: weanedCycles.length > 0 ? (totalLactationDays / weanedCycles.length) : 0,
    };
    
    const lastService = services.slice().reverse().find(s => s.type === 'Inseminación' || s.type === 'Monta Natural');
    const currentCycleDetails = lastService ? {
        serviceDate: lastService.date,
        boarId: lastService.boarId,
        servicePlus21: format(addDays(parseISO(lastService.date), 21), 'dd/MM/yy'),
        servicePlus35: format(addDays(parseISO(lastService.date), 35), 'dd/MM/yy'),
        estimatedFarrowing: format(addDays(parseISO(lastService.date), 114), 'dd/MM/yy'),
    } : {};

    return { cycles: cycles.reverse(), kpis, currentCycleDetails, pigletDeaths, adoptions, services };
};

const InfoField = ({ label, value }: { label: string, value: string | number | undefined }) => (
    <div className="flex text-xs">
        <span className="w-20 font-semibold">{label}:</span>
        <span>{value || '---'}</span>
    </div>
);

const PartoRow = ({ cycle, average }: { cycle?: CycleData, average?: any }) => (
    <div className="grid grid-cols-12 gap-1 text-xs py-0.5">
        <div className="col-span-4 text-left">{cycle ? (cycle.farrowingDate ? format(parseISO(cycle.farrowingDate), 'dd/MM/yy') : 'N/A') : ''}</div>
        <div className="col-span-2 text-center">{cycle?.totalBorn ?? (average?.totalBorn ?? '')}</div>
        <div className="col-span-2 text-center">{cycle?.liveBorn ?? (average?.liveBorn ?? '')}</div>
        <div className="col-span-2 text-center">{cycle?.stillborn ?? (average?.stillborn ?? '')}</div>
        <div className="col-span-2 text-center">{cycle?.mummified ?? (average?.mummified ?? '')}</div>
    </div>
);

const DesteteRow = ({ cycle, average }: { cycle?: CycleData, average?: any }) => (
    <div className="grid grid-cols-12 gap-1 text-xs py-0.5">
        <div className="col-span-3 text-left">{cycle ? (cycle.weaningDate ? format(parseISO(cycle.weaningDate), 'dd/MM/yy') : 'N/A') : ''}</div>
        <div className="col-span-3 text-center">{cycle?.pigletsWeaned ?? (average?.weaned ?? '')}</div>
        <div className="col-span-3 text-center">{cycle?.lactationDays ?? (average?.lactation ?? '')}</div>
        <div className="col-span-3 text-center">{cycle ? (cycle.avgWeaningWeight?.toFixed(2) ?? '') : (average?.weight ?? '')}</div>
    </div>
);


export function SowProfileCard({ sow }: { sow: Pig }) {
    const sowData = React.useMemo(() => processSowHistory(sow), [sow]);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/analysis/sow-card?sowId=${sow.id}`: '')}`;

    return (
        <Card className="p-4 font-sans text-xs">
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-2">
                <div>
                    <h2 className="text-lg font-bold">SmartPig Lite</h2>
                    <p>Hoja de Vida de la Madre</p>
                </div>
                <div className="text-right">
                    <InfoField label="Código" value={sow.id} />
                    <InfoField label="F. Nac" value={isValid(parseISO(sow.birthDate)) ? format(parseISO(sow.birthDate), 'dd/MM/yy') : 'N/A'} />
                    <InfoField label="Genética" value={sow.breed} />
                </div>
                <div className="text-right">
                     <InfoField label="Partos" value={sowData.kpis.totalFarrowings} />
                     <InfoField label="Estado" value={sow.status} />
                </div>
                <div className="flex-shrink-0">
                    <Image src={qrUrl} alt="QR Code" width={80} height={80} data-ai-hint="qr code"/>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="grid grid-cols-2 gap-4 mt-2">
                {/* Left Column */}
                <div className="space-y-2">
                    {/* Partos Resumen */}
                    <div className="border p-1">
                        <h3 className="font-bold text-center border-b">RESUMEN DE PARTOS</h3>
                        <div className="grid grid-cols-12 gap-1 font-bold text-center">
                            <div className="col-span-4">F. Parto</div>
                            <div className="col-span-2">Tot.</div>
                            <div className="col-span-2">Vivos</div>
                            <div className="col-span-2">Muer.</div>
                            <div className="col-span-2">Mom.</div>
                        </div>
                        {sowData.cycles.slice(0, 5).map(c => <PartoRow key={c.cycle} cycle={c} />)}
                         <div className="border-t mt-1 pt-1">
                            <PartoRow average={{totalBorn: 'Avg', liveBorn: sowData.kpis.avgLiveBorn.toFixed(1), stillborn: sowData.kpis.avgStillborn.toFixed(1), mummified: sowData.kpis.avgMummified.toFixed(1)}} />
                         </div>
                    </div>
                     {/* Destetes Resumen */}
                    <div className="border p-1">
                        <h3 className="font-bold text-center border-b">RESUMEN DE DESTETES</h3>
                        <div className="grid grid-cols-12 gap-1 font-bold text-center">
                            <div className="col-span-3">F. Destete</div>
                            <div className="col-span-3">Destetados</div>
                            <div className="col-span-3">Días Lact.</div>
                            <div className="col-span-3">Peso Prom.</div>
                        </div>
                         {sowData.cycles.filter(c => c.weaningDate).slice(0, 5).map(c => <DesteteRow key={c.cycle} cycle={c} />)}
                         <div className="border-t mt-1 pt-1">
                            <DesteteRow average={{weaned: sowData.kpis.avgWeaned.toFixed(1), lactation: sowData.kpis.avgLactationDays.toFixed(1)}} />
                         </div>
                    </div>
                    {/* Muerte Lechones */}
                    <div className="border p-1">
                        <h3 className="font-bold text-center">MUERTE LECHONES</h3>
                        <div className="grid grid-cols-3 font-bold text-center border-b"><div className="col-span-1">Fecha</div><div className="col-span-1">Número</div><div className="col-span-1">Causa</div></div>
                        <div className="h-20 overflow-y-auto">
                            {sowData.pigletDeaths.map(d => (
                                <div key={d.id} className="grid grid-cols-3 text-center"><div className="col-span-1">{format(parseISO(d.date), 'dd/MM/yy')}</div><div className="col-span-1">{d.pigletCount}</div><div className="col-span-1">{d.cause}</div></div>
                            ))}
                        </div>
                    </div>
                    {/* Adopciones */}
                     <div className="border p-1">
                        <h3 className="font-bold text-center">ADOPCIONES</h3>
                        <div className="grid grid-cols-3 font-bold text-center border-b"><div className="col-span-1">Fecha</div><div className="col-span-1">Número</div><div className="col-span-1">Origen</div></div>
                        <div className="h-16 overflow-y-auto">
                           {sowData.adoptions.map(d => (
                                <div key={d.id} className="grid grid-cols-3 text-center"><div className="col-span-1">{format(parseISO(d.date), 'dd/MM/yy')}</div><div className="col-span-1">{d.pigletCount}</div><div className="col-span-1">{d.fromSow}</div></div>
                            ))}
                        </div>
                    </div>

                </div>
                {/* Right Column */}
                <div className="space-y-2">
                    {/* Ciclo Actual */}
                     <div className="border p-1">
                        <h3 className="font-bold text-center border-b">CICLO REPRODUCTIVO ACTUAL</h3>
                        <div className="grid grid-cols-3 gap-1">
                           <div className="text-center border p-1">
                               <div className="font-bold">Servicio</div>
                               <div>{sowData.currentCycleDetails.serviceDate ? format(parseISO(sowData.currentCycleDetails.serviceDate), 'dd/MM/yy') : 'N/A'}</div>
                           </div>
                           <div className="text-center border p-1">
                               <div className="font-bold">Servicio + 21</div>
                               <div>{sowData.currentCycleDetails.servicePlus21 || 'N/A'}</div>
                           </div>
                            <div className="text-center border p-1">
                               <div className="font-bold">Servicio + 35</div>
                               <div>{sowData.currentCycleDetails.servicePlus35 || 'N/A'}</div>
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                             <div className="text-center border p-1">
                               <div className="font-bold">F. Estimada Parto</div>
                               <div>{sowData.currentCycleDetails.estimatedFarrowing || 'N/A'}</div>
                           </div>
                            <div className="text-center border p-1">
                               <div className="font-bold">Macho</div>
                               <div>{sowData.currentCycleDetails.boarId || 'N/A'}</div>
                           </div>
                        </div>
                    </div>

                    {/* Cubriciones */}
                     <div className="border p-1">
                        <h3 className="font-bold text-center">CUBRICIONES</h3>
                        <div className="grid grid-cols-3 font-bold text-center border-b"><div className="col-span-1">Fecha</div><div className="col-span-1">Macho</div><div className="col-span-1">Tipo / Téc</div></div>
                        <div className="h-16 overflow-y-auto">
                            {sowData.services.slice(0, 3).map(s => (
                                <div key={s.id} className="grid grid-cols-3 text-center">
                                    <div className="col-span-1">{format(parseISO(s.date), 'dd/MM/yy')}</div>
                                    <div className="col-span-1">{s.boarId}</div>
                                    <div className="col-span-1">{s.type === 'Inseminación' ? 'IA' : 'MN'}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notas */}
                     <div className="border p-1">
                        <h3 className="font-bold text-center">NOTAS</h3>
                        <div className="h-32"></div>
                    </div>
                    {/* Destetes Parciales */}
                    <div className="border p-1">
                        <h3 className="font-bold text-center">DESTETES PARCIALES</h3>
                        <div className="grid grid-cols-3 font-bold text-center border-b"><div className="col-span-1">Fecha</div><div className="col-span-1">Número</div><div className="col-span-1">Peso Camada</div></div>
                        <div className="h-16"></div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

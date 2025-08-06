
"use client";

import * as React from 'react';
import { Card } from "@/components/ui/card";
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
    
    const totalFarrowings = cycles.filter(c => c.farrowingDate).length;
    const totalLiveBorn = cycles.reduce((sum, c) => sum + (c.liveBorn || 0), 0);
    const totalStillborn = cycles.reduce((sum, c) => sum + (c.stillborn || 0), 0);
    const totalMummified = cycles.reduce((sum, c) => sum + (c.mummified || 0), 0);
    const totalWeaned = cycles.reduce((sum, c) => sum + (c.pigletsWeaned || 0), 0);
    const totalNPD = cycles.reduce((sum, c) => sum + (c.nonProductiveDays || 0), 0);
    const totalLactationDays = cycles.reduce((sum, c) => sum + (c.lactationDays || 0), 0);
    const totalWeaningWeight = cycles.reduce((sum, c) => sum + (c.weaningWeight || 0), 0);
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
        avgWeaningWeight: totalWeaned > 0 ? totalWeaningWeight / totalWeaned : 0,
        totalServices: services.length,
    };
    
    const lastCycle = cycles.slice().reverse().find(c => c.serviceDate) || currentCycle;
    const currentCycleDetails = lastCycle && lastCycle.serviceDate ? {
        serviceDate: lastCycle.serviceDate,
        boarId: lastCycle.boarId,
        servicePlus21: format(addDays(parseISO(lastCycle.serviceDate), 21), 'dd/MM/yy'),
        servicePlus35: format(addDays(parseISO(lastCycle.serviceDate), 35), 'dd/MM/yy'),
        estimatedFarrowing: format(addDays(parseISO(lastCycle.serviceDate), 114), 'dd/MM/yy'),
        farrowingDate: lastCycle.farrowingDate ? format(parseISO(lastCycle.farrowingDate), 'dd/MM/yy') : 'N/A',
        gestationDays: lastCycle.gestationDays,
    } : {};

    return { cycles: cycles.reverse(), kpis, currentCycleDetails, pigletDeaths, adoptions, services };
};

const InfoField = ({ label, value }: { label: string, value: string | number | undefined }) => (
    <div className="flex text-xs">
        <span className="w-16 font-semibold">{label}:</span>
        <span className="font-mono">{value || '---'}</span>
    </div>
);

const DetailField = ({ label, value, value2, avg, avg2 }: {label:string, value?: any, value2?:any, avg?:any, avg2?:any}) => (
     <div className="flex items-center text-[10px] h-4">
        <div className="w-[120px] font-semibold">{label}</div>
        <div className="w-[90px] text-center font-mono">{value}</div>
        <div className="w-[50px] text-center font-mono">{value2}</div>
        <div className="w-[90px] text-center font-mono">{avg}</div>
        <div className="w-[50px] text-center font-mono">{avg2}</div>
    </div>
)


export function SowProfileCard({ sow }: { sow: Pig }) {
    const sowData = React.useMemo(() => processSowHistory(sow), [sow]);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/analysis/sow-card?sowId=${sow.id}`: '')}`;
    const lastCycle = sowData.cycles[0] || {};
    const lastService = sowData.services.slice().reverse()[0];
    
    return (
        <Card className="p-2 font-sans text-[10px] bg-white text-black w-[210mm] min-h-[297mm] flex flex-col">
           {/* Header */}
            <div className="flex justify-between items-start border-b border-black pb-1">
                <div className="flex items-start">
                    <div className="mr-2">
                        <div className="font-bold">Código</div>
                        <div className="text-4xl font-bold">{sow.id.replace(/\D/g, '') || 'N/A'}</div>
                    </div>
                    <div className="text-[10px]">
                        <InfoField label="ID" value={sow.id} />
                        <InfoField label="F. Nac" value={isValid(parseISO(sow.birthDate)) ? `${format(parseISO(sow.birthDate), 'dd/MM/yy')} (${differenceInDays(new Date(), parseISO(sow.birthDate))}d)`: 'N/A'} />
                        <InfoField label="Genética" value={sow.breed} />
                    </div>
                </div>
                <div className="flex-shrink-0 text-[10px]">
                    gordiva Licencia de - 9.6.13-P1 agritecsoft.com
                </div>
                 <div className="text-[10px]">
                     <InfoField label="Partos" value={sowData.kpis.totalFarrowings} />
                     <InfoField label="Estado" value={sow.status} />
                     <InfoField label="Padre" value="---" />
                     <InfoField label="Grupo" value="3" />
                     <InfoField label="Madre" value="---" />
                     <InfoField label="Ubicación" value="---" />
                </div>
            </div>

            {/* Top Section - Main data table */}
            <div className='flex flex-col'>
                {/* Header Row */}
                <div className="grid grid-cols-12 font-bold text-center border-b border-black">
                    <div className="col-span-5 p-1">PARTOS</div>
                    <div className="col-span-2 p-1 border-l border-black">{lastCycle.cycle || '0'}</div>
                    <div className="col-span-2 p-1 border-l border-black">PROMEDIO</div>
                    <div className="col-span-3 p-1 border-l border-black"></div>
                </div>

                {/* Data Rows */}
                <div className="flex text-[10px] border-b border-black">
                    {/* Left Column */}
                    <div className='w-1/2 border-r border-black'>
                        <DetailField label="Fecha Parto" value={lastCycle.farrowingDate ? format(parseISO(lastCycle.farrowingDate), 'dd/MM/yy') : ''} />
                        <DetailField label="Total Nacidos" value={lastCycle.totalBorn} avg={sowData.kpis.avgTotalBorn.toFixed(1)} />
                        <DetailField label="Nacidos Vivos" value={lastCycle.liveBorn} avg={sowData.kpis.avgLiveBorn.toFixed(1)} />
                        <DetailField label="Nacidos Muertos" value={lastCycle.stillborn} avg={sowData.kpis.avgStillborn.toFixed(1)} />
                        <DetailField label="Momificados" value={lastCycle.mummified} avg={sowData.kpis.avgMummified.toFixed(1)} />
                        <DetailField label="Adoptados" value="0" avg="0.0" />
                        <DetailField label="Muertes Registradas" value="0" avg="0.0" />
                        <DetailField label="Intervalo Partos" value={lastCycle.farrowingInterval} avg={sowData.kpis.avgFarrowingInterval.toFixed(0)} />
                        <DetailField label="Días Gestación" value={lastCycle.gestationDays} avg={lastCycle.gestationDays ? lastCycle.gestationDays.toFixed(0) : ''} />
                        <DetailField label="Fecha Destete" value={lastCycle.weaningDate ? format(parseISO(lastCycle.weaningDate), 'dd/MM/yy') : ''} />
                        <DetailField label="Destetados" value={lastCycle.pigletsWeaned} avg={sowData.kpis.avgWeaned.toFixed(1)} />
                        <DetailField label="Camadas Nodriza" value="0" />
                        <DetailField label="Días Lactancia" value={lastCycle.lactationDays} avg={sowData.kpis.avgLactationDays.toFixed(1)} />
                        <DetailField label="Peso Medio" value={lastCycle.avgWeaningWeight?.toFixed(1)} avg={sowData.kpis.avgWeaningWeight.toFixed(1)} />
                        <DetailField label="SPI (BVSP)" />
                        <DetailField label="Número de Servicios" value={sowData.services.length} avg={sowData.kpis.totalServices.toFixed(1)} />
                        <DetailField label="Fecha Último Servicio" value={lastService?.date ? format(parseISO(lastService.date), 'dd/MM/yy') : ''} />
                        <DetailField label="Macho" value={lastService?.boarId || ''} />
                        <DetailField label="Abortos" value="0" avg="0"/>
                        <DetailField label="Último Comentario" />
                    </div>
                     {/* Right Column */}
                    <div className='w-1/2 flex flex-col'>
                         <div className="grid grid-cols-3 gap-1 mb-1 p-1">
                             <div className="border border-black p-1 text-center">
                                <div className="font-bold">Servicio + 21 Días</div>
                                <div>{sowData.currentCycleDetails.servicePlus21}</div>
                            </div>
                            <div className="border border-black p-1 text-center">
                                <div className="font-bold">Servicio + 35 Días</div>
                                <div>{sowData.currentCycleDetails.servicePlus35}</div>
                            </div>
                            <div className="border border-black p-1 text-center">
                                <div className="font-bold">F. Estimada Parto</div>
                                <div>{sowData.currentCycleDetails.estimatedFarrowing}</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-12 gap-1 border-y border-x border-black text-center font-bold">
                            <div className="col-span-3 border-r border-black p-1">F. Nac</div>
                            <div className="col-span-2 border-r border-black p-1">Vivos</div>
                            <div className="col-span-2 border-r border-black p-1">Muertos</div>
                            <div className="col-span-2 border-r border-black p-1">Momificados</div>
                            <div className="col-span-3 p-1">Peso Nac.</div>
                        </div>
                        {Array.from({length: 4}).map((_, i) => (
                            <div key={i} className="grid grid-cols-12 gap-1 border-b border-x border-black h-4">
                                <div className="col-span-3 border-r border-black"></div>
                                <div className="col-span-2 border-r border-black"></div>
                                <div className="col-span-2 border-r border-black"></div>
                                <div className="col-span-2 border-r border-black"></div>
                                <div className="col-span-3"></div>
                            </div>
                        ))}
                         <div className="grid grid-cols-6 gap-1 mt-auto text-center border-t border-b border-black py-1">
                            <div className="font-bold">Machos</div>
                            <div>TRAXX</div>
                            <div>TRAXX</div>
                            <div className="col-span-3">Control Celo:</div>
                        </div>
                        <div className="grid grid-cols-6 gap-1 text-center py-1">
                            <div className="font-bold">Servicio:</div>
                            <div>{lastService?.date ? format(parseISO(lastService.date), 'dd/MM/yy') : ''}</div>
                            <div>{lastService?.date ? format(parseISO(lastService.date), 'dd/MM/yy') : ''}</div>
                            <div className="col-span-3">Diag. Gest: {sowData.currentCycleDetails.servicePlus35}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section - Event tables */}
            <div className="mt-1 flex-grow">
                 <div className="grid grid-cols-2 gap-1">
                    <div>
                         <h4 className="font-bold text-center border border-black">MUERTE LECHONES</h4>
                         <TableShell cols={['Fecha', 'Número', 'Causa']} rows={5}/>
                    </div>
                    <div>
                        <h4 className="font-bold text-center border border-black">CAUSAS MUERTE</h4>
                        <div className="border-x border-b border-black h-[105px]"></div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-1 mt-1">
                    <div>
                         <h4 className="font-bold text-center border border-black">CUBRICIONES</h4>
                         <TableShell cols={['Fecha', 'Macho', 'Tipo /Téc']} rows={5}/>
                    </div>
                    <div>
                         <h4 className="font-bold text-center border border-black">ADOPCIONES</h4>
                         <TableShell cols={['Fecha', 'Número', 'Causa']} rows={5}/>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-1 mt-1">
                    <div>
                         <h4 className="font-bold text-center border border-black">NOTAS</h4>
                         <div className="border-x border-b border-black h-[105px]"></div>
                    </div>
                    <div>
                         <h4 className="font-bold text-center border border-black">DESTETES (PARCIALES)</h4>
                         <TableShell cols={['Fecha', 'Número', 'Peso Camada']} rows={5}/>
                    </div>
                </div>
            </div>

             <div className="flex justify-end mt-auto">
                <Image src={qrUrl} alt="QR Code" width={50} height={50} data-ai-hint="qr code"/>
            </div>
        </Card>
    );
}


const TableShell = ({cols, rows}: {cols: string[], rows: number}) => (
    <div className="text-center">
        <div className={`grid grid-cols-${cols.length} font-bold border-x border-b border-black`}>
            {cols.map(c => <div key={c} className="border-r border-black last:border-r-0 p-0.5">{c}</div>)}
        </div>
        {Array.from({length: rows}).map((_, i) => (
             <div key={i} className={`grid grid-cols-${cols.length} border-x border-b border-black h-4`}>
                 {cols.map((c, j) => <div key={j} className="border-r border-black last:border-r-0"></div>)}
            </div>
        ))}
    </div>
)

    
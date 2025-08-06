
"use client";

import * as React from 'react';
import { Card } from "@/components/ui/card";
import { format, parseISO, isValid, differenceInDays, addDays, differenceInYears, differenceInMonths, differenceInCalendarDays } from 'date-fns';
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
    servicesInCycle?: number;
}

export interface SowData {
    cycles: CycleData[];
    kpis: any;
}

const processSowHistory = (sow: Pig): SowData => {
    const cycles: CycleData[] = [];
    let lastWeaningDate: string | null = null;
    let lastFarrowingDate: string | null = null;
    let cycle = 1;

    const sortedEvents = [...sow.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let currentCycle: Partial<CycleData> & { services: Event[] } = { cycle: 1, services: [] };

    for (const event of sortedEvents) {
        if (event.type === 'Inseminación' || event.type === 'Monta Natural') {
            currentCycle.services?.push(event);
            if (!currentCycle.serviceDate) { // First service of the cycle
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
            currentCycle.servicesInCycle = currentCycle.services?.length;
            cycles.push({ ...currentCycle } as CycleData);
            lastFarrowingDate = event.date;
            cycle++;
            currentCycle = { cycle, services: [] };
        } else if (event.type === 'Destete') {
           const cycleToUpdate = cycles.find(c => c.farrowingDate && !c.weaningDate);
           if (cycleToUpdate) {
                cycleToUpdate.weaningDate = event.date;
                cycleToUpdate.pigletsWeaned = event.pigletCount || 0;
                cycleToUpdate.weaningWeight = event.weaningWeight || 0;
                if (cycleToUpdate.farrowingDate) {
                    cycleToUpdate.lactationDays = differenceInDays(parseISO(event.date), parseISO(cycleToUpdate.farrowingDate));
                }
                if (cycleToUpdate.pigletsWeaned > 0 && cycleToUpdate.weaningWeight > 0) {
                    cycleToUpdate.avgWeaningWeight = cycleToUpdate.weaningWeight / cycleToUpdate.pigletsWeaned;
                }
           }
            lastWeaningDate = event.date;
        }
    }

    if(currentCycle.serviceDate && !currentCycle.farrowingDate) {
         currentCycle.servicesInCycle = currentCycle.services?.length;
         cycles.push({ ...currentCycle } as CycleData);
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
        avgGestationDays: farrowingCycles.length > 0 ? farrowingCycles.reduce((s, c) => s + (c.gestationDays || 0), 0) / farrowingCycles.length : 0,
        avgLactationDays: weanedCycles.length > 0 ? weanedCycles.reduce((s, c) => s + (c.lactationDays || 0), 0) / weanedCycles.length : 0,
        avgFarrowingInterval: cycles.filter(c=>c.farrowingInterval).length > 0 ? cycles.reduce((s, c) => s + (c.farrowingInterval || 0), 0) / cycles.filter(c=>c.farrowingInterval).length : 0,
        avgWeaningWeight: weanedCycles.length > 0 ? weanedCycles.reduce((s, c) => s + (c.avgWeaningWeight || 0), 0) / weanedCycles.length : 0,
        avgServices: cycles.length > 0 ? cycles.reduce((s, c) => s + (c.servicesInCycle || 0), 0) / cycles.length : 0
    };

    return { cycles: cycles.reverse(), kpis };
};


const formatAge = (birthDate: string) => {
    if (!isValid(parseISO(birthDate))) return '';
    const today = new Date();
    const date = parseISO(birthDate);
    const years = differenceInYears(today, date);
    const months = differenceInMonths(today, date) % 12;
    const days = differenceInCalendarDays(today, addDays(date, years * 365 + months * 30)) % 30; // Approximation
    return `(${years}A ${months}M ${days}D)`;
}

const InfoField = ({ label, value, className = '' }: { label: string, value: string | number | undefined, className?: string }) => (
    <div className={`flex text-xs ${className}`}>
        <span className="w-14 font-semibold">{label}:</span>
        <span className="font-mono">{value || '---'}</span>
    </div>
);

const MainTableRow = ({ label, cycleData, avgData, isHeader = false }: { label: string, cycleData?: any, avgData?: any, isHeader?: boolean }) => (
    <div className={`flex items-center text-xs border-b border-black h-5 ${isHeader ? 'bg-gray-200 font-bold' : ''}`}>
        <div className="w-[140px] font-semibold pl-1">{label}</div>
        <div className="w-[80px] text-center font-mono border-l-2 border-black">{cycleData !== undefined ? cycleData : ''}</div>
        <div className="w-[80px] text-center font-mono border-l-2 border-black">{avgData !== undefined ? avgData : ''}</div>
    </div>
)

export function SowProfileCard({ sow }: { sow: Pig }) {
    const { cycles, kpis } = React.useMemo(() => processSowHistory(sow), [sow]);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/analysis/sow-card?sowId=${sow.id}`: '')}`;
    const lastCycle = cycles.find(c => c.farrowingDate) || {}; // Last cycle with a farrowing
    const currentServiceCycle = cycles.find(c => c.serviceDate && !c.farrowingDate) || lastCycle || {};

    return (
        <Card className="p-2 font-sans text-black bg-white w-full flex flex-col text-[11px] print:shadow-none print:border-none">
           {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-1">
                <div className="flex items-start">
                    <div className="mr-4">
                        <div className="font-bold">Código</div>
                        <div className="text-4xl font-bold">{sow.id.replace(/\D/g, '') || 'N/A'}</div>
                    </div>
                    <div>
                        <InfoField label="ID" value={sow.id} />
                        <InfoField label="F. Nac" value={`${isValid(parseISO(sow.birthDate)) ? format(parseISO(sow.birthDate), 'dd/MM/yy') : ''} ${formatAge(sow.birthDate)}`} />
                        <InfoField label="Genética" value={sow.breed} />
                    </div>
                </div>
                 <div className="flex flex-col text-xs">
                     <div className="flex justify-between">
                         <span className="text-[10px]">gordiva Licencia de - 9.6.13-P1 agritecsoft.com</span>
                         <Image src="https://placehold.co/80x20.png" alt="Logo" width={80} height={20} className="ml-auto" data-ai-hint="logo"/>
                     </div>
                     <div className="grid grid-cols-2 gap-x-4">
                        <InfoField label="Partos" value={kpis.totalFarrowings} />
                        <InfoField label="Estado" value={sow.status} />
                        <InfoField label="Padre" value="---" />
                        <InfoField label="Grupo" value="---" />
                        <InfoField label="Madre" value="---" />
                        <InfoField label="Ubicación" value="---" />
                     </div>
                </div>
            </div>

            {/* Main Table */}
            <div className='flex flex-col border-2 border-black border-t-0'>
                {/* Headers */}
                <div className="flex border-b-2 border-black">
                    <div className="w-[140px] font-bold text-center p-1">PARTOS</div>
                    <div className="w-[80px] font-bold text-center p-1 border-l-2 border-black">{lastCycle.cycle || kpis.totalFarrowings || 0}</div>
                    <div className="w-[80px] font-bold text-center p-1 border-l-2 border-black">PROMEDIO</div>
                    {/* Empty headers for future cycles */}
                    <div className="flex-1 border-l-2 border-black"></div>
                </div>
                
                {/* Body */}
                <div className="flex">
                    <div className="w-[300px] flex-shrink-0">
                        <MainTableRow label="Fecha Parto" cycleData={lastCycle.farrowingDate ? format(parseISO(lastCycle.farrowingDate), 'dd/MM/yy') : ''} />
                        <MainTableRow label="Total Nacidos" cycleData={lastCycle.totalBorn} avgData={kpis.avgTotalBorn.toFixed(1)} />
                        <MainTableRow label="Nacidos Vivos" cycleData={lastCycle.liveBorn} avgData={kpis.avgLiveBorn.toFixed(1)} />
                        <MainTableRow label="Nacidos Muertos" cycleData={lastCycle.stillborn} avgData={kpis.avgStillborn.toFixed(1)} />
                        <MainTableRow label="Momificados" cycleData={lastCycle.mummified} avgData={kpis.avgMummified.toFixed(1)} />
                        <MainTableRow label="Adoptados" cycleData={0} avgData={'0.0'}/>
                        <MainTableRow label="Muertes Registradas" cycleData={0} avgData={'0.0'} />
                        <MainTableRow label="Intervalo Partos" cycleData={lastCycle.farrowingInterval} avgData={kpis.avgFarrowingInterval > 0 ? kpis.avgFarrowingInterval.toFixed(0) : ''} />
                        <MainTableRow label="Días Gestación" cycleData={lastCycle.gestationDays} avgData={kpis.avgGestationDays > 0 ? kpis.avgGestationDays.toFixed(0) : ''} />
                        <MainTableRow label="Fecha Destete" cycleData={lastCycle.weaningDate ? format(parseISO(lastCycle.weaningDate), 'dd/MM/yy') : ''}/>
                        <MainTableRow label="Destetados" cycleData={lastCycle.pigletsWeaned} avgData={kpis.avgWeaned.toFixed(1)} />
                        <MainTableRow label="Camadas Nodriza" cycleData={0}/>
                        <MainTableRow label="Días Lactancia" cycleData={lastCycle.lactationDays} avgData={kpis.avgLactationDays.toFixed(1)}/>
                        <MainTableRow label="Peso Medio" cycleData={lastCycle.avgWeaningWeight?.toFixed(1)} avgData={kpis.avgWeaningWeight.toFixed(1)} />
                        <MainTableRow label="SPI (BVSP)" />
                        <MainTableRow label="Número de Servicios" cycleData={currentServiceCycle.servicesInCycle} avgData={kpis.avgServices.toFixed(1)}/>
                        <MainTableRow label="Fecha Último Servicio" cycleData={currentServiceCycle.serviceDate ? format(parseISO(currentServiceCycle.serviceDate), 'dd/MM/yy') : ''} />
                        <MainTableRow label="Macho" cycleData={currentServiceCycle.boarId}/>
                        <MainTableRow label="Abortos" cycleData={0} avgData={'0'}/>
                        <MainTableRow label="Último Comentario" />
                    </div>
                     {/* Empty space for future cycles */}
                    <div className="flex-1 border-l-2 border-black">
                        <div className="h-full">&nbsp;</div>
                    </div>
                </div>

                 <div className="grid grid-cols-[140px_1fr] border-t-2 border-black text-xs">
                    <div className="p-1 font-bold flex items-center">Machos: {currentServiceCycle.boarId || ''}</div>
                    <div className="p-1 font-bold border-l-2 border-black grid grid-cols-4 items-center">
                        <div>Servicio: {currentServiceCycle.serviceDate ? format(parseISO(currentServiceCycle.serviceDate), 'dd/MM/yy') : ''}</div>
                        <div>Control Celo:</div>
                        <div>Diag. Gest.:</div>
                        <div>F. Parto:</div>
                    </div>
                </div>
                 <div className="grid grid-cols-[140px_1fr] border-y-2 border-black text-xs">
                    <div className="p-1 font-bold">Servicio + 21 Días</div>
                    <div className="p-1 font-bold border-l-2 border-black grid grid-cols-4 items-center">
                        <div>{currentServiceCycle.serviceDate ? format(addDays(parseISO(currentServiceCycle.serviceDate), 21), 'dd/MM/yy') : ''}</div>
                        <div className="col-span-2">
                            <span className="font-bold">Servicio + 35 Días: </span>
                             {currentServiceCycle.serviceDate ? format(addDays(parseISO(currentServiceCycle.serviceDate), 35), 'dd/MM/yy') : ''}
                        </div>
                        <div className="flex justify-between items-center">
                             <div>
                                <span className="font-bold">F. Estimada Parto: </span>
                                {currentServiceCycle.serviceDate ? format(addDays(parseISO(currentServiceCycle.serviceDate), 114), 'dd/MM/yy') : ''}
                            </div>
                            <Image src={qrUrl} alt="QR Code" width={40} height={40} data-ai-hint="barcode" className="mr-2"/>
                        </div>
                    </div>
                </div>
                 <div className="grid grid-cols-[140px_1fr] border-b-2 border-black text-xs h-6">
                    <div className="p-1 font-bold">F. Nac</div>
                    <div className="p-1 font-bold border-l-2 border-black grid grid-cols-6">
                        <div className="border-r-2 border-black text-center">Vivos</div>
                        <div className="border-r-2 border-black text-center">Muertos</div>
                        <div className="border-r-2 border-black text-center">Momificados</div>
                        <div className="border-r-2 border-black text-center">Peso Nac.</div>
                        <div className="border-r-2 border-black text-center">Código camada</div>
                        <div className="text-center">Ubicación</div>
                    </div>
                </div>
            </div>
            
            <div className="mt-1 flex-grow grid grid-cols-3 grid-rows-2 gap-1">
                <TableShell title="MUERTE LECHONES" cols={['Fecha', 'Número', 'Causa']} rows={4}/>
                <TableShell title="CAUSAS MUERTE" cols={['COLAS']} rows={4}/>
                <TableShell title="CUBRICIONES" cols={['Fecha', 'Macho', 'Tipo /Téc']} rows={4}/>
                <TableShell title="ADOPCIONES" cols={['Fecha', 'Número', 'Causa']} rows={4}/>
                <TableShell title="NOTAS" cols={[]} rows={4}/>
                <TableShell title="DESTETES (PARCIALES)" cols={['Fecha', 'Número', 'Peso Camada']} rows={4}/>
            </div>
        </Card>
    );
}

const TableShell = ({title, cols, rows}: {title: string, cols: string[], rows: number}) => (
    <div className="border-2 border-black flex flex-col">
        <h4 className="font-bold text-center border-b-2 border-black py-0.5">{title}</h4>
        {cols.length > 0 && (
             <div className={`grid grid-cols-${cols.length} font-bold border-b-2 border-black text-center divide-x-2 divide-black`}>
                {cols.map(c => <div key={c} className="p-0.5">{c}</div>)}
            </div>
        )}
        <div className="flex-grow grid grid-rows-4">
            {Array.from({length: rows}).map((_, i) => (
                <div key={i} className={`grid grid-cols-${cols.length > 0 ? cols.length : 1} border-t border-black h-full`}>
                    {cols.length > 0 ? cols.map((c, j) => <div key={j} className="border-r-2 border-black last:border-r-0"></div>) : <div></div>}
                </div>
            ))}
        </div>
    </div>
);

    
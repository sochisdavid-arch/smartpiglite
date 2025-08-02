
"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { Label } from '@/components/ui/label';

// Mock data, in a real app this would come from an API and be dynamic.
interface NurseryBatch {
    id: string;
    creationDate: string;
    pigletCount: number;
    avgWeight: number;
    avgAge: number;
    sows: string[];
    status: 'Activo' | 'Finalizado';
}

interface WeeklyConsumption {
    week: number;
    days: number[];
    total: number;
    accumulated: number;
    inventory: number;
    avgPerPig: number;
    avgDaily: number;
}

interface MortalityRecord {
    date: string;
    count: number;
    weight: number;
    accumulated: number;
    cause: string;
    observations: string;
}


export default function LotePreceboPage() {
    const router = useRouter();
    const params = useParams();
    const loteId = params.loteId as string;

    const [lote, setLote] = React.useState<NurseryBatch | null>(null);
    const [consumption, setConsumption] = React.useState<WeeklyConsumption[]>([]);
    const [mortality, setMortality] = React.useState<MortalityRecord[]>([]);

    React.useEffect(() => {
        if (loteId) {
            const storedBatches = localStorage.getItem('nurseryBatches');
            if (storedBatches) {
                const batchData = JSON.parse(storedBatches);
                const foundBatch = batchData[loteId];
                if (foundBatch) {
                    setLote(foundBatch);
                }
            }
        }
    }, [loteId]);
    

    if (!lote) {
        return (
            <AppLayout>
                <div className="flex justify-center items-center h-full">
                    <p>Cargando datos del lote...</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push('/precebo')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Registro de Lote Precebo: {lote.id}</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Información General del Lote</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-x-8 gap-y-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-1">
                            <Label>Fecha Ingreso</Label>
                            <p className="font-semibold">{isValid(parseISO(lote.creationDate)) ? format(parseISO(lote.creationDate), 'dd/MM/yyyy') : 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <Label>Número Inicial Animales</Label>
                            <p className="font-semibold">{lote.pigletCount}</p>
                        </div>
                        <div className="space-y-1">
                            <Label>Peso Promedio Inicial (kg)</Label>
                            <p className="font-semibold">{lote.avgWeight}</p>
                        </div>
                         <div className="space-y-1">
                            <Label>Edad Promedio Ingreso (días)</Label>
                            <p className="font-semibold">{lote.avgAge}</p>
                        </div>
                        <div className="space-y-1">
                            <Label>Corral Asignado</Label>
                            <p className="font-semibold">PRECEBO-01</p>
                        </div>
                         <div className="space-y-1">
                            <Label>Número Final Animales</Label>
                            <p className="font-semibold">{lote.pigletCount - mortality.reduce((acc, curr) => acc + curr.count, 0)}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1.5">
                            <CardTitle>Registro Semanal de Consumo</CardTitle>
                            <CardDescription>Registre el consumo de alimento del lote por semana.</CardDescription>
                        </div>
                         <Button size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Registrar Semana
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">Sem</TableHead>
                                    <TableHead>L</TableHead>
                                    <TableHead>M</TableHead>
                                    <TableHead>M</TableHead>
                                    <TableHead>J</TableHead>
                                    <TableHead>V</TableHead>
                                    <TableHead>S</TableHead>
                                    <TableHead>D</TableHead>
                                    <TableHead className="text-right">Total Sem (kg)</TableHead>
                                    <TableHead className="text-right">Acum (kg)</TableHead>
                                    <TableHead className="text-right">Cons/Cerdo</TableHead>
                                    <TableHead className="text-right">Cons/Día</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {consumption.length > 0 ? consumption.map(c => (
                                    <TableRow key={c.week}>
                                        <TableCell>{c.week}</TableCell>
                                        {c.days.map((d, i) => <TableCell key={i}>{d}</TableCell>)}
                                        <TableCell className="text-right">{c.total}</TableCell>
                                        <TableCell className="text-right">{c.accumulated}</TableCell>
                                        <TableCell className="text-right">{c.avgPerPig.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">{c.avgDaily.toFixed(2)}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={12} className="h-24 text-center">
                                            No hay registros de consumo para este lote.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1.5">
                            <CardTitle>Registro de Ventas y Muertes</CardTitle>
                            <CardDescription>Registre las bajas que ocurran en el lote.</CardDescription>
                        </div>
                         <Button size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Registrar Baja
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead className="text-center">Nº</TableHead>
                                    <TableHead className="text-center">Peso (kg)</TableHead>
                                    <TableHead>Causa</TableHead>
                                    <TableHead>Observaciones</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {mortality.length > 0 ? mortality.map(m => (
                                    <TableRow key={m.date}>
                                        <TableCell>{m.date}</TableCell>
                                        <TableCell className="text-center">{m.count}</TableCell>
                                        <TableCell className="text-center">{m.weight}</TableCell>
                                        <TableCell>{m.cause}</TableCell>
                                        <TableCell>{m.observations}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No hay registros de bajas para este lote.
                                        </TableCell>
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

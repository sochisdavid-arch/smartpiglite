
"use client";

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Syringe, Baby, HeartPulse, XCircle, Beaker } from 'lucide-react';
import { format, parseISO, differenceInWeeks, isValid, addDays } from 'date-fns';

// Mock data - in a real app, this would come from an API
type EventType = "Celo" | "Celo no Servido" | "Inseminación" | "Parto" | "Aborto" | "Tratamiento" | "Vacunación" | "Venta" | "Descarte" | "Muerte";
type StatusType = 'Gestante' | 'Vacia' | 'Destetada' | 'Remplazo' | 'Lactante';

interface Event {
    type: EventType | 'Ninguno';
    date: string;
    inseminationGroup?: string;
    details?: string;
}

interface Pig {
    id: string;
    breed: string;
    birthDate: string;
    arrivalDate: string;
    weight: number;
    gender: string;
    purchaseValue?: number;
    age: number;
    status: StatusType;
    lastEvent: Event;
    events: Event[];
}

const initialPigs: Pig[] = [
  { 
    id: 'PIG-001', 
    breed: 'Duroc', 
    birthDate: '2024-04-15', 
    arrivalDate: '2024-05-01', 
    weight: 85, 
    gender: 'Hembra', 
    purchaseValue: 150, 
    age: 0, 
    status: 'Gestante', 
    lastEvent: { type: 'Inseminación', date: '2024-06-10', inseminationGroup: 'SEMANA-24' }, 
    events: [
        { type: 'Inseminación', date: '2024-06-10', inseminationGroup: 'SEMANA-24', details: 'Inseminado por Operario A con semen de macho M-012.' },
        { type: 'Vacunación', date: '2024-06-01', details: 'Vacuna contra Parvovirus.' },
        { type: 'Tratamiento', date: '2024-05-15', details: 'Desparasitación interna.' }
    ] 
  },
  { id: 'PIG-002', breed: 'Yorkshire', birthDate: '2024-05-13', arrivalDate: '2024-06-01', weight: 60, gender: 'Hembra', purchaseValue: 160, age: 0, status: 'Vacia', lastEvent: { type: 'Celo no Servido', date: '2024-07-01' }, events: [{ type: 'Celo no Servido', date: '2024-07-01', details: 'Baja condición corporal.' }] },
  { id: 'PIG-003', breed: 'Landrace', birthDate: '2024-02-26', arrivalDate: '2024-03-15', weight: 110, gender: 'Hembra', purchaseValue: 155, age: 0, status: 'Destetada', lastEvent: { type: 'Parto', date: '2024-05-20' }, events: [{ type: 'Parto', date: '2024-05-20', details: '12 nacidos vivos.' }] },
];

const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const date = parseISO(birthDate);
    if (!isValid(date)) return 0;
    return differenceInWeeks(new Date(), date);
}

const calculateProbableFarrowingDate = (inseminationDate: string) => {
    if (inseminationDate) {
        const date = parseISO(inseminationDate);
        if (isValid(date)) {
            return format(addDays(date, 114), 'dd/MM/yyyy');
        }
    }
    return 'N/A';
};

const getStatusVariant = (status: StatusType) => {
    switch (status) {
      case 'Gestante': return 'default';
      case 'Lactante': return 'default';
      case 'Destetada': return 'secondary';
      case 'Vacia': return 'destructive';
      case 'Remplazo': return 'outline';
      default: return 'secondary';
    }
};

const eventIcons: { [key in EventType]: React.ReactElement } = {
    "Inseminación": <HeartPulse className="h-5 w-5 text-pink-500" />,
    "Parto": <Baby className="h-5 w-5 text-blue-500" />,
    "Tratamiento": <Syringe className="h-5 w-5 text-red-500" />,
    "Vacunación": <Syringe className="h-5 w-5 text-green-500" />,
    "Aborto": <XCircle className="h-5 w-5 text-destructive" />,
    "Celo": <HeartPulse className="h-5 w-5 text-orange-500" />,
    "Celo no Servido": <HeartPulse className="h-5 w-5 text-muted-foreground" />,
    "Venta": <XCircle className="h-5 w-5" />,
    "Descarte": <XCircle className="h-5 w-5" />,
    "Muerte": <XCircle className="h-5 w-5" />,
};

export default function PigHistoryPage() {
    const router = useRouter();
    const params = useParams();
    const pigId = params.pigId as string;
    
    const [pig, setPig] = React.useState<Pig | null>(null);

    React.useEffect(() => {
        const foundPig = initialPigs.find(p => p.id === pigId);
        if (foundPig) {
            setPig({...foundPig, age: calculateAge(foundPig.birthDate)});
        }
    }, [pigId]);

    if (!pig) {
        return (
            <AppLayout>
                <div className="flex justify-center items-center h-full">
                    <p>Cargando datos del animal...</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Hoja de Vida: {pig.id}</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Información General</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-1">
                            <Label>Raza</Label>
                            <p className="font-semibold">{pig.breed}</p>
                        </div>
                        <div className="space-y-1">
                            <Label>Edad</Label>
                            <p className="font-semibold">{pig.age} semanas</p>
                        </div>
                        <div className="space-y-1">
                            <Label>Estado Actual</Label>
                            <p><Badge variant={getStatusVariant(pig.status)}>{pig.status}</Badge></p>
                        </div>
                         <div className="space-y-1">
                            <Label>F. Parto Probable</Label>
                            <p className="font-semibold">
                                {pig.status === 'Gestante' && pig.lastEvent.type === 'Inseminación' 
                                  ? calculateProbableFarrowingDate(pig.lastEvent.date)
                                  : 'N/A'
                                }
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Historial de Eventos</CardTitle>
                        <CardDescription>Eventos registrados para esta hembra, del más reciente al más antiguo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative pl-6">
                            {/* Vertical line for the timeline */}
                            <div className="absolute left-[34px] top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
                            
                            <div className="space-y-8">
                                {pig.events.map((event, index) => (
                                    <div key={index} className="flex gap-4 items-start">
                                        <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-card border shrink-0">
                                            {eventIcons[event.type as EventType] || <Beaker className="h-5 w-5 text-muted-foreground" />}
                                        </div>
                                        <div className="flex-grow pt-2">
                                            <p className="font-semibold">{event.type}</p>
                                            <p className="text-sm text-muted-foreground">{format(parseISO(event.date), 'dd/MM/yyyy')}</p>
                                            {event.details && <p className="text-sm mt-1">{event.details}</p>}
                                            {event.inseminationGroup && <Badge variant="outline" className="mt-1">Grupo: {event.inseminationGroup}</Badge>}
                                        </div>
                                    </div>
                                ))}
                                {pig.events.length === 0 && (
                                    <p className="text-muted-foreground text-center py-4">No hay eventos registrados para este animal.</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}


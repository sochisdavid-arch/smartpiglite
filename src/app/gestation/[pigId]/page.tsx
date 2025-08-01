
"use client";

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Syringe, Baby, HeartPulse, XCircle, Beaker, PlusCircle, ChevronDown } from 'lucide-react';
import { format, parseISO, differenceInWeeks, isValid, addDays } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';


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

const allEventTypes: EventType[] = ["Celo", "Celo no Servido", "Inseminación", "Parto", "Aborto", "Tratamiento", "Vacunación", "Venta", "Descarte", "Muerte"];

export default function PigHistoryPage() {
    const router = useRouter();
    const params = useParams();
    const pigId = params.pigId as string;
    
    const [pig, setPig] = React.useState<Pig | null>(null);
    const [isEventFormOpen, setIsEventFormOpen] = React.useState(false);
    const [selectedEventType, setSelectedEventType] = React.useState<EventType | null>(null);

    React.useEffect(() => {
        const foundPig = initialPigs.find(p => p.id === pigId);
        if (foundPig) {
            setPig({...foundPig, age: calculateAge(foundPig.birthDate)});
        }
    }, [pigId]);

    const openEventDialog = (eventType: EventType) => {
        setSelectedEventType(eventType);
        setIsEventFormOpen(true);
    };

    const EventForm = () => {
        if (!selectedEventType) return null;
    
        // State for insemination date to calculate probable farrowing date
        const [inseminationDate, setInseminationDate] = React.useState<string>('');
        const probableFarrowingDate = React.useMemo(() => {
            if (inseminationDate) {
                const date = parseISO(inseminationDate);
                if (isValid(date)) {
                    return format(addDays(date, 114), 'dd/MM/yyyy');
                }
            }
            return '---';
        }, [inseminationDate]);
    
        // State for farrowing form fields to calculate average weight
        const [liveBorn, setLiveBorn] = React.useState<number | string>('');
        const [litterWeight, setLitterWeight] = React.useState<number | string>('');
        const averagePigletWeight = React.useMemo(() => {
            const numLiveBorn = Number(liveBorn);
            const numLitterWeight = Number(litterWeight);
            if (numLiveBorn > 0 && numLitterWeight > 0) {
                return (numLitterWeight / numLiveBorn).toFixed(2);
            }
            return '---';
        }, [liveBorn, litterWeight]);

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            // Handle form submission logic here in the future
            console.log(`Submitting ${selectedEventType} form for pig ${pigId}`);
            // Here you would typically update the pig's event list
            // For now, we just close the dialog
            setIsEventFormOpen(false);
        }
        
        return (
            <DialogContent className="sm:max-w-md flex flex-col max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Registrar Evento: {selectedEventType}</DialogTitle>
                    <DialogDescription>
                        Complete la información para el evento.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex-grow overflow-hidden flex flex-col">
                    <ScrollArea className="flex-grow pr-6 -mr-6">
                        <div className="grid gap-4 py-4 pr-6">
                            {/* Common fields */}
                            <div className="space-y-2">
                                <Label htmlFor="eventDate">Fecha del Evento</Label>
                                <Input 
                                    id="eventDate" 
                                    type="date" 
                                    required 
                                    onChange={e => selectedEventType === 'Inseminación' && setInseminationDate(e.target.value)}
                                />
                            </div>
    
                            {/* Specific fields */}
                            {selectedEventType === 'Celo' && (
                                <div className="space-y-2">
                                    <Label htmlFor="observations">Observaciones</Label>
                                    <Textarea id="observations" placeholder="Ej: Signos de celo muy evidentes."/>
                                </div>
                            )}
                            {selectedEventType === 'Celo no Servido' && (
                                <div className="space-y-2">
                                    <Label htmlFor="reason">Motivo</Label>
                                    <Input id="reason" placeholder="Ej: Condición corporal baja"/>
                                </div>
                            )}
                            {selectedEventType === 'Inseminación' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="maleId">Macho / Lote de Semen</Label>
                                        <Input id="maleId" placeholder="ID del macho o código del semen" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sowWeight">Peso de la Cerda (kg) - Opcional</Label>
                                        <Input id="sowWeight" type="number" step="0.1" placeholder="Ej. 180.5"/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="inseminationGroup">Grupo de Inseminación</Label>
                                        <Input id="inseminationGroup" placeholder="Ej. SEMANA-34" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="inseminator">Inseminador</Label>
                                        <Input id="inseminator" placeholder="Nombre del operario" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Fecha Probable de Parto</Label>
                                        <div className="text-lg font-semibold p-2 border rounded-md bg-muted">
                                            {probableFarrowingDate}
                                        </div>
                                    </div>
                                </>
                            )}
                            {selectedEventType === 'Parto' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="totalBorn">Total Nacidos</Label>
                                        <Input id="totalBorn" type="number" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="liveBorn">Vivos</Label>
                                        <Input id="liveBorn" type="number" required value={liveBorn} onChange={e => setLiveBorn(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stillborn">Muertos</Label>
                                        <Input id="stillborn" type="number" required />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="mummified">Momias</Label>
                                        <Input id="mummified" type="number" required />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="lowViability">Baja Viabilidad</Label>
                                        <Input id="lowViability" type="number" required />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="sowWeightParto">Peso Cerda (kg)</Label>
                                        <Input id="sowWeightParto" type="number" step="0.1" placeholder="Opcional"/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="litterWeight">Peso Camada (kg)</Label>
                                        <Input id="litterWeight" type="number" step="0.1" required value={litterWeight} onChange={e => setLitterWeight(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Peso Promedio (kg)</Label>
                                        <div className="text-lg font-semibold p-2 border rounded-md bg-muted h-10 flex items-center">
                                            {averagePigletWeight}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {selectedEventType === 'Aborto' && (
                                <div className="space-y-2">
                                    <Label htmlFor="abortionReason">Causa probable</Label>
                                    <Input id="abortionReason" placeholder="Ej: Estrés por calor"/>
                                </div>
                            )}
                            {selectedEventType === 'Tratamiento' && (
                                <>
                                <div className="space-y-2">
                                        <Label htmlFor="treatmentProduct">Producto</Label>
                                        <Input id="treatmentProduct" placeholder="Nombre del medicamento" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="treatmentReason">Motivo</Label>
                                        <Input id="treatmentReason" placeholder="Ej: Tratamiento para cojera" required/>
                                    </div>
                                </>
                            )}
                            {selectedEventType === 'Vacunación' && (
                                <div className="space-y-2">
                                    <Label htmlFor="vaccine">Vacuna</Label>
                                    <Input id="vaccine" placeholder="Nombre de la vacuna o enfermedad" required/>
                                </div>
                            )}
                            {['Venta', 'Descarte', 'Muerte'].includes(selectedEventType) && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="reason">Causa / Motivo</Label>
                                        <Input id="reason" placeholder={`Motivo de la ${selectedEventType.toLowerCase()}`} required />
                                    </div>
                                    {selectedEventType === 'Venta' && (
                                    <div className="space-y-2">
                                            <Label htmlFor="saleValue">Valor de la Venta ($)</Label>
                                            <Input id="saleValue" type="number" step="0.01" />
                                        </div>
                                    )}
                                </>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="eventNotes">Notas Adicionales</Label>
                                <Textarea id="eventNotes" placeholder="Cualquier nota adicional relevante para este evento."/>
                            </div>
                        </div>
                    </ScrollArea>
                    <DialogFooter className="flex-shrink-0 pt-4 border-t mt-auto">
                        <Button type="button" variant="ghost" onClick={() => setIsEventFormOpen(false)}>Cancelar</Button>
                        <Button type="submit">Guardar Evento</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        )
      }


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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">Hoja de Vida: {pig.id}</h1>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Agregar Evento
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {allEventTypes.map(eventType => (
                                <DropdownMenuItem key={eventType} onSelect={() => openEventDialog(eventType)}>
                                    {eventType}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                            <div><Badge variant={getStatusVariant(pig.status)}>{pig.status}</Badge></div>
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
            <Dialog open={isEventFormOpen} onOpenChange={setIsEventFormOpen}>
                <EventForm />
            </Dialog>
        </AppLayout>
    );
}

    

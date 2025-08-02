
"use client";

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Syringe, Baby, HeartPulse, XCircle, Beaker, PlusCircle, ChevronDown, Repeat, GitMerge, MoveUp, MoveDown, Package, Banknote } from 'lucide-react';
import { format, parseISO, differenceInWeeks, isValid, addDays, differenceInDays, getWeek } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FormDescription } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Types specific to Lactation
type LactationEventType = "Tratamiento" | "Vacunación" | "Muerte de Lechón" | "Adopción de Lechón" | "Donación de Lechón" | "Destete" | "Venta" | "Muerte";
type StatusType = 'Gestante' | 'Vacia' | 'Destetada' | 'Remplazo' | 'Lactante';

interface Event {
    type: LactationEventType | "Parto" | "Inseminación"; // Allow gestation events for history
    date: string;
    details?: string;
    // Lactation specific
    pigletCount?: number;
    toSow?: string;
    fromSow?: string;
    cause?: string;
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
    lastEvent: any; // Can be from any stage
    events: any[]; // Can be from any stage
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
        { type: 'Parto', date: '2024-07-05', details: '14 nacidos vivos' },
        { type: 'Inseminación', date: '2024-06-10', inseminationGroup: 'SEMANA-24', details: 'Inseminado por Operario A con semen de macho M-012.' },
    ] 
  },
];

const mockInventory = [
    { id: 'MED-01', name: 'Oxitetraciclina 200 LA', category: 'medicamento', stock: 5 },
    { id: 'VAC-01', name: 'Vacuna Circovirus', category: 'vacuna', stock: 50 },
];

const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const date = parseISO(birthDate);
    if (!isValid(date)) return 0;
    return differenceInWeeks(new Date(), date);
}

const getStatusVariant = (status: StatusType) => {
    return 'default'; // Always 'Lactante' on this page
};

const eventIcons: { [key in LactationEventType]: React.ReactElement } = {
    "Tratamiento": <Syringe className="h-5 w-5 text-red-500" />,
    "Vacunación": <Syringe className="h-5 w-5 text-green-500" />,
    "Muerte de Lechón": <XCircle className="h-5 w-5 text-destructive" />,
    "Adopción de Lechón": <MoveDown className="h-5 w-5 text-blue-500" />,
    "Donación de Lechón": <MoveUp className="h-5 w-5 text-purple-500" />,
    "Destete": <Repeat className="h-5 w-5 text-orange-500" />,
    "Venta": <XCircle className="h-5 w-5" />,
    "Muerte": <XCircle className="h-5 w-5" />,
};

const allLactationEventTypes: LactationEventType[] = ["Tratamiento", "Vacunación", "Muerte de Lechón", "Adopción de Lechón", "Donación de Lechón", "Destete", "Venta", "Muerte"];

export default function LactationHistoryPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const pigId = params.pigId as string;
    
    const [pig, setPig] = React.useState<Pig | null>(null);
    const [isEventFormOpen, setIsEventFormOpen] = React.useState(false);
    const [selectedEventType, setSelectedEventType] = React.useState<LactationEventType | null>(null);

    React.useEffect(() => {
        const pigsFromStorage = localStorage.getItem('pigs');
        const pigs = pigsFromStorage ? JSON.parse(pigsFromStorage) : initialPigs;
        const foundPig = pigs.find((p: Pig) => p.id === pigId);
        if (foundPig) {
            setPig({...foundPig, age: calculateAge(foundPig.birthDate)});
        }
    }, [pigId]);

    const openEventDialog = (eventType: LactationEventType) => {
        setSelectedEventType(eventType);
        setIsEventFormOpen(true);
    };

    const EventForm = () => {
        if (!selectedEventType) return null;

        // States for Destete form
        const [weanedCount, setWeanedCount] = React.useState<number | string>('');
        const [litterWeight, setLitterWeight] = React.useState<number | string>('');
        const [avgWeight, setAvgWeight] = React.useState<number | string>('---');
        const [weaningDestination, setWeaningDestination] = React.useState<'precebo' | 'venta'>('precebo');

        const calculateCurrentPiglets = () => {
            if (!pig) return 0;
            const partoEvent = pig.events.find(e => e.type === 'Parto');
            if (!partoEvent) return 0;
            
            const liveBorn = partoEvent.liveBorn || (parseInt(partoEvent.details?.match(/\d+/)?.[0] || '0'));
            
            const deaths = pig.events.filter(e => e.type === 'Muerte de Lechón').reduce((sum, e) => sum + (e.pigletCount || 0), 0);
            const adoptions = pig.events.filter(e => e.type === 'Adopción de Lechón').reduce((sum, e) => sum + (e.pigletCount || 0), 0);
            const donations = pig.events.filter(e => e.type === 'Donación de Lechón').reduce((sum, e) => sum + (e.pigletCount || 0), 0);
            
            return liveBorn - deaths + adoptions - donations;
        }

        React.useEffect(() => {
            const numWeaned = Number(weanedCount);
            const numLitterWeight = Number(litterWeight);
            if (numWeaned > 0 && numLitterWeight > 0) {
                setAvgWeight((numLitterWeight / numWeaned).toFixed(2));
            } else {
                setAvgWeight('---');
            }
        }, [weanedCount, litterWeight]);

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const eventDate = formData.get('eventDate') as string;
            
            const newEvent: Event = {
                type: selectedEventType,
                date: eventDate,
                details: formData.get('details') as string || `${selectedEventType} registrado.`,
            };

            // Specific event logic
            if (selectedEventType === 'Muerte de Lechón') {
                newEvent.pigletCount = Number(formData.get('pigletCount'));
                newEvent.cause = formData.get('cause') as string;
                newEvent.details = `${newEvent.pigletCount} muertes. Causa: ${newEvent.cause}`;
            }
            if (['Adopción de Lechón', 'Donación de Lechón'].includes(selectedEventType)) {
                newEvent.pigletCount = Number(formData.get('pigletCount'));
            }
            if (selectedEventType === 'Adopción de Lechón') newEvent.fromSow = formData.get('fromSow') as string;
            if (selectedEventType === 'Donación de Lechón') newEvent.toSow = formData.get('toSow') as string;
            
            let updatedPig = { ...pig! };
            updatedPig.events.unshift(newEvent); 
            updatedPig.lastEvent = newEvent;

            // Main logic for Destete
            if (selectedEventType === 'Destete') {
                updatedPig.status = 'Destetada';
                
                if (weaningDestination === 'precebo') {
                    const weaningDate = parseISO(eventDate);
                    const weekNumber = getWeek(weaningDate);
                    const year = weaningDate.getFullYear();
                    const batchId = `PRECEBO-${year}-${weekNumber}`;
                    
                    const nurseryBatches = JSON.parse(localStorage.getItem('nurseryBatches') || '{}');
                    const existingBatch = nurseryBatches[batchId];

                    const newPigletsCount = Number(formData.get('weanedCount'));
                    const newTotalWeight = Number(formData.get('litterWeight'));

                    if (existingBatch) {
                        existingBatch.pigletCount += newPigletsCount;
                        existingBatch.totalWeight += newTotalWeight;
                        existingBatch.sows.push(pig!.id);
                        existingBatch.avgWeight = (existingBatch.totalWeight / existingBatch.pigletCount).toFixed(2);
                    } else {
                        nurseryBatches[batchId] = {
                            id: batchId,
                            creationDate: eventDate,
                            pigletCount: newPigletsCount,
                            totalWeight: newTotalWeight,
                            avgWeight: (newTotalWeight / newPigletsCount).toFixed(2),
                            avgAge: differenceInDays(weaningDate, parseISO(pig!.events.find(e => e.type === 'Parto')!.date)),
                            sows: [pig!.id],
                            status: 'Activo'
                        };
                    }
                    localStorage.setItem('nurseryBatches', JSON.stringify(nurseryBatches));
                     toast({
                        title: "¡Lechones enviados a Precebo!",
                        description: `${newPigletsCount} lechones han sido añadidos al lote ${batchId}.`,
                    });
                }
            }
            
            const pigsFromStorage = localStorage.getItem('pigs');
            let pigs = pigsFromStorage ? JSON.parse(pigsFromStorage) : initialPigs;
            pigs = pigs.map((p: Pig) => p.id === updatedPig.id ? updatedPig : p);
            localStorage.setItem('pigs', JSON.stringify(pigs));

            setPig(updatedPig);
            
            toast({
                title: "¡Evento Registrado!",
                description: `El evento "${selectedEventType}" ha sido añadido al historial de lactancia.`,
            });
            
            setIsEventFormOpen(false);

            if (selectedEventType === 'Destete') {
                toast({
                    title: "¡Estado Actualizado!",
                    description: `La cerda ${pig!.id} ha sido movida a Destetada.`,
                });
                router.push('/gestation');
            }
        }
        
        return (
            <DialogContent className="max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Registrar Evento de Lactancia: {selectedEventType}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto -mx-6 px-6">
                 <ScrollArea className="h-full pr-6">
                    <form onSubmit={handleSubmit} id="lactation-event-form" className="space-y-4 pt-2 pb-6">
                        <div className="space-y-2">
                            <Label htmlFor="eventDate">Fecha del Evento</Label>
                            <Input id="eventDate" name="eventDate" type="date" required />
                        </div>
                        
                        {['Tratamiento', 'Vacunación'].includes(selectedEventType) && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="product">Producto</Label>
                                    <Select name="product" required>
                                        <SelectTrigger><SelectValue placeholder={`Seleccionar ${selectedEventType === 'Tratamiento' ? 'medicamento' : 'vacuna'}`} /></SelectTrigger>
                                        <SelectContent>
                                            {mockInventory.filter(p => p.category === (selectedEventType === 'Tratamiento' ? 'medicamento' : 'vacuna')).map(item => (
                                                <SelectItem key={item.id} value={item.id}>{item.name} (Stock: {item.stock})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dose">Dosis (ml)</Label>
                                    <Input id="dose" name="dose" type="number" step="0.1" placeholder="Ej. 2.0" required />
                                </div>
                            </>
                        )}
                        
                        {selectedEventType === 'Muerte de Lechón' && (
                           <>
                               <div className="space-y-2">
                                   <Label htmlFor="pigletCount">Cantidad</Label>
                                   <Input id="pigletCount" name="pigletCount" type="number" placeholder="Nº de lechones" required />
                               </div>
                               <div className="space-y-2">
                                   <Label htmlFor="cause">Causa</Label>
                                   <Input id="cause" name="cause" placeholder="Causa de la muerte" required />
                               </div>
                           </>
                        )}

                        {['Adopción de Lechón', 'Donación de Lechón'].includes(selectedEventType) && (
                            <div className="space-y-2">
                                <Label htmlFor="pigletCount">Cantidad de Lechones</Label>
                                <Input id="pigletCount" name="pigletCount" type="number" placeholder="Ej: 2" required />
                            </div>
                        )}
                        {selectedEventType === 'Adopción de Lechón' && (
                             <div className="space-y-2">
                                <Label htmlFor="fromSow">Cerda Donante</Label>
                                <Input id="fromSow" name="fromSow" placeholder="ID de la cerda que dona" required />
                            </div>
                        )}
                        {selectedEventType === 'Donación de Lechón' && (
                             <div className="space-y-2">
                                <Label htmlFor="toSow">Cerda Receptora</Label>
                                <Input id="toSow" name="toSow" placeholder="ID de la cerda que adopta" required />
                            </div>
                        )}
                         {selectedEventType === 'Destete' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="weanedCount">Lechones Destetados</Label>
                                        <Input id="weanedCount" name="weanedCount" type="number" required value={weanedCount} onChange={e => setWeanedCount(e.target.value)} />
                                        <FormDescription>Calculados: {calculateCurrentPiglets()}</FormDescription>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="litterWeight">Peso Total Camada (kg)</Label>
                                        <Input id="litterWeight" name="litterWeight" type="number" step="0.1" required value={litterWeight} onChange={e => setLitterWeight(e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Peso Promedio (kg)</Label>
                                        <Input id="avgWeight" name="avgWeight" value={avgWeight} onChange={e => setAvgWeight(e.target.value)} className="font-semibold bg-muted" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sowWeight">Peso Cerda (kg) - Opcional</Label>
                                        <Input id="sowWeight" name="sowWeight" type="number" step="0.1" placeholder="Ej: 195.5" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Destino</Label>
                                    <RadioGroup
                                        value={weaningDestination}
                                        onValueChange={(value) => setWeaningDestination(value as 'precebo' | 'venta')}
                                        className="flex gap-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="precebo" id="precebo" />
                                            <Label htmlFor="precebo" className="flex items-center gap-2 cursor-pointer"><Package/>Enviar a Precebo</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="venta" id="venta" />
                                            <Label htmlFor="venta" className="flex items-center gap-2 cursor-pointer"><Banknote/>Venta Directa</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                {weaningDestination === 'venta' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="salePrice">Precio de Venta Total ($)</Label>
                                        <Input id="salePrice" name="salePrice" type="number" step="0.01" placeholder="Ingrese el valor total" required />
                                    </div>
                                )}
                            </div>
                        )}
                        {['Venta', 'Muerte'].includes(selectedEventType) && (
                            <div className="space-y-2">
                                <Label htmlFor="reason">Causa / Motivo</Label>
                                <Input id="reason" name="reason" placeholder={`Causa de la ${selectedEventType.toLowerCase()}`} required />
                            </div>
                        )}
                        
                         {selectedEventType !== 'Muerte de Lechón' && selectedEventType !== 'Destete' && (
                            <div className="space-y-2">
                                <Label htmlFor="details">Notas Adicionales</Label>
                                <Textarea id="details" name="details" placeholder="Cualquier nota adicional relevante para este evento."/>
                            </div>
                        )}
                    </form>
                    </ScrollArea>
                </div>
                <DialogFooter className="flex-shrink-0 pt-4 border-t -mx-6 px-6 bg-background">
                    <Button type="button" variant="ghost" onClick={() => setIsEventFormOpen(false)}>Cancelar</Button>
                    <Button type="submit" form="lactation-event-form">Guardar Evento</Button>
                </DialogFooter>
            </DialogContent>
        )
      }

    if (!pig) {
        return <AppLayout><div className="flex justify-center items-center h-full"><p>Cargando datos del animal...</p></div></AppLayout>;
    }
    
    const farrowingEvent = pig.events.find(e => e.type === 'Parto');
    const daysInLactation = farrowingEvent ? differenceInDays(new Date(), parseISO(farrowingEvent.date)) : 0;
    const parity = pig.events.filter(e => e.type === 'Parto').length;

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => router.push('/lactation')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">Hoja de Vida Lactancia: {pig.id}</h1>
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
                            {allLactationEventTypes.map(eventType => (
                                <DropdownMenuItem key={eventType} onSelect={() => openEventDialog(eventType)}>
                                    {eventType}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Información de Lactancia</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-1">
                            <Label>ID Cerda</Label>
                            <p className="font-semibold">{pig.id}</p>
                        </div>
                        <div className="space-y-1">
                            <Label>Nº Parto (Paridad)</Label>
                            <p className="font-semibold">{parity}</p>
                        </div>
                        <div className="space-y-1">
                            <Label>Días en Lactancia</Label>
                            <p className="font-semibold">{daysInLactation}</p>
                        </div>
                        <div className="space-y-1">
                            <Label>Fecha de Parto</Label>
                            <p className="font-semibold">{farrowingEvent ? format(parseISO(farrowingEvent.date), 'dd/MM/yyyy') : 'N/A'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Historial de Eventos de Lactancia</CardTitle>
                        <CardDescription>Eventos registrados para esta cerda durante su fase de lactancia actual.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative pl-6">
                            <div className="absolute left-[34px] top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
                            
                            <div className="space-y-8">
                                {pig.events.filter(e => allLactationEventTypes.includes(e.type)).map((event, index) => (
                                    <div key={index} className="flex gap-4 items-start">
                                        <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-card border shrink-0">
                                            {eventIcons[event.type as LactationEventType] || <Beaker className="h-5 w-5 text-muted-foreground" />}
                                        </div>
                                        <div className="flex-grow pt-2">
                                            <p className="font-semibold">{event.type}</p>
                                            <p className="text-sm text-muted-foreground">{format(parseISO(event.date), 'dd/MM/yyyy')}</p>
                                            {event.details && <p className="text-sm mt-1">{event.details}</p>}
                                        </div>
                                    </div>
                                ))}
                                {pig.events.filter(e => allLactationEventTypes.includes(e.type)).length === 0 && (
                                    <p className="text-muted-foreground text-center py-4">No hay eventos de lactancia registrados.</p>
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

    
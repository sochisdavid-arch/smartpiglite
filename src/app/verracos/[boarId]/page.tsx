
"use client";

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, PlusCircle, Droplet, MoreHorizontal, Syringe, XCircle } from 'lucide-react';
import { format, parseISO, isValid, differenceInWeeks } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type BoarEventType = 'Ingreso' | 'Eyaculado' | 'Tratamiento' | 'Vacunación' | 'Venta' | 'Muerte';

interface BoarEvent {
    id: string;
    type: BoarEventType;
    date: string;
    details?: string;
    // Eyaculación specific
    dilutedVolume?: number;
    concentration?: number;
    motility?: number;
}

interface Boar {
    id: string;
    breed: string;
    birthDate: string;
    arrivalDate: string;
    status: 'Activo' | 'Inactivo' | 'Vendido';
    events: BoarEvent[];
}

const BOAR_STORAGE_KEY = 'boarCollection';

const eventIcons: { [key in BoarEventType]: React.ReactElement } = {
    "Ingreso": <PlusCircle className="h-5 w-5 text-green-500" />,
    "Eyaculado": <Droplet className="h-5 w-5 text-blue-500" />,
    "Tratamiento": <Syringe className="h-5 w-5 text-red-500" />,
    "Vacunación": <Syringe className="h-5 w-5 text-green-500" />,
    "Venta": <XCircle className="h-5 w-5" />,
    "Muerte": <XCircle className="h-5 w-5 text-destructive" />,
};

const allEventTypes: BoarEventType[] = ["Eyaculado", "Tratamiento", "Vacunación", "Venta", "Muerte"];

export default function BoarHistoryPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const boarId = params.boarId as string;
    
    const [boar, setBoar] = React.useState<Boar | null>(null);
    const [isEventFormOpen, setIsEventFormOpen] = React.useState(false);
    const [selectedEventType, setSelectedEventType] = React.useState<BoarEventType | null>(null);

    const loadData = React.useCallback(() => {
        const storedBoars = localStorage.getItem(BOAR_STORAGE_KEY);
        const boars: Boar[] = storedBoars ? JSON.parse(storedBoars) : [];
        const foundBoar = boars.find((b: Boar) => b.id === boarId);
        if (foundBoar) {
            setBoar(foundBoar);
        }
    }, [boarId]);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    const openEventDialog = (eventType: BoarEventType) => {
        setSelectedEventType(eventType);
        setIsEventFormOpen(true);
    };

    const handleEventSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!boar || !selectedEventType) return;

        const formData = new FormData(e.target as HTMLFormElement);
        const newEvent: BoarEvent = {
            id: `evt-${Date.now()}`,
            type: selectedEventType,
            date: formData.get('eventDate') as string,
            details: formData.get('details') as string || undefined,
            dilutedVolume: Number(formData.get('dilutedVolume')) || undefined,
            concentration: Number(formData.get('concentration')) || undefined,
            motility: Number(formData.get('motility')) || undefined,
        };

        const updatedBoar = { ...boar, events: [newEvent, ...boar.events] };
        setBoar(updatedBoar);

        const allBoars: Boar[] = JSON.parse(localStorage.getItem(BOAR_STORAGE_KEY) || '[]');
        const updatedBoars = allBoars.map(b => b.id === boar.id ? updatedBoar : b);
        localStorage.setItem(BOAR_STORAGE_KEY, JSON.stringify(updatedBoars));

        toast({ title: "Evento Registrado", description: `Se ha añadido el evento "${selectedEventType}" al historial.` });
        setIsEventFormOpen(false);
    };
    
    if (!boar) {
        return <AppLayout><div className="flex justify-center items-center h-full"><p>Cargando datos del verraco...</p></div></AppLayout>;
    }

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => router.push('/verracos')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">Hoja de Vida: {boar.id}</h1>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button><PlusCircle className="mr-2 h-4 w-4" /> Agregar Evento</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {allEventTypes.map(type => (
                                <DropdownMenuItem key={type} onSelect={() => openEventDialog(type)}>
                                    {type}
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
                            <p className="font-semibold">{boar.breed}</p>
                        </div>
                        <div className="space-y-1">
                            <Label>Edad</Label>
                            <p className="font-semibold">{differenceInWeeks(new Date(), parseISO(boar.birthDate))} semanas</p>
                        </div>
                        <div className="space-y-1">
                            <Label>Estado</Label>
                            <p className="font-semibold">{boar.status}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Historial de Eventos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Detalles</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {boar.events.map(event => (
                                    <TableRow key={event.id}>
                                        <TableCell>{format(parseISO(event.date), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {eventIcons[event.type]}
                                                <span>{event.type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {event.type === 'Eyaculado'
                                             ? `Vol: ${event.dilutedVolume}ml, Conc: ${event.concentration}M, Mot: ${event.motility}%`
                                             : event.details || 'N/A'
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isEventFormOpen} onOpenChange={setIsEventFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Evento: {selectedEventType}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEventSubmit} id="event-form" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="eventDate">Fecha</Label>
                            <Input id="eventDate" name="eventDate" type="date" required />
                        </div>
                        {selectedEventType === 'Eyaculado' && (
                            <>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="dilutedVolume">Vol. Diluido (ml)</Label>
                                        <Input id="dilutedVolume" name="dilutedVolume" type="number" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="concentration">Conc. (Millones/ml)</Label>
                                        <Input id="concentration" name="concentration" type="number" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="motility">Motilidad (%)</Label>
                                        <Input id="motility" name="motility" type="number" />
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="details">Notas Adicionales</Label>
                            <Textarea id="details" name="details" />
                        </div>
                    </form>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setIsEventFormOpen(false)}>Cancelar</Button>
                        <Button type="submit" form="event-form">Guardar Evento</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

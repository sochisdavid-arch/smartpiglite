
"use client";

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Baby } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, parseISO, isValid } from 'date-fns';

type StatusType = 'Gestante' | 'Vacia' | 'Destetada' | 'Remplazo' | 'Lactante';
type EventType = "Celo" | "Celo no Servido" | "Inseminación" | "Parto" | "Aborto" | "Tratamiento" | "Vacunación" | "Venta" | "Descarte" | "Muerte";

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

export default function LactationPage() {
    const router = useRouter();
    const [lactatingSows, setLactatingSows] = React.useState<Pig[]>([]);

    React.useEffect(() => {
        const pigsFromStorage = localStorage.getItem('pigs');
        if (pigsFromStorage) {
            const allPigs: Pig[] = JSON.parse(pigsFromStorage);
            const lactating = allPigs.filter(p => p.status === 'Lactante');
            setLactatingSows(lactating);
        }
    }, []);

    const getParity = (pig: Pig) => {
        return pig.events.filter(e => e.type === 'Parto').length;
    };
    
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Cerdas en Lactancia</h1>
                    <p className="text-muted-foreground">Animales que han parido y están actualmente en lactancia.</p>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Listado de Cerdas</CardTitle>
                        <CardDescription>
                            Aquí se muestran todas las cerdas que se encuentran en la fase de lactancia. Para mover una cerda aquí, registre un evento de "Parto" en su hoja de vida.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID de la Cerda</TableHead>
                                        <TableHead>Raza</TableHead>
                                        <TableHead>Fecha de Parto</TableHead>
                                        <TableHead className="text-center">Nº de Parto</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lactatingSows.length > 0 ? lactatingSows.map((pig) => (
                                        <TableRow key={pig.id}>
                                            <TableCell className="font-medium">{pig.id}</TableCell>
                                            <TableCell>{pig.breed}</TableCell>
                                            <TableCell>
                                                {pig.lastEvent.type === 'Parto' && isValid(parseISO(pig.lastEvent.date))
                                                    ? format(parseISO(pig.lastEvent.date), 'dd/MM/yyyy')
                                                    : 'N/A'
                                                }
                                            </TableCell>
                                            <TableCell className="text-center">{getParity(pig)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => router.push(`/gestation/${pig.id}`)}>
                                                    Ver Hoja de Vida
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                No hay cerdas en lactancia en este momento.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        
                        {/* Mobile Card View */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {lactatingSows.length > 0 ? lactatingSows.map((pig) => (
                                <Link href={`/gestation/${pig.id}`} key={pig.id} className="block">
                                    <Card className="hover:bg-accent/50">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle>{pig.id}</CardTitle>
                                                    <CardDescription>{pig.breed}</CardDescription>
                                                </div>
                                                <Badge variant="default">Lactante</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="grid gap-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Fecha de Parto</span>
                                                <span>
                                                    {pig.lastEvent.type === 'Parto' && isValid(parseISO(pig.lastEvent.date))
                                                        ? format(parseISO(pig.lastEvent.date), 'dd/MM/yyyy')
                                                        : 'N/A'
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Nº de Parto</span>
                                                <span>{getParity(pig)}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )) : (
                                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                                    <Baby className="w-12 h-12 mb-4" />
                                    <p className="font-semibold">No hay cerdas en lactancia.</p>
                                    <p className="text-sm">Cuando registre un parto, la cerda aparecerá aquí.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

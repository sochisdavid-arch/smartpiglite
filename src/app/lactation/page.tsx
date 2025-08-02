
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Baby } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { format, parseISO, isValid, differenceInWeeks } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


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

const pigBreeds = [
  // Razas Puras
  "Duroc", "Yorkshire", "Landrace", "Hampshire", "Pietrain", "Berkshire", "Chester White", "Spotted", "Poland China", "Tamworth", "Large Black", "Cerdo Ibérico",
  // Líneas Genéticas Comerciales
  "PIC", "Topigs Norsvin", "Hypor (Hendrix Genetics)", "DanBred", "Genus", "Choice Genetics", "Genesus",
  // Otras
  "Otro"
];

const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const date = parseISO(birthDate);
    if (!isValid(date)) return 0;
    return differenceInWeeks(new Date(), date);
}

export default function LactationPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [allPigs, setAllPigs] = React.useState<Pig[]>([]);
    const [lactatingSows, setLactatingSows] = React.useState<Pig[]>([]);

    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingPig, setEditingPig] = React.useState<Pig | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [pigToDelete, setPigToDelete] = React.useState<Pig | null>(null);
    
    const loadPigs = () => {
        const pigsFromStorage = localStorage.getItem('pigs');
        if (pigsFromStorage) {
            const allPigsData: Pig[] = JSON.parse(pigsFromStorage);
            const processedPigs = allPigsData.map(p => ({...p, age: calculateAge(p.birthDate)}));
            setAllPigs(processedPigs);
            const lactating = processedPigs.filter(p => p.status === 'Lactante');
            setLactatingSows(lactating);
        }
    };

    React.useEffect(() => {
        loadPigs();
    }, []);

    const getParity = (pig: Pig) => {
        return pig.events.filter(e => e.type === 'Parto').length;
    };

    const openEditDialog = (pig: Pig) => {
        setEditingPig(pig);
        setIsFormOpen(true);
    };

    const openDeleteDialog = (pig: Pig) => {
        setPigToDelete(pig);
        setIsDeleteDialogOpen(true);
    };

    const closeFormDialog = () => {
        setIsFormOpen(false);
        setEditingPig(null);
    };

    const handleAnimalFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const birthDateValue = formData.get('birthDate') as string;
        
        let submittedAnimal: Pig;

        if (editingPig) {
            submittedAnimal = {
              ...editingPig,
              id: formData.get('id') as string,
              breed: formData.get('breed') as string,
              birthDate: birthDateValue,
              arrivalDate: formData.get('arrivalDate') as string,
              weight: parseInt(formData.get('weight') as string),
              gender: formData.get('gender') as string,
              purchaseValue: formData.get('purchaseValue') ? parseInt(formData.get('purchaseValue') as string) : undefined,
              age: calculateAge(birthDateValue),
            };
            
            const updatedPigs = allPigs.map(p => p.id === editingPig.id ? submittedAnimal : p);
            localStorage.setItem('pigs', JSON.stringify(updatedPigs));
            loadPigs();
        }
        
        toast({
            title: "Animal Actualizado",
            description: `El animal con ID ${submittedAnimal!.id} ha sido actualizado correctamente.`
        });

        closeFormDialog();
        (event.target as HTMLFormElement).reset();
    };

    const handleDeleteConfirm = () => {
        if (pigToDelete) {
            const newPigs = allPigs.filter(p => p.id !== pigToDelete.id);
            localStorage.setItem('pigs', JSON.stringify(newPigs));
            loadPigs();
            toast({
                title: "Animal Eliminado",
                description: `El animal con ID ${pigToDelete.id} ha sido eliminado.`,
                variant: "destructive"
            });
        }
        setIsDeleteDialogOpen(false);
        setPigToDelete(null);
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
                                        <TableRow key={pig.id} onClick={() => router.push(`/lactation/${pig.id}`)} className="cursor-pointer">
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
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Abrir menú</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                      <DropdownMenuItem onSelect={() => openEditDialog(pig)}>Editar</DropdownMenuItem>
                                                      <DropdownMenuSeparator />
                                                      <DropdownMenuItem onSelect={() => openDeleteDialog(pig)} className="text-red-500 focus:text-red-500">Eliminar</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
                                <Card key={pig.id} onClick={() => router.push(`/lactation/${pig.id}`)} className="hover:bg-accent/50 cursor-pointer">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle>{pig.id}</CardTitle>
                                                <CardDescription>{pig.breed}</CardDescription>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                    <DropdownMenuItem onSelect={() => openEditDialog(pig)}>Editar</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onSelect={() => openDeleteDialog(pig)} className="text-red-500 focus:text-red-500">Eliminar</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="grid gap-2 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Estado</span>
                                            <Badge variant="default">Lactante</Badge>
                                        </div>
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

                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Editar Animal</DialogTitle>
                            <DialogDescription>
                                Actualiza la información del animal.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAnimalFormSubmit} className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                <Label htmlFor="id" className="sm:text-right">ID</Label>
                                <Input id="id" name="id" className="col-span-3" required defaultValue={editingPig?.id} disabled />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                <Label htmlFor="breed" className="sm:text-right">Raza</Label>
                                <Select name="breed" required defaultValue={editingPig?.breed}>
                                    <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Seleccionar raza/línea" />
                                    </SelectTrigger>
                                    <SelectContent>
                                    {pigBreeds.map(breed => <SelectItem key={breed} value={breed}>{breed}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                <Label htmlFor="gender" className="sm:text-right">Género</Label>
                                <RadioGroup name="gender" required defaultValue={editingPig?.gender || "Hembra"} className="col-span-3 flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Hembra" id="female" />
                                        <Label htmlFor="female">Hembra</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Macho" id="male" />
                                        <Label htmlFor="male">Macho</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                <Label htmlFor="birthDate" className="sm:text-right">F. Nacimiento</Label>
                                <Input id="birthDate" name="birthDate" type="date" className="col-span-3" required defaultValue={editingPig?.birthDate} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                <Label htmlFor="arrivalDate" className="sm:text-right">F. Llegada</Label>
                                <Input id="arrivalDate" name="arrivalDate" type="date" className="col-span-3" required defaultValue={editingPig?.arrivalDate} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                <Label htmlFor="weight" className="sm:text-right">Peso (kg)</Label>
                                <Input id="weight" name="weight" type="number" className="col-span-3" required defaultValue={editingPig?.weight} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                <Label htmlFor="purchaseValue" className="sm:text-right">Valor Compra ($)</Label>
                                <Input id="purchaseValue" name="purchaseValue" type="number" placeholder="Opcional" className="col-span-3" defaultValue={editingPig?.purchaseValue} />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={closeFormDialog}>Cancelar</Button>
                                <Button type="submit">Guardar Cambios</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente los datos del animal de nuestros servidores.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteConfirm}>Continuar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}

    

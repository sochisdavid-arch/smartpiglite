
"use client";

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Filter, Search, PlusCircle, MoreHorizontal, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { differenceInWeeks, parseISO, format, isValid, addDays } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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
  { id: 'PIG-001', breed: 'Duroc', birthDate: '2024-04-15', arrivalDate: '2024-05-01', weight: 85, gender: 'Hembra', purchaseValue: 150, age: 0, status: 'Gestante', lastEvent: { type: 'Inseminación', date: '2024-06-10', inseminationGroup: 'SEMANA-24' }, events: [{ type: 'Inseminación', date: '2024-06-10', inseminationGroup: 'SEMANA-24', details: 'Inseminado por Operario A.' }] },
  { id: 'PIG-002', breed: 'Yorkshire', birthDate: '2024-05-13', arrivalDate: '2024-06-01', weight: 60, gender: 'Hembra', purchaseValue: 160, age: 0, status: 'Vacia', lastEvent: { type: 'Celo no Servido', date: '2024-07-01' }, events: [{ type: 'Celo no Servido', date: '2024-07-01', details: 'Baja condición corporal.' }] },
  { id: 'PIG-003', breed: 'Landrace', birthDate: '2024-02-26', arrivalDate: '2024-03-15', weight: 110, gender: 'Hembra', purchaseValue: 155, age: 0, status: 'Destetada', lastEvent: { type: 'Parto', date: '2024-05-20' }, events: [{ type: 'Parto', date: '2024-05-20', details: '12 nacidos vivos.' }] },
  { id: 'PIG-004', breed: 'Duroc', birthDate: '2024-06-10', arrivalDate: '2024-06-25', weight: 25, gender: 'Macho', purchaseValue: 120, age: 0, status: 'Remplazo', lastEvent: { type: 'Ninguno', date: '' }, events: [] },
  { id: 'PIG-005', breed: 'Yorkshire', birthDate: '2024-03-25', arrivalDate: '2024-04-10', weight: 95, gender: 'Hembra', purchaseValue: 165, age: 0, status: 'Remplazo', lastEvent: { type: 'Ninguno', date: '' }, events: [] },
  { id: 'PIG-006', breed: 'Landrace', birthDate: '2024-02-12', arrivalDate: '2024-03-01', weight: 115, gender: 'Macho', purchaseValue: 145, age: 0, status: 'Remplazo', lastEvent: { type: 'Ninguno', date: '' }, events: [] },
];

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

const calculateProbableFarrowingDate = (inseminationDate: string) => {
    if (inseminationDate) {
        const date = parseISO(inseminationDate);
        if (isValid(date)) {
            return format(addDays(date, 114), 'dd/MM/yyyy');
        }
    }
    return 'N/A';
};

export default function GestationPage() {
  const [pigs, setPigs] = React.useState<Pig[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingPig, setEditingPig] = React.useState<Pig | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [pigToDelete, setPigToDelete] = React.useState<Pig | null>(null);
  
  // States for filters
  const [filterId, setFilterId] = React.useState('');
  const [filterBreed, setFilterBreed] = React.useState('all');
  const [filteredPigs, setFilteredPigs] = React.useState<Pig[]>([]);

  React.useEffect(() => {
    // In a real app, this would be an API call. Here we use localStorage.
    const pigsFromStorage = localStorage.getItem('pigs');
    const allPigs = pigsFromStorage ? JSON.parse(pigsFromStorage) : initialPigs;
    const processedPigs = allPigs.map((p: Pig) => ({
      ...p,
      age: calculateAge(p.birthDate)
    }));
    setPigs(processedPigs);
    // Persist initial data if it's not there
    if (!pigsFromStorage) {
        localStorage.setItem('pigs', JSON.stringify(initialPigs));
    }
  }, []);


  React.useEffect(() => {
    let tempPigs = pigs.filter(p => p.status !== 'Lactante');
    if (filterId) {
      tempPigs = tempPigs.filter(p => p.id.toLowerCase().includes(filterId.toLowerCase()));
    }
    if (filterBreed && filterBreed !== 'all') {
      tempPigs = tempPigs.filter(p => p.breed === filterBreed);
    }
    setFilteredPigs(tempPigs);
  }, [filterId, filterBreed, pigs]);


  const openAddDialog = () => {
    setEditingPig(null);
    setIsFormOpen(true);
  };

  const openEditDialog = (pig: Pig) => {
    setEditingPig(pig);
    setIsFormOpen(true);
  };
  
  const closeFormDialog = () => {
    setIsFormOpen(false);
    setEditingPig(null);
  };
  
  const openDeleteDialog = (pig: Pig) => {
      setPigToDelete(pig);
      setIsDeleteDialogOpen(true);
  };

  const clearFilters = () => {
    setFilterId('');
    setFilterBreed('all');
  }

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
        setPigs(pigs.map(p => p.id === editingPig.id ? submittedAnimal : p));
    } else {
        submittedAnimal = {
          id: formData.get('id') as string,
          breed: formData.get('breed') as string,
          birthDate: birthDateValue,
          arrivalDate: formData.get('arrivalDate') as string,
          weight: parseInt(formData.get('weight') as string),
          gender: formData.get('gender') as string,
          purchaseValue: formData.get('purchaseValue') ? parseInt(formData.get('purchaseValue') as string) : undefined,
          age: calculateAge(birthDateValue),
          status: 'Remplazo', 
          lastEvent: { type: 'Ninguno', date: '' },
          events: [],
        };
        setPigs(prevPigs => [...prevPigs, submittedAnimal]);
    }
    
    // Update localStorage
    const pigsFromStorage = localStorage.getItem('pigs');
    let allPigs = pigsFromStorage ? JSON.parse(pigsFromStorage) : [];
    if (editingPig) {
        allPigs = allPigs.map((p: Pig) => p.id === editingPig.id ? submittedAnimal : p);
    } else {
        allPigs.push(submittedAnimal);
    }
    localStorage.setItem('pigs', JSON.stringify(allPigs));
    
    toast({
        title: editingPig ? "Animal Actualizado" : "Animal Añadido",
        description: `El animal con ID ${submittedAnimal.id} ha sido ${editingPig ? 'actualizado' : 'guardado'} correctamente.`
    });

    closeFormDialog();
    (event.target as HTMLFormElement).reset();
  };
  
  const handleDeleteConfirm = () => {
    if (pigToDelete) {
        const newPigs = pigs.filter(p => p.id !== pigToDelete.id)
        setPigs(newPigs);
        localStorage.setItem('pigs', JSON.stringify(newPigs));
         toast({
            title: "Animal Eliminado",
            description: `El animal con ID ${pigToDelete.id} ha sido eliminado.`,
            variant: "destructive"
        });
    }
    setIsDeleteDialogOpen(false);
    setPigToDelete(null);
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


  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Animales</h1>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto"><Search className="mr-2 h-4 w-4" /> Buscar</Button>
            <Button variant="outline" className="w-full sm:w-auto"><Filter className="mr-2 h-4 w-4" /> Filtros</Button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Resumen de Animales</h2>
                <Button onClick={openAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Animal
                </Button>
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                      <DialogTitle>{editingPig ? 'Editar Animal' : 'Añadir Nuevo Animal'}</DialogTitle>
                      <DialogDescription>
                      {editingPig ? 'Actualiza la información del animal.' : 'Completa la información para registrar un nuevo animal en el sistema.'}
                      </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAnimalFormSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                        <Label htmlFor="id" className="sm:text-right">ID</Label>
                        <Input id="id" name="id" className="col-span-3" required defaultValue={editingPig?.id} disabled={!!editingPig} />
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
                        <Button type="submit">{editingPig ? 'Guardar Cambios' : 'Guardar Animal'}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
            </Dialog>

            <Card>
              <CardHeader>
                  <CardTitle>Filtros</CardTitle>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      <Input
                        placeholder="Buscar por ID..."
                        value={filterId}
                        onChange={(e) => setFilterId(e.target.value)}
                      />
                      <Select value={filterBreed} onValueChange={setFilterBreed}>
                          <SelectTrigger>
                            <SelectValue placeholder="Filtrar por Raza" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas las Razas</SelectItem>
                            {pigBreeds.map(breed => <SelectItem key={breed} value={breed}>{breed}</SelectItem>)}
                          </SelectContent>
                      </Select>
                      <Button variant="outline" onClick={clearFilters}>
                        <X className="mr-2 h-4 w-4" />
                        Limpiar Filtros
                      </Button>
                  </div>
              </CardHeader>
              <CardContent>
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Raza</TableHead>
                        <TableHead>Grupo Inseminación</TableHead>
                        <TableHead>F. Parto Probable</TableHead>
                        <TableHead className="text-right">Edad (sem.)</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPigs.map((pig) => (
                        <TableRow key={pig.id} onClick={() => router.push(`/gestation/${pig.id}`)} className="cursor-pointer">
                            <TableCell className="font-medium">{pig.id}</TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <Badge variant={getStatusVariant(pig.status)} className="w-fit">{pig.status}</Badge>
                                    <span className="text-xs text-muted-foreground mt-1">
                                        {pig.lastEvent.type !== 'Ninguno' ? `${pig.lastEvent.type} - ${isValid(parseISO(pig.lastEvent.date)) ? format(parseISO(pig.lastEvent.date), 'dd/MM/yy') : 'Fecha Inválida'}` : 'Sin eventos'}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>{pig.breed}</TableCell>
                            <TableCell>
                                {pig.status === 'Gestante' && pig.lastEvent.type === 'Inseminación' && pig.lastEvent.inseminationGroup
                                    ? pig.lastEvent.inseminationGroup
                                    : 'N/A'
                                }
                            </TableCell>
                            <TableCell>
                                {pig.status === 'Gestante' && pig.lastEvent.type === 'Inseminación' 
                                    ? calculateProbableFarrowingDate(pig.lastEvent.date)
                                    : 'N/A'
                                }
                            </TableCell>
                            <TableCell className="text-right">{pig.age}</TableCell>
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
                        ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {filteredPigs.map((pig) => (
                    <Link href={`/gestation/${pig.id}`} key={pig.id} className="block">
                      <Card className="hover:bg-accent/50">
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
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Estado</span>
                            <Badge variant={getStatusVariant(pig.status)}>{pig.status}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Último Evento</span>
                            <span>{pig.lastEvent.type !== 'Ninguno' ? `${pig.lastEvent.type} - ${isValid(parseISO(pig.lastEvent.date)) ? format(parseISO(pig.lastEvent.date), 'dd/MM/yy') : 'Fecha Inválida'}` : 'Sin eventos'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Grupo Insem.</span>
                            <span>{pig.status === 'Gestante' && pig.lastEvent.inseminationGroup ? pig.lastEvent.inseminationGroup : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">F. Parto Prob.</span>
                            <span>{pig.status === 'Gestante' ? calculateProbableFarrowingDate(pig.lastEvent.date) : 'N/A'}</span>
                          </div>
                           <div className="flex justify-between">
                            <span className="text-muted-foreground">Edad</span>
                            <span>{pig.age} sem.</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
        </div>
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente los datos del animal
                    de nuestros servidores.
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

    
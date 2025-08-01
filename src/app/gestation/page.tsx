
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Filter, Search, QrCode, PlusCircle, MoreHorizontal, Printer, X, CalendarPlus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
import { differenceInWeeks, parseISO, format, isValid } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

interface Pig {
    id: string;
    breed: string;
    birthDate: string;
    arrivalDate: string;
    weight: number;
    gender: string;
    purchaseValue?: number;
    age: number;
}

const initialPigs: Pig[] = [
  { id: 'PIG-001', breed: 'Duroc', birthDate: '2024-04-15', arrivalDate: '2024-05-01', weight: 85, gender: 'Hembra', purchaseValue: 150, age: 0 },
  { id: 'PIG-002', breed: 'Yorkshire', birthDate: '2024-05-13', arrivalDate: '2024-06-01', weight: 60, gender: 'Hembra', purchaseValue: 160, age: 0 },
  { id: 'PIG-003', breed: 'Landrace', birthDate: '2024-02-26', arrivalDate: '2024-03-15', weight: 110, gender: 'Hembra', purchaseValue: 155, age: 0 },
  { id: 'PIG-004', breed: 'Duroc', birthDate: '2024-06-10', arrivalDate: '2024-06-25', weight: 25, gender: 'Macho', purchaseValue: 120, age: 0 },
  { id: 'PIG-005', breed: 'Yorkshire', birthDate: '2024-03-25', arrivalDate: '2024-04-10', weight: 95, gender: 'Hembra', purchaseValue: 165, age: 0 },
  { id: 'PIG-006', breed: 'Landrace', birthDate: '2024-02-12', arrivalDate: '2024-03-01', weight: 115, gender: 'Macho', purchaseValue: 145, age: 0 },
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

export default function GestationPage() {
  const [pigs, setPigs] = React.useState<Pig[]>(initialPigs.map(p => ({
    ...p,
    age: calculateAge(p.birthDate)
  })));
  
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingPig, setEditingPig] = React.useState<Pig | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [pigToDelete, setPigToDelete] = React.useState<Pig | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = React.useState(false);
  const [selectedPig, setSelectedPig] = React.useState<Pig | null>(null);

  // States for filters
  const [filterId, setFilterId] = React.useState('');
  const [filterBreed, setFilterBreed] = React.useState('');
  const [filteredPigs, setFilteredPigs] = React.useState(pigs);

  React.useEffect(() => {
    let tempPigs = pigs;
    if (filterId) {
      tempPigs = tempPigs.filter(p => p.id.toLowerCase().includes(filterId.toLowerCase()));
    }
    if (filterBreed) {
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

  const openDetailsSheet = (pig: Pig) => {
    setSelectedPig(pig);
    setIsDetailsSheetOpen(true);
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const clearFilters = () => {
    setFilterId('');
    setFilterBreed('');
  }

  const handleAnimalFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const birthDateValue = formData.get('birthDate') as string;
    
    const submittedAnimal: Pig = {
      id: formData.get('id') as string,
      breed: formData.get('breed') as string,
      birthDate: birthDateValue,
      arrivalDate: formData.get('arrivalDate') as string,
      weight: parseInt(formData.get('weight') as string),
      gender: formData.get('gender') as string,
      purchaseValue: formData.get('purchaseValue') ? parseInt(formData.get('purchaseValue') as string) : undefined,
      age: calculateAge(birthDateValue)
    };

    if (editingPig) {
        setPigs(pigs.map(p => p.id === editingPig.id ? submittedAnimal : p));
    } else {
        setPigs(prevPigs => [...prevPigs, submittedAnimal]);
    }
    
    closeFormDialog();
    (event.target as HTMLFormElement).reset();
  };
  
  const handleDeleteConfirm = () => {
    if (pigToDelete) {
        setPigs(pigs.filter(p => p.id !== pigToDelete.id));
    }
    setIsDeleteDialogOpen(false);
    setPigToDelete(null);
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Animales</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline"><Search className="mr-2 h-4 w-4" /> Búsqueda Avanzada</Button>
            <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filtros</Button>
            <Button variant="outline"><QrCode className="mr-2 h-4 w-4" /> Escanear QR</Button>
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
                <DialogContent className="sm:max-w-[425px] overflow-visible">
                  <DialogHeader>
                      <DialogTitle>{editingPig ? 'Editar Animal' : 'Añadir Nuevo Animal'}</DialogTitle>
                      <DialogDescription>
                      {editingPig ? 'Actualiza la información del animal.' : 'Completa la información para registrar un nuevo animal en el sistema.'}
                      </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAnimalFormSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="id" className="text-right">ID</Label>
                            <Input id="id" name="id" className="col-span-3" required defaultValue={editingPig?.id} disabled={!!editingPig} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="breed" className="text-right">Raza</Label>
                          <Select name="breed" required defaultValue={editingPig?.breed}>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Seleccionar raza/línea" />
                            </SelectTrigger>
                            <SelectContent>
                              {pigBreeds.map(breed => <SelectItem key={breed} value={breed}>{breed}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="gender" className="text-right">Género</Label>
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
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="birthDate" className="text-right">F. Nacimiento</Label>
                            <Input id="birthDate" name="birthDate" type="date" className="col-span-3" required defaultValue={editingPig?.birthDate} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="arrivalDate" className="text-right">F. Llegada</Label>
                            <Input id="arrivalDate" name="arrivalDate" type="date" className="col-span-3" required defaultValue={editingPig?.arrivalDate} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="weight" className="text-right">Peso (kg)</Label>
                            <Input id="weight" name="weight" type="number" className="col-span-3" required defaultValue={editingPig?.weight} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="purchaseValue" className="text-right">Valor Compra ($)</Label>
                            <Input id="purchaseValue" name="purchaseValue" type="number" placeholder="Opcional" className="col-span-3" defaultValue={editingPig?.purchaseValue} />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="ghost" onClick={closeFormDialog}>Cancelar</Button>
                        <Button type="submit">{editingPig ? 'Guardar Cambios' : 'Guardar Animal'}</Button>
                      </DialogFooter>
                  </form>
                </DialogContent>
            </Dialog>

            <Sheet open={isDetailsSheetOpen} onOpenChange={setIsDetailsSheetOpen}>
                <SheetContent className="sm:max-w-3xl w-full flex flex-col">
                    <SheetHeader className="flex-shrink-0">
                    <SheetTitle>Hoja de Vida del Animal</SheetTitle>
                    <SheetDescription>
                        Información completa y detallada del animal seleccionado.
                    </SheetDescription>
                    </SheetHeader>
                    {selectedPig && (
                        <>
                        <ScrollArea className="flex-grow pr-6 -mr-6">
                            <div id="animal-details" className="grid gap-4 py-4 print:text-black">
                                <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-grow space-y-2">
                                            <h3 className="text-lg font-semibold">ID: {selectedPig.id}</h3>
                                            <span className="text-sm px-2 py-1 rounded-full bg-primary text-primary-foreground">{selectedPig.breed}</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                <Button><CalendarPlus className="mr-2 h-4 w-4" /> Agregar Evento</Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-56">
                                                <DropdownMenuLabel>Eventos Reproductivos</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>Celo</DropdownMenuItem>
                                                <DropdownMenuItem>Celo no Servido</DropdownMenuItem>
                                                <DropdownMenuItem>Inseminación</DropdownMenuItem>
                                                <DropdownMenuItem>Parto</DropdownMenuItem>
                                                <DropdownMenuItem>Aborto</DropdownMenuItem>
                                                <DropdownMenuLabel>Eventos de Salud</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>Tratamiento</DropdownMenuItem>
                                                <DropdownMenuItem>Vacunación</DropdownMenuItem>
                                                <DropdownMenuLabel>Eventos de Manejo</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>Venta</DropdownMenuItem>
                                                <DropdownMenuItem>Descarte</DropdownMenuItem>
                                                <DropdownMenuItem>Muerte</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <Image
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${selectedPig.id}`}
                                                alt={`QR Code for ${selectedPig.id}`}
                                                width={100}
                                                height={100}
                                                className="rounded-md"
                                            />
                                        </div>
                                    </div>
                                    <Separator/>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div className="text-muted-foreground">Género</div>
                                        <div>{selectedPig.gender}</div>

                                        <div className="text-muted-foreground">Fecha de Nacimiento</div>
                                        <div>{selectedPig.birthDate ? format(parseISO(selectedPig.birthDate), 'dd/MM/yyyy') : 'N/A'}</div>
                                        
                                        <div className="text-muted-foreground">Fecha de Llegada</div>
                                        <div>{selectedPig.arrivalDate ? format(parseISO(selectedPig.arrivalDate), 'dd/MM/yyyy') : 'N/A'}</div>
                                        
                                        <div className="text-muted-foreground">Edad Actual</div>
                                        <div>{selectedPig.age} semanas</div>
                                        
                                        <div className="text-muted-foreground">Peso Actual</div>
                                        <div>{selectedPig.weight} kg</div>

                                        <div className="text-muted-foreground">Valor de Compra</div>
                                        <div>{selectedPig.purchaseValue ? `$${selectedPig.purchaseValue.toFixed(2)}` : 'N/A'}</div>
                                    </div>
                                </div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Historial de Eventos</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-center text-muted-foreground">
                                        <p>Próximamente...</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </ScrollArea>
                        <div className="flex-shrink-0 pt-4 border-t">
                            <Button onClick={handlePrint} className="w-full print:hidden">
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimir Hoja de Vida
                            </Button>
                        </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>


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
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Raza</TableHead>
                    <TableHead>Género</TableHead>
                    <TableHead>F. Nacimiento</TableHead>
                    <TableHead>F. Llegada</TableHead>
                    <TableHead className="text-right">Edad (sem.)</TableHead>
                    <TableHead className="text-right">Peso (kg)</TableHead>
                    <TableHead className="text-right">Compra ($)</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredPigs.map((pig) => (
                    <TableRow key={pig.id} onClick={() => openDetailsSheet(pig)} className="cursor-pointer hover:bg-accent/50">
                        <TableCell className="font-medium">{pig.id}</TableCell>
                        <TableCell>{pig.breed}</TableCell>
                        <TableCell>{pig.gender}</TableCell>
                        <TableCell>{pig.birthDate}</TableCell>
                        <TableCell>{pig.arrivalDate}</TableCell>
                        <TableCell className="text-right">{pig.age}</TableCell>
                        <TableCell className="text-right">{pig.weight}</TableCell>
                        <TableCell className="text-right">{pig.purchaseValue ? pig.purchaseValue.toFixed(2) : '-'}</TableCell>
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
                              <DropdownMenuItem onSelect={() => openDetailsSheet(pig)}>Ver Detalles</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={() => openDeleteDialog(pig)} className="text-red-500 focus:text-red-500">Eliminar</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
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
                <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm}>Continuar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}

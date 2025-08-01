
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
import { differenceInWeeks, parseISO, format, isValid, addDays } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

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

type EventType = "Celo" | "Celo no Servido" | "Inseminación" | "Parto" | "Aborto" | "Tratamiento" | "Vacunación" | "Venta" | "Descarte" | "Muerte";


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
  const [isEventFormOpen, setIsEventFormOpen] = React.useState(false);
  const [selectedEventType, setSelectedEventType] = React.useState<EventType | null>(null);

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

  const openEventDialog = (eventType: EventType) => {
    setSelectedEventType(eventType);
    setIsEventFormOpen(true);
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

  const EventForm = () => {
    if (!selectedEventType) return null;
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


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission logic here in the future
        console.log(`Submitting ${selectedEventType} form`);
        setIsEventFormOpen(false);
    }
    
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Registrar Evento: {selectedEventType}</DialogTitle>
                <DialogDescription>
                    Complete la información para el evento.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
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
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="totalBorn">Total Nacidos</Label>
                                <Input id="totalBorn" type="number" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="liveBorn">Nacidos Vivos</Label>
                                <Input id="liveBorn" type="number" required />
                            </div>
                        </>
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
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsEventFormOpen(false)}>Cancelar</Button>
                    <Button type="submit">Guardar Evento</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    )
  }

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
            
            <Dialog open={isEventFormOpen} onOpenChange={setIsEventFormOpen}>
              <EventForm />
            </Dialog>

            <Sheet open={isDetailsSheetOpen} onOpenChange={setIsDetailsSheetOpen}>
                <SheetContent className="w-full sm:max-w-3xl flex flex-col">
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
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm px-2 py-1 rounded-full bg-primary text-primary-foreground">{selectedPig.breed}</span>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                    <Button><CalendarPlus className="mr-2 h-4 w-4" /> Agregar Evento</Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-56">
                                                        <DropdownMenuLabel>Eventos Reproductivos</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onSelect={() => openEventDialog("Celo")}>Celo</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => openEventDialog("Celo no Servido")}>Celo no Servido</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => openEventDialog("Inseminación")}>Inseminación</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => openEventDialog("Parto")}>Parto</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => openEventDialog("Aborto")}>Aborto</DropdownMenuItem>
                                                        <DropdownMenuLabel>Eventos de Salud</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onSelect={() => openEventDialog("Tratamiento")}>Tratamiento</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => openEventDialog("Vacunación")}>Vacunación</DropdownMenuItem>
                                                        <DropdownMenuLabel>Eventos de Manejo</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onSelect={() => openEventDialog("Venta")}>Venta</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => openEventDialog("Descarte")}>Descarte</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => openEventDialog("Muerte")}>Muerte</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
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

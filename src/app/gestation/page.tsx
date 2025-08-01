
"use client";

import * as React from 'react';
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

type EventType = "Celo" | "Celo no Servido" | "Inseminación" | "Parto" | "Aborto" | "Tratamiento" | "Vacunación" | "Venta" | "Descarte" | "Muerte";
type StatusType = 'Gestante' | 'Vacia' | 'Destetada' | 'Remplazo' | 'Lactante';

interface LastEvent {
    type: EventType | 'Ninguno';
    date: string;
    inseminationGroup?: string;
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
    lastEvent: LastEvent;
}


const initialPigs: Pig[] = [
  { id: 'PIG-001', breed: 'Duroc', birthDate: '2024-04-15', arrivalDate: '2024-05-01', weight: 85, gender: 'Hembra', purchaseValue: 150, age: 0, status: 'Gestante', lastEvent: { type: 'Inseminación', date: '2024-06-10', inseminationGroup: 'SEMANA-24' } },
  { id: 'PIG-002', breed: 'Yorkshire', birthDate: '2024-05-13', arrivalDate: '2024-06-01', weight: 60, gender: 'Hembra', purchaseValue: 160, age: 0, status: 'Vacia', lastEvent: { type: 'Celo no Servido', date: '2024-07-01' } },
  { id: 'PIG-003', breed: 'Landrace', birthDate: '2024-02-26', arrivalDate: '2024-03-15', weight: 110, gender: 'Hembra', purchaseValue: 155, age: 0, status: 'Destetada', lastEvent: { type: 'Parto', date: '2024-05-20' } },
  { id: 'PIG-004', breed: 'Duroc', birthDate: '2024-06-10', arrivalDate: '2024-06-25', weight: 25, gender: 'Macho', purchaseValue: 120, age: 0, status: 'Remplazo', lastEvent: { type: 'Ninguno', date: '' } },
  { id: 'PIG-005', breed: 'Yorkshire', birthDate: '2024-03-25', arrivalDate: '2024-04-10', weight: 95, gender: 'Hembra', purchaseValue: 165, age: 0, status: 'Remplazo', lastEvent: { type: 'Ninguno', date: '' } },
  { id: 'PIG-006', breed: 'Landrace', birthDate: '2024-02-12', arrivalDate: '2024-03-01', weight: 115, gender: 'Macho', purchaseValue: 145, age: 0, status: 'Remplazo', lastEvent: { type: 'Ninguno', date: '' } },
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
  const [pigs, setPigs] = React.useState<Pig[]>(initialPigs.map(p => ({
    ...p,
    age: calculateAge(p.birthDate)
  })));
  
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingPig, setEditingPig] = React.useState<Pig | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [pigToDelete, setPigToDelete] = React.useState<Pig | null>(null);
  const [isEventFormOpen, setIsEventFormOpen] = React.useState(false);
  const [selectedEventType, setSelectedEventType] = React.useState<EventType | null>(null);

  // States for filters
  const [filterId, setFilterId] = React.useState('');
  const [filterBreed, setFilterBreed] = React.useState('all');
  const [filteredPigs, setFilteredPigs] = React.useState(pigs);

  React.useEffect(() => {
    let tempPigs = pigs;
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

  const openEventDialog = (eventType: EventType) => {
    setSelectedEventType(eventType);
    setIsEventFormOpen(true);
  };
  
  const clearFilters = () => {
    setFilterId('');
    setFilterBreed('all');
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
      age: calculateAge(birthDateValue),
      status: 'Remplazo', 
      lastEvent: { type: 'Ninguno', date: '' },
    };

    if (editingPig) {
        setPigs(pigs.map(p => p.id === editingPig.id ? {...submittedAnimal, status: p.status, lastEvent: p.lastEvent } : p));
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
                </ScrollArea>
                <DialogFooter className="flex-shrink-0 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsEventFormOpen(false)}>Cancelar</Button>
                    <Button type="submit">Guardar Evento</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    )
  }

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
            
            <Dialog open={isEventFormOpen} onOpenChange={setIsEventFormOpen}>
              <EventForm />
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
                      <TableRow key={pig.id}>
                          <TableCell className="font-medium">{pig.id}</TableCell>
                          <TableCell>
                              <div className="flex flex-col">
                                  <Badge variant={getStatusVariant(pig.status)} className="w-fit">{pig.status}</Badge>
                                  <span className="text-xs text-muted-foreground mt-1">
                                      {pig.lastEvent.type !== 'Ninguno' ? `${pig.lastEvent.type} - ${format(parseISO(pig.lastEvent.date), 'dd/MM/yy')}` : 'Sin eventos'}
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
                    <Card key={pig.id} className="cursor-pointer hover:bg-accent/50">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{pig.id}</CardTitle>
                            <CardDescription>{pig.breed}</CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
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
                        </div>
                      </CardHeader>
                      <CardContent className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Estado</span>
                          <Badge variant={getStatusVariant(pig.status)}>{pig.status}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Último Evento</span>
                          <span>{pig.lastEvent.type !== 'Ninguno' ? `${pig.lastEvent.type} - ${format(parseISO(pig.lastEvent.date), 'dd/MM/yy')}` : 'Sin eventos'}</span>
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
  )
}

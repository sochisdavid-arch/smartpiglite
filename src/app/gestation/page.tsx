

"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Filter, Search, QrCode, PlusCircle, MoreHorizontal, Printer, Calendar as CalendarIcon, Syringe, X, Bell, Stethoscope, BookOpen } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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

interface Service {
  id: string;
  sowId: string;
  serviceDate: string;
  serviceType: string;
  semenDose?: string;
  technician?: string;
  heatDetectionMethod?: string;
  observations?: string;
  estimatedFarrowingDate: string;
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

// Interfaces for new tabs
interface Abortion {
  id: string;
  sowId: string;
  abortionDate: string;
  cause: string;
  observations?: string;
}

interface Movement {
    id: string;
    pigId: string;
    origin: string;
    destination: string;
    movementDate: string;
    reason: string;
}

interface Treatment {
    id: string;
    pigId: string;
    treatmentDate: string;
    product: string;
    dose: string;
    reason: string;
}

export default function GestationPage() {
  const [pigs, setPigs] = React.useState<Pig[]>(initialPigs.map(p => ({
    ...p,
    age: calculateAge(p.birthDate)
  })));
  const [services, setServices] = React.useState<Service[]>([]);
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingPig, setEditingPig] = React.useState<Pig | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [pigToDelete, setPigToDelete] = React.useState<Pig | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = React.useState(false);
  const [selectedPig, setSelectedPig] = React.useState<Pig | null>(null);

  // States for Service tab
  const [selectedSowId, setSelectedSowId] = React.useState('');
  
  // States for filters
  const [filterId, setFilterId] = React.useState('');
  const [filterBreed, setFilterBreed] = React.useState('');
  const [filteredPigs, setFilteredPigs] = React.useState(pigs);

  // States for Tracking tab
  const [trackingSowId, setTrackingSowId] = React.useState('');
  
  // States for Diagnosis tab
  const [diagSowId, setDiagSowId] = React.useState('');

  // States for new tabs
  const [abortions, setAbortions] = React.useState<Abortion[]>([]);
  const [abortionsSowId, setAbortionsSowId] = React.useState('');
  const [movements, setMovements] = React.useState<Movement[]>([]);
  const [movementPigId, setMovementPigId] = React.useState('');
  const [treatments, setTreatments] = React.useState<Treatment[]>([]);
  const [treatmentPigId, setTreatmentPigId] = React.useState('');
  const [historyPigId, setHistoryPigId] = React.useState('');
  const [feedingSowId, setFeedingSowId] = React.useState('');

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


  const sowOptions = pigs
    .filter(pig => pig.gender === 'Hembra');

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

  const handleServiceFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const serviceDate = formData.get('serviceDate') as string;
    const currentSowId = formData.get('sowId') as string;

    const sowExists = pigs.some(pig => pig.id === currentSowId && pig.gender === 'Hembra');
    if (!sowExists) {
        toast({
            variant: "destructive",
            title: "Error de Registro",
            description: `La cerda con ID "${currentSowId}" no existe o no es hembra.`,
        });
        return;
    }

    if (!serviceDate || !isValid(parseISO(serviceDate))) {
      toast({
            variant: "destructive",
            title: "Error de Registro",
            description: "Por favor, introduce una fecha de servicio válida.",
        });
        return;
    }

    const newService: Service = {
        id: `SRV-${Date.now()}`,
        sowId: currentSowId,
        serviceDate,
        serviceType: formData.get('serviceType') as string,
        semenDose: formData.get('semenDose') as string,
        technician: formData.get('technician') as string,
        heatDetectionMethod: formData.get('heatDetectionMethod') as string,
        observations: formData.get('observations') as string,
        estimatedFarrowingDate: format(addDays(parseISO(serviceDate), 114), 'yyyy-MM-dd'),
    };

    setServices(prevServices => [newService, ...prevServices]);

    toast({
        title: "Servicio Registrado",
        description: `Se ha registrado el servicio para la cerda ${currentSowId}.`,
    });

    (event.target as HTMLFormElement).reset();
    setSelectedSowId('');
  };

  const handleAbortionSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const newAbortion: Abortion = {
          id: `AB-${Date.now()}`,
          sowId: formData.get('abortion-sowId') as string,
          abortionDate: formData.get('abortionDate') as string,
          cause: formData.get('cause') as string,
          observations: formData.get('observations') as string,
      };
      setAbortions(prev => [newAbortion, ...prev]);
      toast({ title: "Aborto Registrado", description: `Se ha registrado un aborto para la cerda ${newAbortion.sowId}.` });
      (event.target as HTMLFormElement).reset();
  };

  const handleMovementSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const newMovement: Movement = {
          id: `MOV-${Date.now()}`,
          pigId: formData.get('movement-pigId') as string,
          origin: formData.get('origin') as string,
          destination: formData.get('destination') as string,
          movementDate: formData.get('movementDate') as string,
          reason: formData.get('reason') as string,
      };
      setMovements(prev => [newMovement, ...prev]);
      toast({ title: "Movimiento Registrado", description: `Movimiento del animal ${newMovement.pigId} registrado.` });
      (event.target as HTMLFormElement).reset();
  };

  const handleTreatmentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const newTreatment: Treatment = {
          id: `TRT-${Date.now()}`,
          pigId: formData.get('treatment-pigId') as string,
          treatmentDate: formData.get('treatmentDate') as string,
          product: formData.get('product') as string,
          dose: formData.get('dose') as string,
          reason: formData.get('reason') as string,
      };
      setTreatments(prev => [newTreatment, ...prev]);
      toast({ title: "Tratamiento Registrado", description: `Tratamiento para el animal ${newTreatment.pigId} registrado.` });
      (event.target as HTMLFormElement).reset();
  };


  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Gestación</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline"><Search className="mr-2 h-4 w-4" /> Búsqueda Avanzada</Button>
            <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filtros</Button>
            <Button variant="outline"><QrCode className="mr-2 h-4 w-4" /> Escanear QR</Button>
          </div>
        </div>

        <Tabs defaultValue="animals" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-11">
            <TabsTrigger value="animals">Animales</TabsTrigger>
            <TabsTrigger value="services">Servicios</TabsTrigger>
            <TabsTrigger value="tracking">Seguimiento</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnóstico</TabsTrigger>
            <TabsTrigger value="abortions">Abortos</TabsTrigger>
            <TabsTrigger value="movements">Movimientos</TabsTrigger>
            <TabsTrigger value="feeding">Alimentación</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
            <TabsTrigger value="treatments">Tratamientos</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="animals" className="mt-6">
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
                    <SheetContent className="sm:max-w-xl w-full flex flex-col">
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
                                            <div>
                                                <h3 className="text-lg font-semibold">ID: {selectedPig.id}</h3>
                                                <span className="text-sm px-2 py-1 rounded-full bg-primary text-primary-foreground">{selectedPig.breed}</span>
                                            </div>
                                            <Image
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${selectedPig.id}`}
                                                alt={`QR Code for ${selectedPig.id}`}
                                                width={100}
                                                height={100}
                                                className="rounded-md"
                                            />
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
                                            <CardTitle>Historial Reproductivo</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-center text-muted-foreground">
                                            <p>Próximamente...</p>
                                        </CardContent>
                                    </Card>
                                     <Card>
                                        <CardHeader>
                                            <CardTitle>Historial de Tratamientos</CardTitle>
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
                        <TableRow key={pig.id}>
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
                                <DropdownMenuTrigger asChild>
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
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Registro de Servicios</CardTitle>
                  <CardDescription>Registre los detalles de la inseminación o monta natural de la cerda.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleServiceFormSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="sowId">Cerda (ID)</Label>
                      <Select name="sowId" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Buscar cerda por ID..." />
                        </SelectTrigger>
                        <SelectContent>
                          {sowOptions.map(sow => <SelectItem key={sow.id} value={sow.id}>{sow.id} - {sow.breed}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serviceDate">Fecha del Servicio</Label>
                      <Input id="serviceDate" name="serviceDate" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Servicio</Label>
                      <Select name="serviceType" required>
                        <SelectTrigger><SelectValue placeholder="Seleccione un tipo" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Monta Natural">Monta Natural</SelectItem>
                          <SelectItem value="Inseminación Artificial">Inseminación Artificial</SelectItem>
                          <SelectItem value="Doble Servicio">Doble Servicio</SelectItem>
                          <SelectItem value="Servicio Fallido">Servicio Fallido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="semenDose">Dosis de Semen (Lote, Macho)</Label>
                      <Input id="semenDose" name="semenDose" placeholder="Lote-123, Macho-A42" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="technician">Técnico</Label>
                      <Input id="technician" name="technician" placeholder="Nombre del técnico" />
                    </div>
                    <div className="space-y-2">
                      <Label>Método Detección de Celo</Label>
                      <Select name="heatDetectionMethod">
                        <SelectTrigger><SelectValue placeholder="Seleccione un método" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Visual">Visual</SelectItem>
                          <SelectItem value="Exposición al Macho">Exposición al Macho</SelectItem>
                          <SelectItem value="Automatizado">Automatizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="observations">Observaciones Clínicas</Label>
                      <Textarea id="observations" name="observations" placeholder="Cualquier observación relevante..." />
                    </div>
                    <Button type="submit" className="w-full">
                      <Syringe className="mr-2 h-4 w-4" />
                      Registrar Servicio
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Servicios Registrados</CardTitle>
                  <CardDescription>Lista de los últimos servicios de inseminación y montas.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cerda</TableHead>
                          <TableHead>F. Servicio</TableHead>
                          <TableHead>F. Parto (Est.)</TableHead>
                          <TableHead>Tipo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {services.length > 0 ? (
                          services.map((service) => (
                            <TableRow key={service.id}>
                              <TableCell className="font-medium">{service.sowId}</TableCell>
                              <TableCell>{format(parseISO(service.serviceDate), 'dd/MM/yyyy')}</TableCell>
                              <TableCell>{format(parseISO(service.estimatedFarrowingDate), 'dd/MM/yyyy')}</TableCell>
                              <TableCell>{service.serviceType}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                              No hay servicios registrados.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Seguimiento de la Gestación</CardTitle>
                <CardDescription>Visualice el progreso y las fechas clave de la gestación de una cerda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-2">
                  <div className="flex-grow space-y-2">
                     <Label htmlFor="tracking-sow-id">Selección de Cerda</Label>
                    <Select name="tracking-sow-id" onValueChange={setTrackingSowId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Buscar cerda gestante..." />
                        </SelectTrigger>
                        <SelectContent>
                           {sowOptions.map(sow => <SelectItem key={sow.id} value={sow.id}>{sow.id} - {sow.breed}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                  <Button><Search className="h-4 w-4"/></Button>
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-semibold text-lg mb-4 text-center">Calendario Gestacional: Cerda {trackingSowId || "..."}</h3>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">Día 35</p>
                    <p className="text-muted-foreground">de 114 (aprox.)</p>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="font-semibold">Implantación</p>
                      <p className="text-sm text-green-600">Completada (Día 12-18)</p>
                    </div>
                    <div>
                      <p className="font-semibold">Formación Fetal</p>
                      <p className="text-sm text-blue-600">En progreso (Día 25+)</p>
                    </div>
                     <div>
                      <p className="font-semibold">Parto Estimado</p>
                      <p className="text-sm">25 de Agosto, 2024</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="diagnosis" className="mt-6">
             <Card>
              <CardHeader>
                <CardTitle>Diagnóstico de Preñez</CardTitle>
                <CardDescription>Registre los resultados de ecografías u otros métodos de diagnóstico.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="diag-sow-id">Cerda</Label>
                      <Select name="diag-sow-id" onValueChange={setDiagSowId}>
                        <SelectTrigger>
                          <SelectValue placeholder="ID de la cerda" />
                        </SelectTrigger>
                        <SelectContent>
                           {sowOptions.map(sow => <SelectItem key={sow.id} value={sow.id}>{sow.id} - {sow.breed}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="diag-date">Fecha de Diagnóstico</Label>
                      <Input id="diag-date" type="date"/>
                    </div>
                 </div>
                 <div className="grid gap-4 md:grid-cols-2">
                   <div className="space-y-2">
                      <Label>Método Utilizado</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Seleccione método" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ultrasound">Ecografía</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Resultado</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Seleccione resultado" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pregnant">Preñada</SelectItem>
                          <SelectItem value="empty">Vacía</SelectItem>
                          <SelectItem value="doubtful">Dudosa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                 </div>
                 <Button>Registrar Diagnóstico</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="abortions" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Registro de Abortos</CardTitle>
                        <CardDescription>Registre cualquier evento de aborto para análisis futuro.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAbortionSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="abortion-sowId">Cerda (ID)</Label>
                                <Select name="abortion-sowId" required>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Buscar cerda..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {sowOptions.map(sow => <SelectItem key={sow.id} value={sow.id}>{sow.id} - {sow.breed}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="abortionDate">Fecha del Aborto</Label>
                                <Input id="abortionDate" name="abortionDate" type="date" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cause">Causa Probable</Label>
                                <Input id="cause" name="cause" placeholder="Ej. Estrés por calor, enfermedad" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="abortion-observations">Observaciones</Label>
                                <Textarea id="abortion-observations" name="observations" placeholder="Detalles adicionales..."/>
                            </div>
                            <Button type="submit" className="w-full">Registrar Aborto</Button>
                        </form>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Historial de Abortos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-72">
                            <Table>
                                <TableHeader><TableRow><TableHead>Cerda</TableHead><TableHead>Fecha</TableHead><TableHead>Causa</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {abortions.length > 0 ? abortions.map(a => (
                                        <TableRow key={a.id}><TableCell>{a.sowId}</TableCell><TableCell>{a.abortionDate}</TableCell><TableCell>{a.cause}</TableCell></TableRow>
                                    )) : <TableRow><TableCell colSpan={3} className="h-24 text-center">No hay abortos registrados.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
          </TabsContent>

          <TabsContent value="movements" className="mt-6">
             <Card>
                <CardHeader>
                    <CardTitle>Registro de Movimientos de Animales</CardTitle>
                    <CardDescription>Registre los cambios de ubicación o grupo de los animales.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleMovementSubmit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                           <div className="space-y-2">
                                <Label htmlFor="movement-pigId">Animal (ID)</Label>
                                <Select name="movement-pigId" required>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Buscar animal..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {pigs.map(pig => <SelectItem key={pig.id} value={pig.id}>{pig.id} - {pig.breed}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="movementDate">Fecha de Movimiento</Label>
                                <Input id="movementDate" name="movementDate" type="date" required />
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="origin">Grupo/Ubicación Origen</Label>
                                <Input id="origin" name="origin" placeholder="Ej. Corral A-01" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="destination">Grupo/Ubicación Destino</Label>
                                <Input id="destination" name="destination" placeholder="Ej. Corral B-05" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reason">Razón del Movimiento</Label>
                            <Input id="reason" name="reason" placeholder="Ej. Agrupación por peso" required />
                        </div>
                        <Button type="submit">Registrar Movimiento</Button>
                    </form>
                    <Separator className="my-6" />
                    <h3 className="text-lg font-semibold mb-2">Historial de Movimientos Recientes</h3>
                    <ScrollArea className="h-60">
                        <Table>
                            <TableHeader><TableRow><TableHead>ID Animal</TableHead><TableHead>Origen</TableHead><TableHead>Destino</TableHead><TableHead>Fecha</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {movements.length > 0 ? movements.map(m => (
                                    <TableRow key={m.id}><TableCell>{m.pigId}</TableCell><TableCell>{m.origin}</TableCell><TableCell>{m.destination}</TableCell><TableCell>{m.movementDate}</TableCell></TableRow>
                                )) : <TableRow><TableCell colSpan={4} className="h-24 text-center">No hay movimientos registrados.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feeding" className="mt-6">
              <Card>
                <CardHeader>
                    <CardTitle>Plan de Alimentación en Gestación</CardTitle>
                    <CardDescription>Asigne y ajuste planes de alimentación específicos para cerdas gestantes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold">Registrar/Actualizar Plan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="feeding-sowId">Cerda</Label>
                                <Select name="feeding-sowId">
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar cerda" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {sowOptions.map(sow => <SelectItem key={sow.id} value={sow.id}>{sow.id} - {sow.breed}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Etapa Gestacional</Label>
                                <Select name="gestationStage">
                                    <SelectTrigger><SelectValue placeholder="Seleccionar etapa" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="early">Temprana (0-30 días)</SelectItem>
                                        <SelectItem value="mid">Media (31-85 días)</SelectItem>
                                        <SelectItem value="late">Tardía (86+ días)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="feedType">Tipo de Alimento</Label>
                                <Input id="feedType" name="feedType" placeholder="Ej. Gestación Fase 1" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dailyQuantity">Cantidad Diaria (kg)</Label>
                                <Input id="dailyQuantity" name="dailyQuantity" type="number" step="0.1" placeholder="Ej. 2.5" />
                            </div>
                        </div>
                        <Button>Guardar Plan</Button>
                    </form>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Planes Actuales</h3>
                        <Alert>
                          <Stethoscope className="h-4 w-4" />
                          <AlertTitle>Funcionalidad en desarrollo</AlertTitle>
                          <AlertDescription>La visualización de los planes de alimentación estará disponible próximamente.</AlertDescription>
                        </Alert>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Alertas y Notificaciones</CardTitle>
                    <CardDescription>Configure y revise alertas para fechas importantes del ciclo de gestación.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Alert>
                            <Bell className="h-4 w-4" />
                            <AlertTitle>Próximo Parto: PIG-001</AlertTitle>
                            <AlertDescription>Fecha estimada: 25 de Agosto, 2024 (en 3 días)</AlertDescription>
                        </Alert>
                         <Alert>
                            <Bell className="h-4 w-4" />
                            <AlertTitle>Diagnóstico de Preñez: PIG-003</AlertTitle>
                            <AlertDescription>Revisar en 5 días.</AlertDescription>
                        </Alert>
                         <Alert variant="destructive">
                            <Bell className="h-4 w-4" />
                            <AlertTitle>Servicio Atrasado: PIG-005</AlertTitle>
                            <AlertDescription>Pasaron 10 días desde el destete.</AlertDescription>
                        </Alert>
                    </div>
                     <p className="text-sm text-muted-foreground">Esta es una vista previa. La configuración de alertas personalizadas estará disponible en futuras actualizaciones.</p>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="treatments" className="mt-6">
              <Card>
                <CardHeader>
                    <CardTitle>Registro de Tratamientos</CardTitle>
                    <CardDescription>Mantenga un registro de todos los tratamientos médicos aplicados.</CardDescription>
                </CardHeader>
                <CardContent>
                     <form onSubmit={handleTreatmentSubmit} className="space-y-4 mb-6 p-4 border rounded-lg">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="treatment-pigId">Animal (ID)</Label>
                                <Select name="treatment-pigId" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Buscar animal..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pigs.map(pig => <SelectItem key={pig.id} value={pig.id}>{pig.id} - {pig.breed}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="treatmentDate">Fecha de Tratamiento</Label>
                                <Input id="treatmentDate" name="treatmentDate" type="date" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product">Producto Utilizado</Label>
                                <Input id="product" name="product" placeholder="Ej. Ivermectina" required />
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="dose">Dosis</Label>
                                <Input id="dose" name="dose" placeholder="Ej. 2 ml" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="treatment-reason">Razón del Tratamiento</Label>
                                <Input id="treatment-reason" name="reason" placeholder="Ej. Desparasitación" required />
                            </div>
                        </div>
                        <Button type="submit">Registrar Tratamiento</Button>
                    </form>
                    <h3 className="text-lg font-semibold mb-2">Historial de Tratamientos</h3>
                    <ScrollArea className="h-60">
                        <Table>
                            <TableHeader><TableRow><TableHead>ID Animal</TableHead><TableHead>Fecha</TableHead><TableHead>Producto</TableHead><TableHead>Razón</TableHead></TableRow></TableHeader>
                            <TableBody>
                               {treatments.length > 0 ? treatments.map(t => (
                                    <TableRow key={t.id}><TableCell>{t.pigId}</TableCell><TableCell>{t.treatmentDate}</TableCell><TableCell>{t.product}</TableCell><TableCell>{t.reason}</TableCell></TableRow>
                                )) : <TableRow><TableCell colSpan={4} className="h-24 text-center">No hay tratamientos registrados.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
             <Card>
                <CardHeader>
                    <CardTitle>Historial Reproductivo Individual</CardTitle>
                    <CardDescription>Consulte el ciclo reproductivo completo de una cerda específica.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-end gap-2">
                      <div className="flex-grow space-y-2">
                         <Label htmlFor="history-sow-id">Seleccione una Cerda</Label>
                        <Select name="history-sow-id" onValueChange={setHistoryPigId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Buscar cerda..." />
                            </SelectTrigger>
                            <SelectContent>
                                {sowOptions.map(sow => <SelectItem key={sow.id} value={sow.id}>{sow.id} - {sow.breed}</SelectItem>)}
                            </SelectContent>
                        </Select>
                      </div>
                      <Button><Search className="h-4 w-4"/></Button>
                    </div>
                     <Alert>
                      <BookOpen className="h-4 w-4" />
                      <AlertTitle>Historial para: {historyPigId || "..."}</AlertTitle>
                      <AlertDescription>La visualización detallada del historial está en desarrollo.</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="mt-6">
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle>Reportes de Gestación</CardTitle>
                        <CardDescription>Analice el rendimiento reproductivo de su granja.</CardDescription>
                    </div>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Exportar</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Métrica</TableHead>
                                <TableHead className="text-right">Valor Actual</TableHead>
                                <TableHead className="text-right">Ciclo Anterior</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Tasa de Concepción (%)</TableCell>
                                <TableCell className="text-right text-green-600 font-medium">92%</TableCell>
                                <TableCell className="text-right">89%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Tasa de Abortos (%)</TableCell>
                                <TableCell className="text-right text-red-600 font-medium">1.5%</TableCell>
                                <TableCell className="text-right">2.1%</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Intervalo Destete-Servicio (días)</TableCell>
                                <TableCell className="text-right text-green-600 font-medium">5.2</TableCell>
                                <TableCell className="text-right">5.8</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
        
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

    
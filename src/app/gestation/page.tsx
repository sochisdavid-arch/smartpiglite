
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
import { Filter, Search, PlusCircle, MoreHorizontal, X, Wheat } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';

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

interface ConsumptionRecord {
    id: string;
    date: string;
    totalQuantity: number;
    feedType: { value: string; label: string; };
    sowCount: number;
    averageConsumption: number;
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

const mockInventory = [
    { id: 'MED-01', name: 'Oxitetraciclina 200 LA', category: 'medicamento', stock: 5 },
    { id: 'MED-02', name: 'Amoxicilina 15%', category: 'medicamento', stock: 12 },
    { id: 'MED-03', name: 'Ivermectina 1%', category: 'medicamento', stock: 8 },
    { id: 'VAC-01', name: 'Vacuna Circovirus', category: 'vacuna', stock: 50 },
    { id: 'VAC-02', name: 'Vacuna Mycoplasma', category: 'vacuna', stock: 100 },
    { id: 'VAC-03', name: 'Vacuna Parvovirus/Leptospira', category: 'vacuna', stock: 25 },
    { id: 'FEED-01', name: 'Alimento Gestación 1', category: 'alimento', stock: 500 },
    { id: 'FEED-02', name: 'Alimento Gestación 2', category: 'alimento', stock: 800 },
    { id: 'FEED-03', name: 'Alimento Lactancia', category: 'alimento', stock: 650 },
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
  const [isConsumptionFormOpen, setIsConsumptionFormOpen] = React.useState(false);
  const [editingPig, setEditingPig] = React.useState<Pig | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [pigToDelete, setPigToDelete] = React.useState<Pig | null>(null);
  const [consumptionHistory, setConsumptionHistory] = React.useState<ConsumptionRecord[]>([]);

  // States for filters
  const [filterId, setFilterId] = React.useState('');
  const [filterBreed, setFilterBreed] = React.useState('all');
  const [filteredPigs, setFilteredPigs] = React.useState<Pig[]>([]);

  React.useEffect(() => {
    // Load pigs from localStorage
    const pigsFromStorage = localStorage.getItem('pigs');
    const allPigs = pigsFromStorage ? JSON.parse(pigsFromStorage) : initialPigs;
    const processedPigs = allPigs.map((p: Pig) => ({
      ...p,
      age: calculateAge(p.birthDate)
    }));
    setPigs(processedPigs);
    if (!pigsFromStorage) {
        localStorage.setItem('pigs', JSON.stringify(initialPigs));
    }

    // Load consumption history from localStorage
    const historyFromStorage = localStorage.getItem('consumptionHistory');
    if (historyFromStorage) {
        setConsumptionHistory(JSON.parse(historyFromStorage));
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

   const ConsumptionForm = () => {
        const [selectedFeed, setSelectedFeed] = React.useState<string>();
        const [totalQuantity, setTotalQuantity] = React.useState<number | string>('');
        const [sowCount, setSowCount] = React.useState<number | string>('');
        const feedOptions = mockInventory.filter(p => p.category === 'alimento').map(f => ({ value: f.id, label: `${f.name} (Stock: ${f.stock}kg)` }));

        const averageConsumption = React.useMemo(() => {
            const numTotalQuantity = Number(totalQuantity);
            const numSowCount = Number(sowCount);
            if (numTotalQuantity > 0 && numSowCount > 0) {
                return (numTotalQuantity / numSowCount).toFixed(2);
            }
            return '0.00';
        }, [totalQuantity, sowCount]);


        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const consumptionDate = formData.get('consumptionDate') as string;
            
            if (!selectedFeed) {
                toast({
                    variant: "destructive",
                    title: "Campo requerido",
                    description: "Por favor, seleccione un tipo de alimento.",
                });
                return;
            }

            const foundFeed = feedOptions.find(o => o.value === selectedFeed);

            if (!foundFeed) return;

            const newRecord: ConsumptionRecord = {
                id: new Date().toISOString(),
                date: consumptionDate,
                totalQuantity: Number(totalQuantity),
                feedType: foundFeed,
                sowCount: Number(sowCount),
                averageConsumption: Number(averageConsumption),
            };

            const updatedHistory = [newRecord, ...consumptionHistory];
            setConsumptionHistory(updatedHistory);
            localStorage.setItem('consumptionHistory', JSON.stringify(updatedHistory));
            
            toast({
                title: "¡Consumo de Lote Registrado!",
                description: `${totalQuantity}kg de ${foundFeed.label.split(' (')[0]} registrado para ${sowCount} hembras.`,
            });
            
            setIsConsumptionFormOpen(false);
        }

        return (
             <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Registrar Consumo del Lote de Reproductoras</DialogTitle>
                    <DialogDescription>
                        Registre el consumo diario de alimento para un grupo de hembras. El consumo se descontará del inventario.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="pr-6 -mr-6">
                <div className="space-y-4 py-4 pr-6">
                    <form onSubmit={handleSubmit} id="consumption-form" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="consumptionDate">Fecha</Label>
                                <Input id="consumptionDate" name="consumptionDate" type="date" required defaultValue={new Date().toISOString().substring(0, 10)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sowCount">Nº de Hembras</Label>
                                <Input id="sowCount" name="sowCount" type="number" placeholder="Ej. 25" required value={sowCount} onChange={e => setSowCount(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Cantidad Total (kg)</Label>
                                <Input id="quantity" name="quantity" type="number" step="0.1" placeholder="Ej. 180.5" required value={totalQuantity} onChange={e => setTotalQuantity(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Promedio por Animal (kg)</Label>
                                <div className="text-lg font-semibold p-2 border rounded-md bg-muted h-10 flex items-center">{averageConsumption}</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="feedType">Tipo de Alimento</Label>
                            <Select onValueChange={setSelectedFeed} value={selectedFeed}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un alimento..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {feedOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </form>

                    <Separator />

                    <div>
                        <h3 className="text-lg font-medium mb-4">Historial de Consumos</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Alimento</TableHead>
                                    <TableHead>Nº Hembras</TableHead>
                                    <TableHead className="text-right">Total (kg)</TableHead>
                                    <TableHead className="text-right">Promedio (kg)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {consumptionHistory.map(record => (
                                    <TableRow key={record.id}>
                                        <TableCell>{format(parseISO(record.date), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>{record.feedType.label.split(' (')[0]}</TableCell>
                                        <TableCell>{record.sowCount}</TableCell>
                                        <TableCell className="text-right">{record.totalQuantity.toFixed(1)}</TableCell>
                                        <TableCell className="text-right">{record.averageConsumption.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                                {consumptionHistory.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">No hay registros de consumo.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                </ScrollArea>

                <DialogFooter className="border-t pt-4 -mx-6 px-6 bg-background sticky bottom-0">
                    <Button type="button" variant="ghost" onClick={() => setIsConsumptionFormOpen(false)}>Cancelar</Button>
                    <Button type="submit" form="consumption-form">Guardar Consumo</Button>
                </DialogFooter>
            </DialogContent>
        )
    }


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
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Resumen de Animales</h2>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" onClick={() => setIsConsumptionFormOpen(true)}>
                        <Wheat className="mr-2 h-4 w-4" />
                        Registrar Consumo de Lote
                    </Button>
                    <Button onClick={openAddDialog}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir Animal
                    </Button>
                </div>
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
            <Dialog open={isConsumptionFormOpen} onOpenChange={setIsConsumptionFormOpen}>
                <ConsumptionForm />
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


"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from '@/components/ui/scroll-area';
import { differenceInWeeks, parseISO, format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const initialPigs = [
  { id: 'PIG-001', breed: 'Duroc', birthDate: '2024-04-15', arrivalDate: '2024-05-01', weight: 85, status: 'Gestación' },
  { id: 'PIG-002', breed: 'Yorkshire', birthDate: '2024-05-13', arrivalDate: '2024-06-01', weight: 60, status: 'Lactancia' },
  { id: 'PIG-003', breed: 'Landrace', birthDate: '2024-02-26', arrivalDate: '2024-03-15', weight: 110, status: 'Engorde' },
  { id: 'PIG-004', breed: 'Duroc', birthDate: '2024-06-10', arrivalDate: '2024-06-25', weight: 25, status: 'Destetado' },
  { id: 'PIG-005', breed: 'Yorkshire', birthDate: '2024-03-25', arrivalDate: '2024-04-10', weight: 95, status: 'Gestación' },
  { id: 'PIG-006', breed: 'Landrace', birthDate: '2024-02-12', arrivalDate: '2024-03-01', weight: 115, status: 'Engorde' },
];

const statusVariant: { [key: string]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
    'Gestación': 'secondary',
    'Lactancia': 'default',
    'Engorde': 'outline',
    'Destetado': 'destructive'
};

const pigBreeds = [
  // Razas Puras
  "Duroc", "Yorkshire (Large White)", "Landrace", "Hampshire", "Pietrain", "Berkshire", "Chester White", "Spotted", "Poland China", "Tamworth", "Large Black", "Cerdo Ibérico",
  // Líneas Genéticas Comerciales
  "PIC", "Topigs Norsvin", "Hypor (Hendrix Genetics)", "DanBred", "Genus", "Choice Genetics", "Genesus",
  // Otras
  "Otro"
];

export default function PigsPage() {
  const [pigs, setPigs] = React.useState(initialPigs.map(p => ({
    ...p,
    age: differenceInWeeks(new Date(), parseISO(p.birthDate))
  })));
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [birthDate, setBirthDate] = React.useState<Date | undefined>();
  const [arrivalDate, setArrivalDate] = React.useState<Date | undefined>();

  const handleAddAnimal = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const birthDateValue = birthDate ? format(birthDate, 'yyyy-MM-dd') : '';
    const arrivalDateValue = arrivalDate ? format(arrivalDate, 'yyyy-MM-dd') : '';
    
    const newAnimal = {
      id: formData.get('id') as string,
      breed: formData.get('breed') as string,
      birthDate: birthDateValue,
      arrivalDate: arrivalDateValue,
      weight: parseInt(formData.get('weight') as string),
      status: formData.get('status') as string,
      age: differenceInWeeks(new Date(), parseISO(birthDateValue))
    };
    setPigs(prevPigs => [...prevPigs, newAnimal]);
    setIsDialogOpen(false);
    setBirthDate(undefined);
    setArrivalDate(undefined);
    (event.target as HTMLFormElement).reset();
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Resumen de Cerdos</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Animal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Animal</DialogTitle>
                <DialogDescription>
                  Completa la información para registrar un nuevo animal en el sistema.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAnimal}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="id" className="text-right">ID</Label>
                    <Input id="id" name="id" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="breed" className="text-right">Raza</Label>
                     <Select name="breed" required>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Seleccionar raza/línea" />
                        </SelectTrigger>
                        <SelectContent>
                            <ScrollArea className="h-48">
                                {pigBreeds.map(breed => (
                                    <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                                ))}
                            </ScrollArea>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="birthDate" className="text-right">Fecha de Nacimiento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "col-span-3 justify-start text-left font-normal",
                            !birthDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {birthDate ? format(birthDate, "PPP") : <span>Seleccionar fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={birthDate}
                          onSelect={setBirthDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="arrivalDate" className="text-right">Fecha de Llegada</Label>
                    <Popover>
                       <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "col-span-3 justify-start text-left font-normal",
                            !arrivalDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {arrivalDate ? format(arrivalDate, "PPP") : <span>Seleccionar fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={arrivalDate}
                          onSelect={setArrivalDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="weight" className="text-right">Peso (kg)</Label>
                    <Input id="weight" name="weight" type="number" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Estado</Label>
                    <Select name="status" required>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Gestación">Gestación</SelectItem>
                            <SelectItem value="Lactancia">Lactancia</SelectItem>
                            <SelectItem value="Engorde">Engorde</SelectItem>
                            <SelectItem value="Destetado">Destetado</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Guardar Animal</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <Input placeholder="Buscar por ID..." />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gestation">Gestación</SelectItem>
                  <SelectItem value="lactation">Lactancia</SelectItem>
                  <SelectItem value="fattening">Engorde</SelectItem>
                  <SelectItem value="weaned">Destetado</SelectItem>
                </SelectContent>
              </Select>
               <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por Raza" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="duroc">Duroc</SelectItem>
                  <SelectItem value="yorkshire">Yorkshire</SelectItem>
                  <SelectItem value="landrace">Landrace</SelectItem>
                </SelectContent>
              </Select>
              <Button>Aplicar Filtros</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Raza</TableHead>
                  <TableHead>F. Nacimiento</TableHead>
                  <TableHead>F. Llegada</TableHead>
                  <TableHead className="text-right">Edad (sem.)</TableHead>
                  <TableHead className="text-right">Peso (kg)</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pigs.map((pig) => (
                  <TableRow key={pig.id}>
                    <TableCell className="font-medium">{pig.id}</TableCell>
                    <TableCell>{pig.breed}</TableCell>
                    <TableCell>{pig.birthDate}</TableCell>
                    <TableCell>{pig.arrivalDate}</TableCell>
                    <TableCell className="text-right">{pig.age}</TableCell>
                    <TableCell className="text-right">{pig.weight}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant={statusVariant[pig.status] || 'default'}>{pig.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">Eliminar</DropdownMenuItem>
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
    </AppLayout>
  );
}

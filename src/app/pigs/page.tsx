import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

const pigs = [
  { id: 'PIG-001', breed: 'Duroc', age: 12, weight: 85, status: 'Gestación' },
  { id: 'PIG-002', breed: 'Yorkshire', age: 8, weight: 60, status: 'Lactancia' },
  { id: 'PIG-003', breed: 'Landrace', age: 20, weight: 110, status: 'Engorde' },
  { id: 'PIG-004', breed: 'Duroc', age: 5, weight: 25, status: 'Destetado' },
  { id: 'PIG-005', breed: 'Yorkshire', age: 15, weight: 95, status: 'Gestación' },
  { id: 'PIG-006', breed: 'Landrace', age: 22, weight: 115, status: 'Engorde' },
];

const statusVariant: { [key: string]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
    'Gestación': 'secondary',
    'Lactancia': 'default',
    'Engorde': 'outline',
    'Destetado': 'destructive'
};

const statusTranslation: { [key: string]: string } = {
    Gestation: 'Gestación',
    Lactation: 'Lactancia',
    Fattening: 'Engorde',
    Weaned: 'Destetado'
};

export default function PigsPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Resumen de Cerdos</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Cerdo
          </Button>
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
                  <TableHead className="text-right">Edad (semanas)</TableHead>
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

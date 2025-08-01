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
  { id: 'PIG-001', breed: 'Duroc', age: 12, weight: 85, status: 'Gestation' },
  { id: 'PIG-002', breed: 'Yorkshire', age: 8, weight: 60, status: 'Lactation' },
  { id: 'PIG-003', breed: 'Landrace', age: 20, weight: 110, status: 'Fattening' },
  { id: 'PIG-004', breed: 'Duroc', age: 5, weight: 25, status: 'Weaned' },
  { id: 'PIG-005', breed: 'Yorkshire', age: 15, weight: 95, status: 'Gestation' },
  { id: 'PIG-006', breed: 'Landrace', age: 22, weight: 115, status: 'Fattening' },
];

const statusVariant: { [key: string]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
    Gestation: 'secondary',
    Lactation: 'default',
    Fattening: 'outline',
    Weaned: 'destructive'
};

export default function PigsPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Pigs Overview</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Pig
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <Input placeholder="Search by ID..." />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gestation">Gestation</SelectItem>
                  <SelectItem value="lactation">Lactation</SelectItem>
                  <SelectItem value="fattening">Fattening</SelectItem>
                  <SelectItem value="weaned">Weaned</SelectItem>
                </SelectContent>
              </Select>
               <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Breed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="duroc">Duroc</SelectItem>
                  <SelectItem value="yorkshire">Yorkshire</SelectItem>
                  <SelectItem value="landrace">Landrace</SelectItem>
                </SelectContent>
              </Select>
              <Button>Apply Filters</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Breed</TableHead>
                  <TableHead className="text-right">Age (weeks)</TableHead>
                  <TableHead className="text-right">Weight (kg)</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
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

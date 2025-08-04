
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getInventory, updateInventory, InventoryItem } from '@/lib/inventory';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function AlimentosPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [alimentos, setAlimentos] = React.useState<InventoryItem[]>([]);
    const [isFormOpen, setIsFormOpen] = React.useState(false);

    const loadInventory = React.useCallback(() => {
        const allInventory = getInventory();
        setAlimentos(allInventory.filter(item => item.category === 'alimento'));
    }, []);
    
    React.useEffect(() => {
        loadInventory();
        const handleStorageChange = () => loadInventory();
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadInventory]);
    
    const handleAddSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData.get('name') as string;
        const stock = Number(formData.get('stock'));
        const id = (formData.get('id') as string).toUpperCase();

        if (!name || !stock || !id) {
            toast({ variant: 'destructive', title: 'Error', description: 'Todos los campos son requeridos.' });
            return;
        }

        const fullInventory = getInventory();
        if(fullInventory.some(item => item.id === id)) {
             toast({ variant: 'destructive', title: 'Error', description: 'El ID del producto ya existe.' });
             return;
        }

        const newItem: InventoryItem = { id, name, category: 'alimento', stock };
        const updatedInventory = [...fullInventory, newItem];
        updateInventory(updatedInventory);
        
        toast({ title: 'Producto Añadido', description: `${name} ha sido añadido al inventario.` });
        setIsFormOpen(false);
        loadInventory();
    }

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => router.push('/inventory')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">Inventario de Alimentos</h1>
                    </div>
                     <Button onClick={() => setIsFormOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir Nuevo Alimento
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Stock de Alimentos</CardTitle>
                        <CardDescription>Lista de concentrados y alimentos disponibles.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>ID</TableHead>
                                    <TableHead className="text-right">Stock (kg)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {alimentos.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{item.id}</TableCell>
                                        <TableCell className="text-right">{item.stock.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Añadir Nuevo Alimento</DialogTitle>
                            <DialogDescription>Complete los datos del nuevo producto.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddSubmit} id="add-item-form" className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="id">ID del Producto</Label>
                                <Input id="id" name="id" type="text" placeholder="Ej: FEED-08" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre del Producto</Label>
                                <Input id="name" name="name" type="text" placeholder="Ej: Alimento Lactancia Plus" required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="stock">Stock Inicial (kg)</Label>
                                <Input id="stock" name="stock" type="number" step="0.1" required />
                            </div>
                        </form>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                            <Button type="submit" form="add-item-form">Guardar Producto</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

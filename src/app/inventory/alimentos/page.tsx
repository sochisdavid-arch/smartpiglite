
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format, parseISO, isValid } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FoodPurchase {
    id: string;
    purchaseDate: string;
    productId: string;
    productName: string;
    bags: number;
    weightPerBag: number;
    totalWeight: number;
    totalValue: number;
    pricePerKg: number;
    batchNumber?: string;
    notes?: string;
}


export default function AlimentosPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [alimentos, setAlimentos] = React.useState<InventoryItem[]>([]);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [purchaseHistory, setPurchaseHistory] = React.useState<FoodPurchase[]>([]);

    // Form states
    const [bags, setBags] = React.useState<number | string>('');
    const [weightPerBag, setWeightPerBag] = React.useState<number | string>(40); // Default 40kg
    const [totalValue, setTotalValue] = React.useState<number | string>('');

    const totalWeight = React.useMemo(() => {
        const numBags = Number(bags);
        const numWeightPerBag = Number(weightPerBag);
        return numBags > 0 && numWeightPerBag > 0 ? numBags * numWeightPerBag : 0;
    }, [bags, weightPerBag]);

    const pricePerKg = React.useMemo(() => {
        const numTotalValue = Number(totalValue);
        return numTotalValue > 0 && totalWeight > 0 ? numTotalValue / totalWeight : 0;
    }, [totalValue, totalWeight]);

    const loadData = React.useCallback(() => {
        const allInventory = getInventory();
        setAlimentos(allInventory.filter(item => item.category === 'alimento'));
        
        const storedHistory = localStorage.getItem('foodPurchaseHistory');
        if (storedHistory) {
            setPurchaseHistory(JSON.parse(storedHistory));
        }

    }, []);
    
    React.useEffect(() => {
        loadData();
        const handleStorageChange = () => loadData();
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadData]);
    
    const handleAddSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const productId = formData.get('productId') as string;
        const productName = alimentos.find(a => a.id === productId)?.name || 'Alimento Desconocido';
        
        if (!productId || totalWeight <= 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Por favor, seleccione un alimento y complete los detalles de la compra.' });
            return;
        }

        // 1. Create the purchase record
        const newPurchase: FoodPurchase = {
            id: `purchase-${Date.now()}`,
            purchaseDate: formData.get('purchaseDate') as string,
            productId,
            productName,
            bags: Number(bags),
            weightPerBag: Number(weightPerBag),
            totalWeight: totalWeight,
            totalValue: Number(totalValue),
            pricePerKg: pricePerKg,
            batchNumber: formData.get('batchNumber') as string | undefined,
            notes: formData.get('notes') as string | undefined
        };

        // 2. Update purchase history
        const updatedHistory = [newPurchase, ...purchaseHistory];
        localStorage.setItem('foodPurchaseHistory', JSON.stringify(updatedHistory));
        setPurchaseHistory(updatedHistory);

        // 3. Update inventory stock
        const inventory = getInventory();
        const productIndex = inventory.findIndex(item => item.id === productId);

        if (productIndex !== -1) {
            inventory[productIndex].stock += totalWeight;
        } else {
            // This case is for adding a new food type, which we can handle if needed.
            // For now, we assume selection from existing foods.
        }
        updateInventory(inventory);
        
        toast({ title: 'Compra Registrada', description: `${totalWeight}kg de ${productName} han sido añadidos al stock.` });
        
        setIsFormOpen(false);
        // Reset form fields
        setBags('');
        setWeightPerBag(40);
        setTotalValue('');
        loadData();
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
                        Registrar Compra de Alimento
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Stock Actual de Alimentos</CardTitle>
                        <CardDescription>Lista de concentrados y alimentos disponibles en la granja.</CardDescription>
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

                 <Card>
                    <CardHeader>
                        <CardTitle>Historial de Compras de Alimentos</CardTitle>
                        <CardDescription>Registro de todas las entradas de alimento al inventario.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead className="text-right">Kilos Totales</TableHead>
                                    <TableHead className="text-right">Valor Total</TableHead>
                                    <TableHead className="text-right">Precio/kg</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchaseHistory.length > 0 ? purchaseHistory.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>{isValid(parseISO(item.purchaseDate)) ? format(parseISO(item.purchaseDate), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                        <TableCell className="font-medium">{item.productName}</TableCell>
                                        <TableCell className="text-right">{item.totalWeight.toFixed(2)} kg</TableCell>
                                        <TableCell className="text-right">${item.totalValue.toLocaleString('es-CO')}</TableCell>
                                        <TableCell className="text-right">${item.pricePerKg.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">No hay compras registradas.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                 <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogContent className="sm:max-w-lg flex flex-col max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>Registrar Compra de Alimento</DialogTitle>
                            <DialogDescription>Complete los datos de la compra. El stock se actualizará automáticamente.</DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="flex-1 -mx-6 px-6">
                            <form onSubmit={handleAddSubmit} id="add-item-form" className="space-y-4 py-4 pr-6">
                                <div className="grid grid-cols-2 gap-4">
                                   <div className="space-y-2">
                                        <Label htmlFor="purchaseDate">Fecha de Compra</Label>
                                        <Input id="purchaseDate" name="purchaseDate" type="date" required defaultValue={new Date().toISOString().substring(0, 10)}/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="productId">Nombre del Alimento</Label>
                                        <Select name="productId" required>
                                            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                            <SelectContent>
                                                {alimentos.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                 <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bags">Nº Bultos</Label>
                                        <Input id="bags" name="bags" type="number" required value={bags} onChange={e => setBags(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="weightPerBag">Kilos / Bulto</Label>
                                        <Input id="weightPerBag" name="weightPerBag" type="number" required value={weightPerBag} onChange={e => setWeightPerBag(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Kilos Totales</Label>
                                        <Input value={totalWeight.toFixed(2)} readOnly className="font-semibold bg-muted"/>
                                    </div>
                                </div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="totalValue">Valor Total Compra ($)</Label>
                                        <Input id="totalValue" name="totalValue" type="number" step="100" required value={totalValue} onChange={e => setTotalValue(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Precio / Kilo ($)</Label>
                                        <Input value={pricePerKg.toFixed(2)} readOnly className="font-semibold bg-muted"/>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="batchNumber">Número de Lote del Alimento</Label>
                                    <Input id="batchNumber" name="batchNumber" type="text" placeholder="Opcional" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Observaciones o Notas</Label>
                                    <Textarea id="notes" name="notes" placeholder="Cualquier detalle adicional de la compra..." />
                                </div>
                            </form>
                        </ScrollArea>
                        <DialogFooter className="flex-shrink-0 border-t pt-4 -mx-6 px-6 bg-background">
                            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                            <Button type="submit" form="add-item-form">Guardar Compra</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}


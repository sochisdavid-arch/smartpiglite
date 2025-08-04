
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { InventoryItem, getInventory, updateInventory } from '@/lib/inventory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO, isValid } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FoodPurchaseRecord {
    id: string;
    date: string;
    name: string;
    bags: number;
    kilosPerBag: number;
    totalKilos: number;
    totalValue: number;
    pricePerKg: number;
    batchNumber?: string;
    notes?: string;
}

const FOOD_PURCHASE_HISTORY_KEY = 'foodPurchaseHistory';

export default function AlimentosPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = React.useState(false);

    // Form states
    const [bags, setBags] = React.useState<number | string>('');
    const [kilosPerBag, setKilosPerBag] = React.useState<number | string>('');
    const [totalValue, setTotalValue] = React.useState<number | string>('');
    const [totalKilos, setTotalKilos] = React.useState(0);
    const [pricePerKg, setPricePerKg] = React.useState(0);
    const [purchaseHistory, setPurchaseHistory] = React.useState<FoodPurchaseRecord[]>([]);

    React.useEffect(() => {
        const history = localStorage.getItem(FOOD_PURCHASE_HISTORY_KEY);
        if(history) {
            setPurchaseHistory(JSON.parse(history));
        }
    }, []);

    React.useEffect(() => {
        const numBags = Number(bags);
        const numKilosPerBag = Number(kilosPerBag);
        const numTotalValue = Number(totalValue);

        const calculatedTotalKilos = numBags * numKilosPerBag;
        setTotalKilos(calculatedTotalKilos);

        if (calculatedTotalKilos > 0 && numTotalValue > 0) {
            setPricePerKg(numTotalValue / calculatedTotalKilos);
        } else {
            setPricePerKg(0);
        }
    }, [bags, kilosPerBag, totalValue]);

    const handleAddSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData.get('name') as string;
        const date = formData.get('date') as string;
        const batchNumber = formData.get('batchNumber') as string;
        const notes = formData.get('notes') as string;

        if (!name || !date || !bags || !kilosPerBag || !totalValue) {
            toast({ variant: 'destructive', title: 'Error', description: 'Por favor, complete todos los campos requeridos.' });
            return;
        }

        const inventory = getInventory();
        let product = inventory.find(item => item.name.toLowerCase() === name.toLowerCase() && item.category === 'alimento');

        if (product) {
            // Product exists, update stock
            product.stock += totalKilos;
        } else {
            // Product does not exist, create new
            const newProductId = `FOOD-${(inventory.filter(i => i.category === 'alimento').length + 1).toString().padStart(2, '0')}`;
            product = { id: newProductId, name, category: 'alimento', stock: totalKilos };
            inventory.push(product);
        }

        updateInventory(inventory);

        const newPurchase: FoodPurchaseRecord = {
            id: new Date().toISOString(),
            date,
            name,
            bags: Number(bags),
            kilosPerBag: Number(kilosPerBag),
            totalKilos,
            totalValue: Number(totalValue),
            pricePerKg,
            batchNumber,
            notes,
        };

        const updatedHistory = [newPurchase, ...purchaseHistory];
        setPurchaseHistory(updatedHistory);
        localStorage.setItem(FOOD_PURCHASE_HISTORY_KEY, JSON.stringify(updatedHistory));

        toast({ title: 'Ingreso Registrado', description: `${totalKilos}kg de ${name} han sido añadidos al stock.` });
        setIsFormOpen(false);
        (event.target as HTMLFormElement).reset();
        setBags('');
        setKilosPerBag('');
        setTotalValue('');
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
                        Registrar Ingreso de Alimento
                    </Button>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Historial de Ingresos de Alimento</CardTitle>
                        <CardDescription>Lista de todas las compras y ingresos de alimento registrados.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha Ingreso</TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Nº Bultos</TableHead>
                                    <TableHead>Kilos Totales</TableHead>
                                    <TableHead>Valor Total</TableHead>
                                    <TableHead>Precio/kg</TableHead>
                                    <TableHead>Lote</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchaseHistory.length > 0 ? purchaseHistory.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>{isValid(parseISO(item.date)) ? format(parseISO(item.date), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{item.bags}</TableCell>
                                        <TableCell>{item.totalKilos.toFixed(2)}</TableCell>
                                        <TableCell>${(item.totalValue || 0).toLocaleString('es-CO')}</TableCell>
                                        <TableCell>${(item.pricePerKg || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                        <TableCell>{item.batchNumber || 'N/A'}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24">No hay ingresos de alimento registrados.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                 <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogContent className="max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Registrar Ingreso de Alimento</DialogTitle>
                            <DialogDescription>Complete los datos para registrar una nueva compra o ingreso de alimento al inventario.</DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="flex-1 -mx-6 px-6">
                            <form onSubmit={handleAddSubmit} id="add-food-form" className="space-y-4 py-4 pr-6">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Fecha de Ingreso</Label>
                                    <Input id="date" name="date" type="date" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre del Alimento</Label>
                                    <Input id="name" name="name" type="text" placeholder="Ej: Precebo Fase 1" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bags">Número de Bultos</Label>
                                        <Input id="bags" name="bags" type="number" required value={bags} onChange={e => setBags(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="kilosPerBag">Kilos por Bulto</Label>
                                        <Input id="kilosPerBag" name="kilosPerBag" type="number" required value={kilosPerBag} onChange={e => setKilosPerBag(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Kilos Totales Calculados</Label>
                                    <Input value={totalKilos.toFixed(2)} readOnly className="font-semibold bg-muted" />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="totalValue">Valor Total Compra ($)</Label>
                                    <Input id="totalValue" name="totalValue" type="number" step="100" placeholder="Ej: 1500000" required value={totalValue} onChange={e => setTotalValue(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Precio / Kilo ($)</Label>
                                    <Input value={pricePerKg > 0 ? pricePerKg.toFixed(2) : '0.00'} readOnly className="font-semibold bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="batchNumber">Número de Lote del Alimento</Label>
                                    <Input id="batchNumber" name="batchNumber" type="text" placeholder="Opcional" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Observaciones / Notas</Label>
                                    <Textarea id="notes" name="notes" placeholder="Cualquier nota adicional sobre la compra o el producto." />
                                </div>
                            </form>
                        </ScrollArea>
                        <DialogFooter className="flex-shrink-0 border-t pt-4 bg-background -mx-6 px-6">
                            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                            <Button type="submit" form="add-food-form">Guardar Ingreso</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

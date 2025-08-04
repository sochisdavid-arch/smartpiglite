
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Boxes, Pill, Syringe } from 'lucide-react';
import { getInventory, InventoryItem } from '@/lib/inventory';

export default function InventoryPage() {
    const [inventory, setInventory] = React.useState<InventoryItem[]>([]);

    const loadInventory = React.useCallback(() => {
        setInventory(getInventory());
    }, []);
    
    React.useEffect(() => {
        loadInventory();
        
        // Listen for storage changes to update inventory in real-time
        const handleStorageChange = () => {
            loadInventory();
        };
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [loadInventory]);
    
    const alimentos = inventory.filter(item => item.category === 'alimento');
    const medicamentos = inventory.filter(item => item.category === 'medicamento');
    const vacunas = inventory.filter(item => item.category === 'vacuna');

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Inventario</h1>
                    <p className="text-muted-foreground">Vista en tiempo real del stock disponible en la granja.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Alimentos Card */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Boxes className="h-6 w-6 text-primary" />
                                <div>
                                    <CardTitle>Alimentos</CardTitle>
                                    <CardDescription>Stock de concentrados y alimentos.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead className="text-right">Stock (kg)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {alimentos.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-right">{item.stock.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Medicamentos y Vacunas Cards */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                             <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Pill className="h-6 w-6 text-red-500" />
                                    <div>
                                        <CardTitle>Medicamentos</CardTitle>
                                        <CardDescription>Stock de productos farmacéuticos.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                               <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Producto</TableHead>
                                            <TableHead className="text-right">Stock (ml/ud)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {medicamentos.map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell className="text-right">{item.stock.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Card>
                             <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Syringe className="h-6 w-6 text-green-500" />
                                    <div>
                                        <CardTitle>Vacunas</CardTitle>
                                        <CardDescription>Stock de productos biológicos.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Producto</TableHead>
                                            <TableHead className="text-right">Stock (dosis/ml)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {vacunas.map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell className="text-right">{item.stock.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

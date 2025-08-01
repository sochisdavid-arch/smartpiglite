
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Search, QrCode, Boxes, PackagePlus, ArrowRightLeft, Settings, FileSliders, Bell, Archive, FileText } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function InventoryPage() {
   
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Inventario</h1>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto"><Search className="mr-2 h-4 w-4" /> Búsqueda</Button>
                        <Button variant="outline" className="w-full sm:w-auto"><QrCode className="mr-2 h-4 w-4" /> Escanear</Button>
                    </div>
                </div>

                <Tabs defaultValue="stock" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-10">
                        <TabsTrigger value="stock">Stock Actual</TabsTrigger>
                        <TabsTrigger value="products">Productos</TabsTrigger>
                        <TabsTrigger value="entries">Entradas</TabsTrigger>
                        <TabsTrigger value="outputs">Salidas</TabsTrigger>
                        <TabsTrigger value="transfers">Transferencias</TabsTrigger>
                        <TabsTrigger value="adjustments">Ajustes</TabsTrigger>
                        <TabsTrigger value="alerts">Alertas</TabsTrigger>
                        <TabsTrigger value="config">Configuración</TabsTrigger>
                        <TabsTrigger value="kardex">Kardex</TabsTrigger>
                        <TabsTrigger value="reports">Reportes</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="stock" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Stock Actual</CardTitle>
                                <CardDescription>Vista general del inventario disponible.</CardDescription>
                            </CardHeader>
                            <CardContent>
                               <Alert><Boxes className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>La vista de stock actual estará disponible próximamente.</AlertDescription></Alert>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="products" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Registro de Productos</CardTitle>
                                <CardDescription>Añada o edite los productos de su inventario.</CardDescription>
                            </CardHeader>
                            <CardContent>
                               <Alert><PackagePlus className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El registro de productos estará disponible próximamente.</AlertDescription></Alert>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="entries" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Entradas de Inventario</CardTitle>
                                <CardDescription>Registre la compra o ingreso de nuevos productos.</CardDescription>
                            </CardHeader>
                             <CardContent><Alert><FileSliders className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El registro de entradas estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="outputs" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Salidas de Inventario</CardTitle>
                                <CardDescription>Registre el consumo o baja de productos.</CardDescription>
                            </CardHeader>
                            <CardContent><Alert><FileSliders className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El registro de salidas estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="transfers" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Transferencias Internas</CardTitle>
                                <CardDescription>Mueva productos entre diferentes almacenes o salas.</CardDescription>
                            </CardHeader>
                            <CardContent><Alert><ArrowRightLeft className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El registro de transferencias estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="adjustments" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ajustes de Inventario</CardTitle>
                                <CardDescription>Corrija descuadres en el stock.</CardDescription>
                            </CardHeader>
                            <CardContent><Alert><FileSliders className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El registro de ajustes estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="alerts" className="mt-6">
                         <Card>
                            <CardHeader>
                                <CardTitle>Alertas de Inventario</CardTitle>
                                <CardDescription>Revise notificaciones sobre stock mínimo y vencimientos.</CardDescription>
                            </CardHeader>
                            <CardContent><Alert><Bell className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>Las alertas de inventario estarán disponibles próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="config" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuración Avanzada</CardTitle>
                                <CardDescription>Configure parámetros como stock mínimo y ubicaciones.</CardDescription>
                            </CardHeader>
                            <CardContent><Alert><Settings className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>La configuración avanzada estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="kardex" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Kardex de Producto</CardTitle>
                                <CardDescription>Vea todos los movimientos de un producto específico.</CardDescription>
                            </CardHeader>
                            <CardContent><Alert><Archive className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El kardex de producto estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Reportes de Inventario</CardTitle>
                                <CardDescription>Genere reportes de consumo, valoración y rotación.</CardDescription>
                            </CardHeader>
                            <CardContent><Alert><FileText className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>La generación de reportes detallados estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>
            </div>
        </AppLayout>
    );
}

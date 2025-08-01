
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Filter, Search, QrCode, Stethoscope, BookOpen, LogIn, Settings, TrendingUp, Wheat, XCircle, Thermometer, LogOut as LogOutIcon, Scaling, AreaChart, DollarSign, Beef, Droplets } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function CebaPage() {
   
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Ceba / Engorde</h1>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto"><Search className="mr-2 h-4 w-4" /> Búsqueda</Button>
                        <Button variant="outline" className="w-full sm:w-auto"><Filter className="mr-2 h-4 w-4" /> Filtros</Button>
                    </div>
                </div>

                <Tabs defaultValue="entry" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12">
                        <TabsTrigger value="entry">Ingreso</TabsTrigger>
                        <TabsTrigger value="config">Configuración</TabsTrigger>
                        <TabsTrigger value="growth">Crecimiento</TabsTrigger>
                        <TabsTrigger value="feeding">Alimentación</TabsTrigger>
                        <TabsTrigger value="health">Sanidad</TabsTrigger>
                        <TabsTrigger value="mortality">Mortalidad</TabsTrigger>
                        <TabsTrigger value="environment">Ambiente</TabsTrigger>
                        <TabsTrigger value="exit">Salida</TabsTrigger>
                        <TabsTrigger value="slaughter">Sacrificio</TabsTrigger>
                        <TabsTrigger value="kpi">Indicadores</TabsTrigger>
                        <TabsTrigger value="economic">Análisis Económico</TabsTrigger>
                        <TabsTrigger value="reports">Reportes</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="entry" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ingreso de Lote a Ceba</CardTitle>
                                <CardDescription>Registre la entrada de un nuevo lote a la fase de engorde.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="entryDate">Fecha de Ingreso</Label>
                                            <Input id="entryDate" name="entryDate" type="date" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="batchCode">Lote / Grupo</Label>
                                            <Input id="batchCode" placeholder="Ej. LOTE-CEBA-24-01" required />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="origin">Procedencia</Label>
                                            <Input id="origin" placeholder="Ej. Precebo Sala 2" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="animalCount">Número de Animales</Label>
                                            <Input id="animalCount" type="number" placeholder="Ej. 120" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="avgAge">Edad Promedio (días)</Label>
                                            <Input id="avgAge" type="number" placeholder="Ej. 70" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="avgWeight">Peso Promedio (kg)</Label>
                                            <Input id="avgWeight" type="number" step="0.1" placeholder="Ej. 30.5" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="genetics">Genética / Línea</Label>
                                            <Input id="genetics" placeholder="Ej. PIC 337" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="assignedPen">Sala / Corral Asignado</Label>
                                            <Input id="assignedPen" placeholder="Ej. Ceba 3, Corral C1-C4" required />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full sm:w-auto"><LogIn className="mr-2 h-4 w-4" /> Registrar Ingreso</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="config" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Configuración del Lote de Ceba</CardTitle></CardHeader>
                            <CardContent><Alert><Settings className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>La configuración detallada del lote estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="growth" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Seguimiento del Crecimiento</CardTitle></CardHeader>
                            <CardContent><Alert><TrendingUp className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El registro de pesajes y las curvas de crecimiento estarán disponibles próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="feeding" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Alimentación y Conversión</CardTitle></CardHeader>
                            <CardContent><Alert><Wheat className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El registro de consumo y el cálculo de conversión alimenticia estarán disponibles próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="health" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Sanidad y Tratamientos</CardTitle></CardHeader>
                            <CardContent><Alert><Stethoscope className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El registro de tratamientos y diagnósticos estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="mortality" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Registro de Mortalidad</CardTitle></CardHeader>
                            <CardContent><Alert><XCircle className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El registro de bajas y sus causas estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="environment" className="mt-6">
                         <Card>
                            <CardHeader><CardTitle>Condiciones Ambientales</CardTitle></CardHeader>
                            <CardContent><Alert><Thermometer className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El registro de las condiciones ambientales estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="exit" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Salida a Matadero o Transferencia</CardTitle></CardHeader>
                            <CardContent><Alert><LogOutIcon className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El registro de la salida de lotes estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="slaughter" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Resultados de Sacrificio</CardTitle></CardHeader>
                            <CardContent><Alert><Scaling className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El registro de datos de matadero estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="kpi" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Indicadores de Desempeño Técnico</CardTitle></CardHeader>
                            <CardContent><Alert><AreaChart className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>Los KPIs y métricas de rendimiento estarán disponibles próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="economic" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Análisis Económico del Lote</CardTitle></CardHeader>
                            <CardContent><Alert><DollarSign className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El análisis de rentabilidad y costos estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Reportes de Engorde / Ceba</CardTitle></CardHeader>
                            <CardContent><Alert><Download className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>La generación de reportes detallados estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>
            </div>
        </AppLayout>
    );
}

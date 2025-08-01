
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Filter, Search, QrCode, PlusCircle, MoreHorizontal, Printer, Syringe, X, Bell, Stethoscope, BookOpen, GanttChartSquare, Thermometer, Droplets } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function PreceboPage() {
    const { toast } = useToast();
   
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Precebo</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline"><Search className="mr-2 h-4 w-4" /> Búsqueda Avanzada</Button>
                        <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filtros</Button>
                        <Button variant="outline"><QrCode className="mr-2 h-4 w-4" /> Escanear QR</Button>
                    </div>
                </div>

                <Tabs defaultValue="entry" className="w-full">
                    <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11">
                        <TabsTrigger value="entry">Ingreso</TabsTrigger>
                        <TabsTrigger value="batch_config">Config. Lote</TabsTrigger>
                        <TabsTrigger value="health_monitoring">Sanidad</TabsTrigger>
                        <TabsTrigger value="mortality">Mortalidad</TabsTrigger>
                        <TabsTrigger value="feeding">Alimentación</TabsTrigger>
                        <TabsTrigger value="weighing">Pesajes</TabsTrigger>
                        <TabsTrigger value="environment">Ambiente</TabsTrigger>
                        <TabsTrigger value="alerts">Alertas</TabsTrigger>
                        <TabsTrigger value="exit">Egreso</TabsTrigger>
                        <TabsTrigger value="history">Historial</TabsTrigger>
                        <TabsTrigger value="reports">Reportes</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="entry" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ingreso de Lechones a Precebo</CardTitle>
                                <CardDescription>Registre la entrada de un nuevo lote de lechones.</CardDescription>
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
                                            <Input id="batchCode" placeholder="Ej. LOTE-24-08A" required />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="origin">Procedencia</Label>
                                            <Input id="origin" placeholder="Ej. Sala Maternidad 3" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="assignedRoom">Sala / Corral Asignado</Label>
                                            <Input id="assignedRoom" placeholder="Ej. Precebo 1, Corral A1" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="totalPiglets">Número de Lechones</Label>
                                            <Input id="totalPiglets" type="number" placeholder="Ej. 150" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="avgAge">Edad Promedio (días)</Label>
                                            <Input id="avgAge" type="number" placeholder="Ej. 21" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="avgWeight">Peso Promedio (kg)</Label>
                                            <Input id="avgWeight" type="number" step="0.1" placeholder="Ej. 6.5" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="responsible">Responsable</Label>
                                            <Input id="responsible" placeholder="Nombre del operario" />
                                        </div>
                                    </div>
                                    <Button type="submit">Registrar Ingreso</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="batch_config" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuración del Lote</CardTitle>
                                <CardDescription>Detalles sobre la configuración y densidad del lote.</CardDescription>
                            </CardHeader>
                             <CardContent><Alert><GanttChartSquare className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>La configuración del lote estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="health_monitoring" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Seguimiento Sanitario</CardTitle>
                                <CardDescription>Registre tratamientos, vacunas y observaciones de salud del lote.</CardDescription>
                            </CardHeader>
                            <CardContent><Alert><Stethoscope className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El seguimiento sanitario estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="mortality" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Registro de Mortalidades y Bajas</CardTitle>
                                <CardDescription>Registre las bajas del lote y sus causas probables.</CardDescription>
                            </CardHeader>
                            <CardContent><Alert><X className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El registro de mortalidad estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="feeding" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manejo y Alimentación</CardTitle>
                                <CardDescription>Controle el plan de alimentación y el consumo del lote.</CardDescription>
                            </CardHeader>
                            <CardContent><Alert><Stethoscope className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>La gestión de alimentación estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="weighing" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pesajes y Seguimiento de Crecimiento</CardTitle>
                                <CardDescription>Registre los pesajes del lote para monitorear el crecimiento.</CardDescription>
                            </CardHeader>
                            <CardContent><Alert><Stethoscope className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El registro de pesajes estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="environment" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manejo Ambiental</CardTitle>
                                <CardDescription>Registre las condiciones ambientales de la sala o corral.</CardDescription>
                            </CardHeader>
                             <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
                                            <Thermometer className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">28°C</div>
                                            <p className="text-xs text-muted-foreground">Rango óptimo: 28-32°C</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Humedad</CardTitle>
                                            <Droplets className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">65%</div>
                                            <p className="text-xs text-muted-foreground">Rango óptimo: 60-70%</p>
                                        </CardContent>
                                    </Card>
                                </div>
                                <Alert><Stethoscope className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El registro de condiciones ambientales estará disponible próximamente.</AlertDescription></Alert>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="alerts" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Alertas y Programación</CardTitle>
                                <CardDescription>Revise las alertas y eventos programados para este lote.</CardDescription>
                            </CardHeader>
                            <CardContent><Alert><Bell className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>Las alertas personalizadas estarán disponibles próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="exit" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Egreso del Lote</CardTitle>
                                <CardDescription>Registre la salida del lote del área de precebo.</CardDescription>
                            </CardHeader>
                            <CardContent><Alert><GanttChartSquare className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El egreso de lotes estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Historial de Desempeño por Lote</CardTitle>
                                <CardDescription>Consulte los datos históricos y el rendimiento de lotes anteriores.</CardDescription>
                            </CardHeader>
                            <CardContent><Alert><BookOpen className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El historial de lotes estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Reportes del Precebo</CardTitle>
                                <CardDescription>Genere y exporte reportes de rendimiento del área de precebo.</CardDescription>
                            </CardHeader>
                            <CardContent><Alert><Download className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>Los reportes de precebo estarán disponibles próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>
            </div>
        </AppLayout>
    );
}

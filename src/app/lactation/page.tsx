
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
import { Download, Filter, Search, QrCode, PlusCircle, MoreHorizontal, Printer, Syringe, X, Bell, Stethoscope, BookOpen } from 'lucide-react';
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

// TODO: Define interfaces for lactation data
interface SowAssignment {
    id: string;
    sowId: string;
    entryDate: string;
    parityNumber: number;
    room: string;
    bodyCondition: number;
    observations: string;
}

export default function LactationPage() {
    const { toast } = useToast();
    // TODO: Initialize states for lactation data
    const [assignments, setAssignments] = React.useState<SowAssignment[]>([]);
    
    // Placeholder for sow options
    const sowOptions = [
        { id: 'PIG-001', breed: 'Duroc' },
        { id: 'PIG-002', breed: 'Yorkshire' },
        { id: 'PIG-003', breed: 'Landrace' },
    ];

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Lactancia</h1>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto"><Search className="mr-2 h-4 w-4" /> Búsqueda</Button>
                        <Button variant="outline" className="w-full sm:w-auto"><Filter className="mr-2 h-4 w-4" /> Filtros</Button>
                    </div>
                </div>

                <Tabs defaultValue="assignment" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10">
                        <TabsTrigger value="assignment">Asignación</TabsTrigger>
                        <TabsTrigger value="farrowing">Parto</TabsTrigger>
                        <TabsTrigger value="litter">Camada</TabsTrigger>
                        <TabsTrigger value="sow_feeding">Alim. Cerda</TabsTrigger>
                        <TabsTrigger value="treatments">Tratamientos</TabsTrigger>
                        <TabsTrigger value="piglet_management">Manejo Lechones</TabsTrigger>
                        <TabsTrigger value="weaning">Destete</TabsTrigger>
                        <TabsTrigger value="alerts">Alertas</TabsTrigger>
                        <TabsTrigger value="history">Historial</TabsTrigger>
                        <TabsTrigger value="reports">Reportes</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="assignment" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Asignación de Cerdas a Maternidad</CardTitle>
                                <CardDescription>Registre el ingreso de una cerda a la sala de maternidad.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="sowId">Cerda (ID, tatuaje, QR)</Label>
                                            <Select name="sowId" required>
                                                <SelectTrigger><SelectValue placeholder="Seleccionar cerda" /></SelectTrigger>
                                                <SelectContent>
                                                    {sowOptions.map(sow => <SelectItem key={sow.id} value={sow.id}>{sow.id} - {sow.breed}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="entryDate">Fecha de Ingreso</Label>
                                            <Input id="entryDate" name="entryDate" type="date" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="parityNumber">Número de Parto</Label>
                                            <Input id="parityNumber" name="parityNumber" type="number" placeholder="Ej. 3" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="room">Sala / Corral Asignado</Label>
                                            <Input id="room" name="room" placeholder="Ej. Maternidad 1, Corral 5" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bodyCondition">Estado Corporal (1-5)</Label>
                                            <Input id="bodyCondition" name="bodyCondition" type="number" step="0.5" min="1" max="5" placeholder="Ej. 3.5" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pre-farrow-obs">Observaciones Previas al Parto</Label>
                                        <Textarea id="pre-farrow-obs" name="observations" placeholder="Cualquier observación relevante..."/>
                                    </div>
                                    <Button type="submit" className="w-full sm:w-auto">Registrar Asignación</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="farrowing" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Registro del Parto</CardTitle></CardHeader>
                            <CardContent><Alert><Stethoscope className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El registro detallado de partos estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="litter" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Control de la Camada</CardTitle></CardHeader>
                            <CardContent><Alert><Stethoscope className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El control de camadas estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="sow_feeding" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Alimentación de la Cerda</CardTitle></CardHeader>
                            <CardContent><Alert><Stethoscope className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El plan de alimentación para la cerda lactante estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="treatments" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Tratamientos y Salud</CardTitle></CardHeader>
                            <CardContent><Alert><Stethoscope className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El registro de tratamientos durante la lactancia estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="piglet_management" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Manejo de los Lechones</CardTitle></CardHeader>
                            <CardContent><Alert><Stethoscope className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El registro del manejo de lechones estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="weaning" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Destete</CardTitle></CardHeader>
                            <CardContent><Alert><Stethoscope className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El registro del destete estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="alerts" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Alertas y Programación</CardTitle></CardHeader>
                            <CardContent><Alert><Bell className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>Las alertas personalizadas para lactancia estarán disponibles próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Historial de Lactancia por Cerda</CardTitle></CardHeader>
                            <CardContent><Alert><BookOpen className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El historial de lactancia estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Reportes de Lactancia</CardTitle></CardHeader>
                            <CardContent><Alert><Download className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>Los reportes de lactancia estarán disponibles próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>
            </div>
        </AppLayout>
    );
}

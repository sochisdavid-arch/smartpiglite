
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Search, QrCode, UserPlus, ShieldCheck, CalendarClock, ListTodo, Award, BarChart, Banknote, GraduationCap, Bell, FileText, Upload } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PersonnelPage() {
   
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Personal</h1>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto"><Search className="mr-2 h-4 w-4" /> Buscar</Button>
                        <Button variant="outline" className="w-full sm:w-auto"><UserPlus className="mr-2 h-4 w-4" /> Añadir</Button>
                    </div>
                </div>

                <Tabs defaultValue="registration" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-10">
                        <TabsTrigger value="registration">Registro</TabsTrigger>
                        <TabsTrigger value="roles">Roles</TabsTrigger>
                        <TabsTrigger value="attendance">Asistencia</TabsTrigger>
                        <TabsTrigger value="tasks">Tareas</TabsTrigger>
                        <TabsTrigger value="performance">Desempeño</TabsTrigger>
                        <TabsTrigger value="productivity">Productividad</TabsTrigger>
                        <TabsTrigger value="costs">Costos</TabsTrigger>
                        <TabsTrigger value="training">Capacitaciones</TabsTrigger>
                        <TabsTrigger value="alerts">Alertas</TabsTrigger>
                        <TabsTrigger value="reports">Reportes</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="registration" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Registro de Empleados</CardTitle>
                                <CardDescription>Añada y gestione la información de su personal.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">Nombre Completo</Label>
                                            <Input id="fullName" placeholder="Ej. Juan Pérez" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="position">Cargo / Función</Label>
                                            <Input id="position" placeholder="Ej. Operario de Ceba" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="idNumber">Identificación / Cédula</Label>
                                            <Input id="idNumber" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="entryDate">Fecha de Ingreso</Label>
                                            <Input id="entryDate" type="date" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="assignedArea">Área Asignada</Label>
                                            <Select name="assignedArea">
                                                <SelectTrigger><SelectValue placeholder="Seleccionar área..."/></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="gestation">Gestación</SelectItem>
                                                    <SelectItem value="maternity">Maternidad</SelectItem>
                                                    <SelectItem value="precebo">Precebo</SelectItem>
                                                    <SelectItem value="ceba">Ceba</SelectItem>
                                                    <SelectItem value="bodega">Bodega</SelectItem>
                                                    <SelectItem value="lab">Laboratorio</SelectItem>
                                                    <SelectItem value="admin">Oficina</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Teléfono</Label>
                                            <Input id="phone" type="tel" placeholder="Ej. 3001234567" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Correo Electrónico</Label>
                                            <Input id="email" type="email" placeholder="ejemplo@correo.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="photo">Foto de Perfil</Label>
                                            <Input id="photo" type="file" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                         <Button type="submit" className="w-full sm:w-auto"><UserPlus className="mr-2 h-4 w-4" /> Guardar Empleado</Button>
                                         <Button variant="outline" className="w-full sm:w-auto"><QrCode className="mr-2 h-4 w-4" /> Generar QR</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="roles" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Gestión de Roles y Permisos</CardTitle></CardHeader>
                            <CardContent><Alert><ShieldCheck className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>La asignación de roles y permisos estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="attendance" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Asistencia y Turnos</CardTitle></CardHeader>
                            <CardContent><Alert><CalendarClock className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El calendario de turnos y el registro de asistencia estarán disponibles próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="tasks" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Asignación de Tareas</CardTitle></CardHeader>
                            <CardContent><Alert><ListTodo className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>La creación y asignación de tareas estarán disponibles próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="performance" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Evaluación de Desempeño</CardTitle></CardHeader>
                            <CardContent><Alert><Award className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>Las evaluaciones de desempeño estarán disponibles próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="productivity" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Seguimiento de Productividad</CardTitle></CardHeader>
                            <CardContent><Alert><BarChart className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>Los gráficos e informes de productividad estarán disponibles próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="costs" className="mt-6">
                         <Card>
                            <CardHeader><CardTitle>Costos Laborales</CardTitle></CardHeader>
                            <CardContent><Alert><Banknote className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El análisis de costos laborales estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="training" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Registro de Capacitaciones</CardTitle></CardHeader>
                            <CardContent><Alert><GraduationCap className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El historial de capacitaciones estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="alerts" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Alertas de Personal</CardTitle></CardHeader>
                            <CardContent><Alert><Bell className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>Las alertas automáticas para el personal estarán disponibles próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Reportes de Personal</CardTitle></CardHeader>
                            <CardContent><Alert><FileText className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>La generación de reportes de personal estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>
            </div>
        </AppLayout>
    );
}

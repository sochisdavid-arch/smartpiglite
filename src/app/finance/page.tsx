
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Search, DollarSign, TrendingUp, TrendingDown, Landmark, FileText, Settings, Wallet, CreditCard, BarChart2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FinancePage() {
   
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Gestión Financiera</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline"><Search className="mr-2 h-4 w-4" /> Búsqueda Avanzada</Button>
                        <Button variant="default"><Download className="mr-2 h-4 w-4" /> Exportar Resumen</Button>
                    </div>
                </div>

                <Tabs defaultValue="dashboard" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-10">
                        <TabsTrigger value="dashboard">Resumen</TabsTrigger>
                        <TabsTrigger value="income">Ingresos</TabsTrigger>
                        <TabsTrigger value="expenses">Egresos</TabsTrigger>
                        <TabsTrigger value="costs">Costos</TabsTrigger>
                        <TabsTrigger value="profitability">Rentabilidad</TabsTrigger>
                        <TabsTrigger value="accounts">Cuentas</TabsTrigger>
                        <TabsTrigger value="cashflow">Flujo de Caja</TabsTrigger>
                        <TabsTrigger value="budget">Presupuesto</TabsTrigger>
                        <TabsTrigger value="reports">Reportes</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="dashboard" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Resumen Financiero General</CardTitle>
                                <CardDescription>Vista general de la salud financiera de la granja.</CardDescription>
                            </CardHeader>
                            <CardContent>
                               <Alert><Landmark className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El dashboard financiero con gráficos y KPIs estará disponible próximamente.</AlertDescription></Alert>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="income" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Registro de Ingresos</CardTitle>
                                <CardDescription>Añada cualquier ingreso monetario a la granja.</CardDescription>
                            </Header>
                            <CardContent>
                               <Alert><TrendingUp className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El registro de ingresos estará disponible próximamente.</AlertDescription></Alert>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="expenses" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Registro de Egresos</CardTitle>
                                <CardDescription>Registre todos los gastos y costos operativos.</CardDescription>
                            </CardHeader>
                             <CardContent><Alert><TrendingDown className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El registro de egresos estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="costs" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Costos por Fase Productiva</CardTitle>
                                <CardDescription>Analice los costos detallados de cada etapa.</CardDescription>
                            </CardHeader>
                            <CardContent><Alert><DollarSign className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El análisis de costos por fase estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="profitability" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Análisis de Rentabilidad</CardTitle>
                                <CardDescription>Mida la rentabilidad por lote, animal o periodo.</CardDescription>
                            </CardHeader>
                            <CardContent><Alert><BarChart2 className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El análisis de rentabilidad estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="accounts" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cuentas por Pagar y Cobrar</CardTitle>
                                <CardDescription>Gestione sus deudas y saldos pendientes.</CardDescription>
                            </CardHeader>
                            <CardContent><Alert><CreditCard className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>La gestión de cuentas por pagar y cobrar estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="cashflow" className="mt-6">
                         <Card>
                            <CardHeader>
                                <CardTitle>Control de Flujo de Caja</CardTitle>
                                <CardDescription>Monitoree los movimientos de efectivo.</CardDescription>
                            </CardHeader>
                            <CardContent><Alert><Wallet className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>El control de flujo de caja estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="budget" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuración de Presupuestos</CardTitle>
                                <CardDescription>Establezca y controle sus presupuestos.</CardDescription>
                            </CardHeader>
                            <CardContent><Alert><Settings className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>La configuración de presupuestos estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Reportes Financieros</CardTitle>
                                <CardDescription>Genere informes detallados del estado financiero.</CardDescription>
                            </CardHeader>
                            <CardContent><Alert><FileText className="h-4 w-4" /><AlertTitle>Funcionalidad en desarrollo</AlertTitle><AlertDescription>La generación de reportes financieros estará disponible próximamente.</AlertDescription></Alert></CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>
            </div>
        </AppLayout>
    );
}

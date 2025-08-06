"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Filter, CalendarIcon, MoreHorizontal, SlidersHorizontal, BarChart2, Checkbox, Circle } from 'lucide-react';
import { format, parseISO, isValid, differenceInDays, startOfDay, endOfDay, sub, eachMonthOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Checkbox as CheckboxUI } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const pigBreeds = [
  "Duroc", "Yorkshire", "Landrace", "Hampshire", "Pietrain", "Berkshire", "Chester White", "Spotted", "Poland China", "Tamworth", "Large Black", "Cerdo Ibérico",
  "PIC", "Topigs Norsvin", "Hypor (Hendrix Genetics)", "DanBred", "Genus", "Choice Genetics", "Genesus",
  "Otro"
];

const mockData = {
    totalFarrowings: 238,
    totalLiveBorn: 2883,
    avgTotalBorn: 12.37,
    avgLiveBorn: 12.10,
    birthLossPercent: 2.17,
    avgStillborn: 1.08,
    avgMummified: 0.27,
    avgBirthWeight: 1.34
};

const mockMonthlyData = [
  { name: '03/2024', partos: 16, nacidosTotales: 12.06, nacidosVivos: 11.8, momificados: 1.08, nacidosMuertos: 0.9, pesoMedio: 1.35 },
  { name: '04/2024', partos: 15, nacidosTotales: 11.9, nacidosVivos: 11.7, momificados: 1.23, nacidosMuertos: 0.8, pesoMedio: 1.37 },
  { name: '05/2024', partos: 19, nacidosTotales: 12.7, nacidosVivos: 12.5, momificados: 1.0, nacidosMuertos: 1.1, pesoMedio: 1.41 },
  { name: '06/2024', partos: 15, nacidosTotales: 11.94, nacidosVivos: 11.8, momificados: 1.12, nacidosMuertos: 0.9, pesoMedio: 1.39 },
  { name: '07/2024', partos: 17, nacidosTotales: 12.3, nacidosVivos: 12.1, momificados: 1.1, nacidosMuertos: 1.0, pesoMedio: 1.37 },
  { name: '08/2024', partos: 14, nacidosTotales: 12.71, nacidosVivos: 12.6, momificados: 0.9, nacidosMuertos: 0.8, pesoMedio: 1.38 },
  { name: '09/2024', partos: 18, nacidosTotales: 12.64, nacidosVivos: 12.5, momificados: 1.15, nacidosMuertos: 0.9, pesoMedio: 1.36 },
  { name: '10/2024', partos: 20, nacidosTotales: 12.85, nacidosVivos: 12.7, momificados: 0.95, nacidosMuertos: 0.8, pesoMedio: 1.44 },
  { name: '11/2024', partos: 19, nacidosTotales: 16.56, nacidosVivos: 16.4, momificados: 0.8, nacidosMuertos: 0.7, pesoMedio: 1.37 },
  { name: '12/2024', partos: 13, nacidosTotales: 8.53, nacidosVivos: 8.4, momificados: 1.5, nacidosMuertos: 1.2, pesoMedio: 1.31 },
  { name: '01/2025', partos: 15, nacidosTotales: 12.43, nacidosVivos: 12.2, momificados: 1.0, nacidosMuertos: 0.9, pesoMedio: 1.40 },
  { name: '02/2025', partos: 14, nacidosTotales: 12.3, nacidosVivos: 12.1, momificados: 1.2, nacidosMuertos: 1.0, pesoMedio: 1.38 },
];

const mockHeatmapData = [
    [0.00, 0.00, 0.42, 0.00, 0.00, 0.00, 0.00, 0.42],
    [2.52, 5.46, 0.42, 0.42, 0.42, 1.26, 2.10, 12.61],
    [8.82, 7.14, 1.68, 0.84, 0.00, 1.68, 3.36, 24.07],
    [11.76, 7.14, 5.04, 0.42, 2.10, 4.62, 8.82, 39.90],
    [4.62, 6.72, 3.36, 1.26, 2.68, 1.68, 3.36, 22.65],
    [28.57, 26.47, 10.92, 2.94, 5.20, 9.24, 17.65, 100]
];

const mockDistributionData = {
    gestationDays: [{ name: '< 113', value: 8.82 }, { name: '114-115', value: 68.87 }, { name: '116-117', value: 21.43 }, { name: '> 117', value: 1.88 }],
    cycle: [{ name: '< 1', value: 16.38 }, { name: '2-3', value: 14.71 }, { name: '3-6', value: 58.82 }, { name: '> 6', value: 10.09 }],
    duration: [{ name: '< 2h', value: 0.42 }, { name: '2-3h', value: 8.82 }, { name: '3-5h', value: 29.58 }, { name: '5-7h', value: 23.95 }, { name: '> 7h', value: 11.22 }],
};

const KpiCard = ({ title, value, subValue, isGood, isBad }: { title: string, value: string | number, subValue?: string, isGood?: boolean, isBad?: boolean }) => (
    <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{value}</span>
                {isGood !== undefined && <Circle className={`h-3 w-3 ${isGood ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'}`} />}
            </div>
            {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
        </CardContent>
    </Card>
);

export default function BirthAnalysisPage() {
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <h1 className="text-3xl font-bold tracking-tight">Análisis de nacimientos</h1>
                <Card>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="start-date">Fecha inicial</Label>
                                <div className="relative">
                                    <Input id="start-date" type="date" defaultValue="2024-05-01" className="pr-8"/>
                                    <CalendarIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end-date">Fecha final</Label>
                                 <div className="relative">
                                    <Input id="end-date" type="date" defaultValue="2025-05-31" className="pr-8"/>
                                    <CalendarIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="breed-filter">Buscar por raza</Label>
                                <Select defaultValue="all">
                                    <SelectTrigger id="breed-filter"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las razas</SelectItem>
                                        {pigBreeds.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Ciclo entre</Label>
                                <div className="flex items-center gap-2">
                                    <Input type="number" placeholder="1" defaultValue="1" />
                                    <span>a</span>
                                    <Input type="number" placeholder="20" defaultValue="20" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon"><SlidersHorizontal className="h-4 w-4"/></Button>
                                <Button className="w-full">Filtrar</Button>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <KpiCard title="TOTAL DE PARTOS" value={mockData.totalFarrowings} subValue={`Nacidos Vivos: ${mockData.totalLiveBorn}`} />
                    <KpiCard title="NACIDOS TOTALES" value={mockData.avgTotalBorn.toFixed(2)} subValue="Meta: 14,43" isBad={true}/>
                    <KpiCard title="% PÉRDIDAS DE NACIMIENTO" value={`${mockData.birthLossPercent.toFixed(2)}%`} subValue="Meta: 1,80" isGood={true}/>
                    <KpiCard title="NACIDOS VIVOS" value={mockData.avgLiveBorn.toFixed(2)} subValue="Meta: 14,00" isBad={true}/>
                    <KpiCard title="PESO MEDIO (KG)" value={mockData.avgBirthWeight.toFixed(2)} subValue="Meta: 1,38" isGood={true}/>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Comparación de los Principales Índices</CardTitle>
                            <div className="flex items-center gap-1 border p-1 rounded-md">
                                <Button variant="ghost" size="sm">Semana</Button>
                                <Button variant="secondary" size="sm">Mes</Button>
                                <Button variant="ghost" size="sm">Trimestre</Button>
                                <Button variant="ghost" size="sm">Año</Button>
                                <Button variant="ghost" size="sm">Grupo</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div>
                            <div className="flex gap-4 items-center mb-2">
                                <CheckboxUI id="partos-total" defaultChecked/>
                                <Label htmlFor="partos-total" className="text-sm">Total de partos</Label>
                                <CheckboxUI id="partos-vivos"/>
                                <Label htmlFor="partos-vivos" className="text-sm text-muted-foreground">Nacidos</Label>
                            </div>
                             <ResponsiveContainer width="100%" height={150}>
                                <BarChart data={mockMonthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={10} tickLine={false} axisLine={false} allowDecimals={false}/>
                                    <Tooltip />
                                    <Bar dataKey="partos" name="Total de Partos" fill="hsl(var(--chart-5))" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                            <div className="flex gap-4 items-center mb-2">
                                <CheckboxUI id="nac-total" defaultChecked/>
                                <Label htmlFor="nac-total" className="text-sm">Media de nacidos totales</Label>
                                <CheckboxUI id="nac-vivos" defaultChecked/>
                                <Label htmlFor="nac-vivos" className="text-sm text-muted-foreground">Media de nacidos vivos</Label>
                            </div>
                            <ResponsiveContainer width="100%" height={150}>
                                <BarChart data={mockMonthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={10} tickLine={false} axisLine={false} domain={[0, 20]}/>
                                    <Tooltip formatter={(v, n) => [`${Number(v).toFixed(2)}`, n === 'nacidosTotales' ? 'Nacidos Totales' : 'Nacidos Vivos']}/>
                                    <Bar dataKey="nacidosTotales" fill="hsl(var(--chart-2))" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                         <div>
                            <div className="flex gap-4 items-center mb-2">
                                <CheckboxUI id="p-momif" defaultChecked/>
                                <Label htmlFor="p-momif" className="text-sm">% Momificados</Label>
                                <CheckboxUI id="p-muertos" defaultChecked/>
                                <Label htmlFor="p-muertos" className="text-sm text-muted-foreground">% Nacidos muertos</Label>
                            </div>
                            <ResponsiveContainer width="100%" height={150}>
                                <BarChart data={mockMonthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={10} tickLine={false} axisLine={false} unit="%" domain={[0, 4]}/>
                                    <Tooltip formatter={(v) => `${Number(v).toFixed(2)}%`}/>
                                    <Bar dataKey="momificados" name="% Momificados" stackId="a" fill="hsl(var(--chart-3))" />
                                    <Bar dataKey="nacidosMuertos" name="% Nacidos Muertos" stackId="a" fill="hsl(var(--chart-4))" radius={[4,4,0,0]}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                            <RadioGroup defaultValue="peso-medio" className="flex gap-4 mb-2">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="peso-medio" id="r1" /><Label htmlFor="r1" className="text-sm">Peso medio (Kg)</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="peso-total" id="r2" /><Label htmlFor="r2" className="text-sm text-muted-foreground">Peso total (Kg)</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="peso-camada" id="r3" /><Label htmlFor="r3" className="text-sm text-muted-foreground">Peso de la camada (Kg)</Label></div>
                            </RadioGroup>
                            <ResponsiveContainer width="100%" height={150}>
                                <BarChart data={mockMonthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={10} tickLine={false} axisLine={false} domain={[0, 2]}/>
                                    <Tooltip formatter={(v) => `${Number(v).toFixed(2)} kg`}/>
                                    <Bar dataKey="pesoMedio" name="Peso Medio" fill="hsl(var(--chart-1))" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Distribución de Nacimientos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="partos">
                            <TabsList>
                                <TabsTrigger value="partos">Partos</TabsTrigger>
                                <TabsTrigger value="nacidos">Nacidos Totales</TabsTrigger>
                                <TabsTrigger value="perdidas">Pérdidas</TabsTrigger>
                                <TabsTrigger value="vivos">Nacidos Vivos</TabsTrigger>
                                <TabsTrigger value="peso">Peso nacimiento (Kg)</TabsTrigger>
                            </TabsList>
                            <TabsContent value="partos" className="mt-4">
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                   <Card>
                                       <CardHeader><CardTitle className="text-sm">Días de gestación</CardTitle></CardHeader>
                                       <CardContent>
                                           <ResponsiveContainer width="100%" height={150}>
                                                <BarChart data={mockDistributionData.gestationDays} layout="vertical">
                                                    <XAxis type="number" hide />
                                                    <YAxis type="category" dataKey="name" width={60} fontSize={10}/>
                                                    <Tooltip formatter={(v) => `${v}%`} />
                                                    <Bar dataKey="value" fill="hsl(var(--chart-5))" radius={[0,4,4,0]}/>
                                                </BarChart>
                                           </ResponsiveContainer>
                                       </CardContent>
                                   </Card>
                                   <Card>
                                       <CardHeader><CardTitle className="text-sm">Ciclo medio</CardTitle></CardHeader>
                                       <CardContent>
                                           <ResponsiveContainer width="100%" height={150}>
                                                <BarChart data={mockDistributionData.cycle} layout="vertical">
                                                    <XAxis type="number" hide />
                                                    <YAxis type="category" dataKey="name" width={40} fontSize={10}/>
                                                    <Tooltip formatter={(v) => `${v}%`} />
                                                    <Bar dataKey="value" fill="hsl(var(--chart-5))" radius={[0,4,4,0]}/>
                                                </BarChart>
                                           </ResponsiveContainer>
                                       </CardContent>
                                   </Card>
                                   <Card>
                                       <CardHeader><CardTitle className="text-sm">Duración</CardTitle></CardHeader>
                                       <CardContent>
                                           <ResponsiveContainer width="100%" height={150}>
                                                <BarChart data={mockDistributionData.duration} layout="vertical">
                                                    <XAxis type="number" hide />
                                                    <YAxis type="category" dataKey="name" width={50} fontSize={10}/>
                                                    <Tooltip formatter={(v) => `${v}%`} />
                                                    <Bar dataKey="value" fill="hsl(var(--chart-5))" radius={[0,4,4,0]}/>
                                                </BarChart>
                                           </ResponsiveContainer>
                                       </CardContent>
                                   </Card>
                               </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                 </Card>

                 <Card>
                     <CardHeader><CardTitle>Día de la Semana/Horario</CardTitle></CardHeader>
                     <CardContent>
                         <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-xs text-center">
                                <thead>
                                    <tr className="bg-muted/50">
                                        <th className="p-2 border font-normal">Horario</th>
                                        <th className="p-2 border font-normal">Domingo</th>
                                        <th className="p-2 border font-normal">Lunes</th>
                                        <th className="p-2 border font-normal">Martes</th>
                                        <th className="p-2 border font-normal">Miércoles</th>
                                        <th className="p-2 border font-normal">Jueves</th>
                                        <th className="p-2 border font-normal">Viernes</th>
                                        <th className="p-2 border font-normal">Sábado</th>
                                        <th className="p-2 border font-normal">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockHeatmapData.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            <td className="p-2 border font-medium text-left">
                                                {['Sin horario','18:00-23:59','12:00-17:59','06:00-11:59','00:00-05:59','Total'][rowIndex]}
                                            </td>
                                            {row.map((cell, cellIndex) => (
                                                <td key={cellIndex} className="p-2 border" style={{backgroundColor: `hsl(260, 100%, ${100 - (cell/40 * 50)}%)`, color: cell > 20 ? 'white': 'inherit'}}>
                                                    {cell.toFixed(2)}%
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                     </CardContent>
                 </Card>

                 <Card>
                     <CardHeader><CardTitle>Listado de Madres</CardTitle></CardHeader>
                     <CardContent>
                         <p className="text-sm text-muted-foreground mb-4">Todas las madres que componen a esta consulta</p>
                          <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Madre</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Ciclo</TableHead>
                                        <TableHead>Raza</TableHead>
                                        <TableHead>Composición del servicio</TableHead>
                                        <TableHead>Total de nacidos</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...Array(10)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Link href="/analysis/sow-card" className="text-primary underline">195-1</Link></TableCell>
                                            <TableCell>08/03/2024</TableCell>
                                            <TableCell>1</TableCell>
                                            <TableCell>CHOICE</TableCell>
                                            <TableCell>Primerizas</TableCell>
                                            <TableCell>1</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                          </div>
                          <div className="flex items-center justify-between mt-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Button size="icon" variant="outline" className="h-8 w-8">1</Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8">2</Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8">3</Button>
                                <span>...</span>
                                <Button size="icon" variant="ghost" className="h-8 w-8">10</Button>
                              </div>
                              <div className="text-muted-foreground">
                                  Total de resultados: 238
                              </div>
                              <div className="flex items-center gap-2">
                                <Label>Líneas por página:</Label>
                                <Select defaultValue="10">
                                    <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                              </div>
                          </div>
                     </CardContent>
                 </Card>
            </div>
        </AppLayout>
    );
}
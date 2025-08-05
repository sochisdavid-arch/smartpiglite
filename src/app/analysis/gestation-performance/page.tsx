
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Repeat, Baby, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, LineChart } from 'recharts';

const kpiData = [
  { title: "Tasa de Partos", value: "89.5%", icon: Baby, description: "Porcentaje de servicios que finalizan en parto." },
  { title: "Promedio Nacidos Vivos / Parto", value: "12.8", icon: Baby, description: "Promedio de lechones nacidos vivos por cada parto." },
  { title: "Días No Productivos (DNP)", value: "25 días", icon: Activity, description: "Promedio de días que una cerda no está gestando ni lactando." },
  { title: "Tasa de Repetición de Celo", value: "7.2%", icon: Repeat, description: "Porcentaje de cerdas que repiten celo después de la inseminación." },
  { title: "Tasa de Abortos", value: "2.1%", icon: XCircle, description: "Porcentaje de gestaciones que terminan en aborto." },
  { title: "Intervalo Destete-Servicio (IDS)", value: "5.8 días", icon: Activity, description: "Tiempo promedio desde el destete hasta la siguiente cubrición." },
];

const pigBreeds = [
  "Duroc", "Yorkshire", "Landrace", "Hampshire", "Pietrain",
];

const geneticLines = [
  "PIC", "Topigs Norsvin", "Hypor (Hendrix Genetics)", "DanBred", "Genus", "Choice Genetics", "Genesus",
];


// Mock data for charts
const farrowingRateData = [
    { name: 'Duroc', rate: 88 },
    { name: 'Landrace', rate: 92 },
    { name: 'Yorkshire', rate: 90 },
    { name: 'Pietrain', rate: 85 },
];

const liveBornData = [
    { period: 'Ene', value: 12.5 },
    { period: 'Feb', value: 12.8 },
    { period: 'Mar', value: 13.1 },
    { period: 'Abr', value: 12.9 },
    { period: 'May', value: 13.5 },
    { period: 'Jun', value: 13.2 },
];


export default function GestationPerformancePage() {
    const [period, setPeriod] = React.useState('anual');
    const [year, setYear] = React.useState(new Date().getFullYear().toString());
    const [genetics, setGenetics] = React.useState('todas');

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Análisis de Desempeño de Gestación</h1>
                </div>
                <CardDescription>
                    Analice las informaciones de desempeño de la gestación, a través de los indicadores de servicio y pérdidas reproductivas.
                    Estos indicadores son clave para optimizar la eficiencia reproductiva de la granja.
                </CardDescription>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kpiData.map((kpi, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium">{kpi.title}</CardTitle>
                                <kpi.icon className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{kpi.value}</div>
                                <p className="text-xs text-muted-foreground">{kpi.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filtros de Visualización</CardTitle>
                         <CardDescription>Seleccione los filtros para visualizar los gráficos de tendencias.</CardDescription>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                            <Select value={period} onValueChange={setPeriod}>
                                <SelectTrigger><SelectValue placeholder="Filtrar por Periodo" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="anual">Anual</SelectItem>
                                    <SelectItem value="semestral">Semestral</SelectItem>
                                    <SelectItem value="trimestral">Trimestral</SelectItem>
                                    <SelectItem value="mensual">Mensual</SelectItem>
                                    <SelectItem value="semanal">Semanal</SelectItem>
                                </SelectContent>
                            </Select>
                             <Select value={year} onValueChange={setYear}>
                                <SelectTrigger><SelectValue placeholder="Filtrar por Año" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2024">2024</SelectItem>
                                    <SelectItem value="2023">2023</SelectItem>
                                    <SelectItem value="2022">2022</SelectItem>
                                </SelectContent>
                            </Select>
                             <Select value={genetics} onValueChange={setGenetics}>
                                <SelectTrigger><SelectValue placeholder="Filtrar por Genética" /></SelectTrigger>
                                <SelectContent>
                                     <SelectItem value="todas">Todas las Genéticas</SelectItem>
                                     <SelectGroup>
                                        <SelectLabel>Razas</SelectLabel>
                                        {pigBreeds.map(b => <SelectItem key={b} value={b.toLowerCase()}>{b}</SelectItem>)}
                                     </SelectGroup>
                                     <SelectGroup>
                                        <SelectLabel>Líneas Genéticas</SelectLabel>
                                        {geneticLines.map(gl => <SelectItem key={gl} value={gl.toLowerCase().replace(/ /g, '-')}>{gl}</SelectItem>)}
                                     </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                </Card>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tasa de Partos por Genética</CardTitle>
                            <CardDescription>Comparativo de la tasa de partos (%) entre las diferentes genéticas.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={farrowingRateData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                                    <YAxis unit="%" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                                    <Tooltip
                                        contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        }}
                                    />
                                    <Bar dataKey="rate" fill="hsl(var(--chart-1))" name="Tasa de Partos" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Evolución de Nacidos Vivos</CardTitle>
                            <CardDescription>Promedio de nacidos vivos por parto a lo largo del tiempo.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={liveBornData}>
                                     <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                     <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                                     <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                                     <Tooltip
                                        contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        }}
                                    />
                                     <Legend />
                                     <Line type="monotone" dataKey="value" name="Nacidos Vivos" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--chart-2))" }} activeDot={{ r: 6 }}/>
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </AppLayout>
    );
}

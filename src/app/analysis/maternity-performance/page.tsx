
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Filter, CalendarIcon, MoreHorizontal, SlidersHorizontal, BarChart2, Checkbox as CheckboxIcon, Circle } from 'lucide-react';
import { format, parseISO, isValid, differenceInDays, startOfDay, endOfDay, sub, eachYearOfInterval, eachMonthOfInterval, eachWeekOfInterval, getDay, getHours, getWeek, getYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

interface Event {
    id: string;
    type: string;
    date: string;
    details?: string;
    liveBorn?: number;
    stillborn?: number;
    mummified?: number;
    birthWeight?: number;
    duration?: number;
    [key: string]: any;
}

interface Pig {
    id: string;
    breed: string;
    birthDate: string;
    events: Event[];
}

const pigBreeds = [
  "Duroc", "Yorkshire", "Landrace", "Hampshire", "Pietrain", "Berkshire", "Chester White", "Spotted", "Poland China", "Tamworth", "Large Black", "Cerdo Ibérico",
  "PIC", "Topigs Norsvin", "Hypor (Hendrix Genetics)", "DanBred", "Genus", "Choice Genetics", "Genesus",
  "Otro"
];

const KpiCard = ({ title, value, meta, isBad }: { title: string, value: string | number, meta:string, isBad?: boolean }) => (
    <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{value}</span>
                {isBad !== undefined && <div className={`h-2.5 w-2.5 rounded-full ${isBad ? 'bg-red-500' : 'bg-green-500'}`} />}
            </div>
            {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
        </CardContent>
    </Card>
);

const chartData = [
  { name: '03/2024', pha: 2.24, dha: 26.08, kgdha: 155.75 },
  { name: '04/2024', pha: 2.24, dha: 24.19, kgdha: 150.64 },
  { name: '05/2024', pha: 2.05, dha: 20.54, kgdha: 136.49 },
  { name: '06/2024', pha: 2.41, dha: 28.72, kgdha: 146.84 },
  { name: '07/2024', pha: 2.52, dha: 25.73, kgdha: 150.28 },
  { name: '08/2024', pha: 2.35, dha: 27.07, kgdha: 161.44 },
  { name: '09/2024', pha: 2.35, dha: 24.72, kgdha: 148.28 },
  { name: '10/2024', pha: 2.32, dha: 26.82, kgdha: 157.34 },
  { name: '11/2024', pha: 2.47, dha: 25.89, kgdha: 138.49 },
  { name: '12/2024', pha: 2.28, dha: 27.02, kgdha: 149.08 },
  { name: '01/2025', pha: 2.19, dha: 17.78, kgdha: 89.09 },
  { name: '02/2025', pha: 2.42, dha: 16.05, kgdha: 74.43 },
  { name: '03/2025', pha: 2.42, dha: 19.58, kgdha: 112.06 },
  { name: '04/2025', pha: 2.08, dha: 18.59, kgdha: 114.57 },
  { name: '05/2025', pha: 2.46, dha: 33.62, kgdha: 132.88 },
];

const distributionData = {
    ciclo: [
        { name: '<= 1', value: 2.42 },
        { name: '2 ~ 2', value: 2.36 },
        { name: '3 ~ 6', value: 2.28 },
        { name: '>= 7', value: 2.33 },
    ],
    raza: [
        { name: 'Duroc', value: 2.45 },
        { name: 'Landrace', value: 2.38 },
        { name: 'Yorkshire', value: 2.30 },
        { name: 'PIC', value: 2.55 },
    ]
}

export default function MaternityPerformancePage() {
    const [startDate, setStartDate] = React.useState<string>(format(sub(new Date(), { years: 1 }), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = React.useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [breedFilter, setBreedFilter] = React.useState('all');
    const [cycleRange, setCycleRange] = React.useState([1, 20]);
    const [timeGroup, setTimeGroup] = React.useState<'week' | 'month' | 'trimester' | 'year'>('month');
    const [distributionBy, setDistributionBy] = React.useState<'ciclo' | 'raza'>('ciclo');

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <h1 className="text-3xl font-bold tracking-tight">Análisis de Máximo Potencial Productivo</h1>
                <Card>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="start-date">Fecha inicial</Label>
                                <div className="relative">
                                    <Input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="pr-8"/>
                                    <CalendarIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end-date">Fecha final</Label>
                                 <div className="relative">
                                    <Input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="pr-8"/>
                                    <CalendarIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="breed-filter">Buscar por raza</Label>
                                <Select value={breedFilter} onValueChange={setBreedFilter}>
                                    <SelectTrigger id="breed-filter"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las razas</SelectItem>
                                        {pigBreeds.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Ciclo: {cycleRange[0]} - {cycleRange[1]}</Label>
                                <Slider
                                    defaultValue={cycleRange}
                                    onValueCommit={setCycleRange}
                                    max={20}
                                    min={1}
                                    step={1}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button className="w-full">Filtrar</Button>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <KpiCard title="PARTO/HEMBRA/AÑO (PHA)" value="2,32" meta="Meta: 2,57" isBad={2.32 < 2.57} />
                    <KpiCard title="DESTETADOS/HEMBRA/AÑO (DHA)" value="24,00" meta="Meta: 33,44" isBad={24 < 33.44}/>
                    <KpiCard title="KG/DESTETADOS/HEMBRA/AÑO (KG/DHA)" value="139,67" meta="" />
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Comparación de los Principales Índices</CardTitle>
                             <div className="flex items-center gap-1 border p-1 rounded-md">
                                <Button variant={timeGroup === 'week' ? 'secondary' : 'outline'} size="sm" onClick={() => setTimeGroup('week')}>Semana</Button>
                                <Button variant={timeGroup === 'month' ? 'secondary' : 'outline'} size="sm" onClick={() => setTimeGroup('month')}>Mes</Button>
                                <Button variant={timeGroup === 'trimester' ? 'secondary' : 'outline'} size="sm" onClick={() => setTimeGroup('trimester')}>Trimestre</Button>
                                <Button variant={timeGroup === 'year' ? 'secondary' : 'outline'} size="sm" onClick={() => setTimeGroup('year')}>Año</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div>
                             <h3 className="font-semibold text-md mb-2">Parto/Hembra/Año (PHA)</h3>
                             <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={10} tickLine={false} axisLine={false} domain={[0, 3]}/>
                                    <Tooltip />
                                    <Bar dataKey="pha" name="Parto/Hembra/Año (PHA)" fill="hsl(var(--chart-4))" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                         <div>
                             <h3 className="font-semibold text-md mb-2">Destetados/Hembra/Año (DHA)</h3>
                             <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={10} tickLine={false} axisLine={false} domain={[0, 40]}/>
                                    <Tooltip />
                                    <Bar dataKey="dha" name="Destetados/Hembra/Año (DHA)" fill="hsl(var(--chart-2))" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                             <h3 className="font-semibold text-md mb-2">Kg/Destetados/Hembra/Año (Kg/DHA)</h3>
                             <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={10} tickLine={false} axisLine={false} domain={[0, 200]}/>
                                    <Tooltip />
                                    <Bar dataKey="kgdha" name="Kg/Destetados/Hembra/Año (Kg/DHA)" fill="hsl(var(--chart-5))" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Distribución de Indicadores Productivos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="pha">
                            <TabsList>
                                <TabsTrigger value="pha">Parto/Hembra/Año (PHA)</TabsTrigger>
                                <TabsTrigger value="dha">Destetados/Hembra/Año (DHA)</TabsTrigger>
                                <TabsTrigger value="kgdha">Kg/Destetados/Hembra/Año (Kg/DHA)</TabsTrigger>
                            </TabsList>
                            <TabsContent value="pha" className="mt-4">
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                   <Card className="col-span-1">
                                       <CardHeader><CardTitle className="text-sm">Por los datos de la madre</CardTitle></CardHeader>
                                       <CardContent>
                                           <RadioGroup defaultValue="ciclo" onValueChange={(v) => setDistributionBy(v as 'ciclo' | 'raza')}>
                                               <div className="flex items-center space-x-2">
                                                   <RadioGroupItem value="ciclo" id="ciclo" />
                                                   <Label htmlFor="ciclo">Ciclo</Label>
                                               </div>
                                               <div className="flex items-center space-x-2">
                                                   <RadioGroupItem value="raza" id="raza" />
                                                   <Label htmlFor="raza">Raza</Label>
                                               </div>
                                           </RadioGroup>
                                       </CardContent>
                                   </Card>
                                   <Card className="md:col-span-2">
                                       <CardHeader><CardTitle className="text-sm">Desempeño de Parto/Hembra/Año (PHA)</CardTitle></CardHeader>
                                       <CardContent>
                                            <ResponsiveContainer width="100%" height={250}>
                                                <BarChart data={distributionData[distributionBy]} layout="vertical">
                                                    <XAxis type="number" domain={[0, 3]}/>
                                                    <YAxis type="category" dataKey="name" width={60} fontSize={12}/>
                                                    <Tooltip />
                                                    <Bar dataKey="value" fill="hsl(var(--chart-4))" radius={[0,4,4,0]}>
                                                        {distributionData[distributionBy].map((entry, index) => (
                                                            <Cell key={`cell-${index}`} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                           </ResponsiveContainer>
                                       </CardContent>
                                   </Card>
                               </div>
                            </TabsContent>
                             <TabsContent value="dha" className="mt-4">
                                <p className="text-center text-muted-foreground p-8">Gráficos de distribución para DHA.</p>
                            </TabsContent>
                             <TabsContent value="kgdha" className="mt-4">
                                <p className="text-center text-muted-foreground p-8">Gráficos de distribución para Kg/DHA.</p>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                 </Card>

            </div>
        </AppLayout>
    );
}

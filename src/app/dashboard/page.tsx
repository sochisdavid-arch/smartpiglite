
"use client"
import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { differenceInDays, parseISO } from 'date-fns';

interface Event {
    id: string;
    type: string;
    date: string;
    details?: string;
    liveBorn?: number;
    stillborn?: number;
    mummified?: number;
    pigletCount?: number;
    weaningWeight?: number;
    [key: string]: any;
}

interface Pig {
    id: string;
    breed: string;
    birthDate: string;
    gender: 'Hembra' | 'Macho';
    events: Event[];
}

interface KpiData {
  dha: number;
  avgLiveBorn: number;
  avgWeaned: number;
  pha: number;
  ids: number;
  npd: number;
  kgDha: number;
  totalPigs: number;
}

const KpiCard = ({ title, value, unit, description }: { title: string, value: string, unit?: string, description: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value} <span className="text-lg text-muted-foreground">{unit}</span></div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

export default function DashboardPage() {
    const [kpiData, setKpiData] = React.useState<KpiData | null>(null);

    React.useEffect(() => {
        const pigsFromStorage = localStorage.getItem('pigs');
        if (pigsFromStorage) {
            const allPigs: Pig[] = JSON.parse(pigsFromStorage);
            const sows = allPigs.filter(p => p.gender === 'Hembra');
            
            if (sows.length > 0) {
                let totalFarrowings = 0;
                let totalLiveBorn = 0;
                let totalWeaned = 0;
                let totalWeanedKg = 0;
                let totalNpd = 0;
                let totalIds = 0;
                let countIds = 0;
                let farrowingIntervals: number[] = [];

                sows.forEach(sow => {
                    let lastWeaningDate: string | null = null;
                    const sortedEvents = [...sow.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    const partoEvents = sortedEvents.filter(e => e.type === 'Parto');
                    totalFarrowings += partoEvents.length;

                    for(let i=1; i<partoEvents.length; i++){
                       farrowingIntervals.push(differenceInDays(parseISO(partoEvents[i].date), parseISO(partoEvents[i-1].date)));
                    }

                    sortedEvents.forEach(event => {
                        if (event.type === 'Parto') {
                            totalLiveBorn += event.liveBorn || 0;
                        } else if (event.type === 'Destete') {
                            totalWeaned += event.pigletCount || 0;
                            totalWeanedKg += event.weaningWeight || 0;
                            lastWeaningDate = event.date;
                        } else if ((event.type === 'Inseminación' || event.type === 'Monta Natural') && lastWeaningDate) {
                            const interval = differenceInDays(parseISO(event.date), parseISO(lastWeaningDate));
                            if(interval >= 0){
                                totalIds += interval;
                                countIds++;
                            }
                            lastWeaningDate = null;
                        }
                    });
                });
                
                const productiveSows = sows.length; 
                const avgFarrowingInterval = farrowingIntervals.length > 0 ? farrowingIntervals.reduce((a, b) => a + b, 0) / farrowingIntervals.length : 0;
                
                const pha = avgFarrowingInterval > 0 ? 365 / avgFarrowingInterval : 0;
                const avgLiveBorn = totalFarrowings > 0 ? totalLiveBorn / totalFarrowings : 0;
                const avgWeaned = totalFarrowings > 0 ? totalWeaned / totalFarrowings : 0;

                const dha = pha * avgWeaned;
                const kgDha = pha * (totalFarrowings > 0 ? totalWeanedKg / totalFarrowings : 0);
                const ids = countIds > 0 ? totalIds / countIds : 0;
                const npd = avgFarrowingInterval > 0 ? avgFarrowingInterval - 114 - 21 : 0; // Simplified
                
                setKpiData({
                    dha,
                    avgLiveBorn,
                    avgWeaned,
                    pha,
                    ids,
                    npd,
                    kgDha,
                    totalPigs: allPigs.length,
                });
            }
        }
    }, []);

    const productionData = [
      { name: 'Ene', born: 98, weaned: 90 },
      { name: 'Feb', born: 110, weaned: 105 },
      { name: 'Mar', born: 125, weaned: 118 },
      { name: 'Abr', born: 115, weaned: 110 },
      { name: 'May', born: 130, weaned: 122 },
      { name: 'Jun', born: 140, weaned: 135 },
    ];

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard title="DHA" value={kpiData?.dha.toFixed(2) || '0.00'} description="Destetos / Hembra / Año."/>
          <KpiCard title="NV/P" value={kpiData?.avgLiveBorn.toFixed(2) || '0.00'} description="Nacidos Vivos / Parto."/>
          <KpiCard title="Dest./P" value={kpiData?.avgWeaned.toFixed(2) || '0.00'} description="Destetados / Parto."/>
          <KpiCard title="PHA" value={kpiData?.pha.toFixed(2) || '0.00'} description="Partos / Hembra / Año."/>
          <KpiCard title="IDS" value={kpiData?.ids.toFixed(1) || '0.0'} unit="días" description="Int. Destete - Servicio."/>
          <KpiCard title="DNP" value={kpiData?.npd.toFixed(1) || '0.0'} unit="días" description="Días No Productivos."/>
          <KpiCard title="Kg/DHA" value={kpiData?.kgDha.toFixed(2) || '0.00'} unit="kg" description="Kg Destetados / Hembra / Año."/>
          <KpiCard title="Cerdos Totales" value={kpiData?.totalPigs.toString() || '0'} description="Total de animales en la granja."/>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Producción Mensual (Datos de Ejemplo)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Legend iconSize={10} />
                  <Bar dataKey="born" fill="hsl(var(--chart-1))" name="Nacidos" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="weaned" fill="hsl(var(--chart-2))" name="Destetados" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

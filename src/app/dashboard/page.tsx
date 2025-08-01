
"use client"
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Ratio, PiggyBank, GitCommitHorizontal } from 'lucide-react';

const kpiData = [
  { title: "Nacidos por Cerda/Año", value: "28.5", icon: GitCommitHorizontal, change: "+1.2%" },
  { title: "Destete a Celo", value: "5.2 días", icon: Activity, change: "-0.3 días" },
  { title: "Ratio de Conversión de Alimento", value: "2.6:1", icon: Ratio, change: "+0.1" },
  { title: "Cerdos Totales", value: "1,240", icon: PiggyBank, change: "+50 este mes" },
];

const productionData = [
  { name: 'Ene', born: 98, weaned: 90 },
  { name: 'Feb', born: 110, weaned: 105 },
  { name: 'Mar', born: 125, weaned: 118 },
  { name: 'Abr', born: 115, weaned: 110 },
  { name: 'May', born: 130, weaned: 122 },
  { name: 'Jun', born: 140, weaned: 135 },
];


export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiData.map((kpi, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground">{kpi.change} del último período</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Producción Mensual</CardTitle>
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

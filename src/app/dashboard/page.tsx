"use client"
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Ratio, PiggyBank, GitCommitHorizontal } from 'lucide-react';

const kpiData = [
  { title: "Born per Sow/Year", value: "28.5", icon: GitCommitHorizontal, change: "+1.2%" },
  { title: "Weaning to Estrus", value: "5.2 days", icon: Activity, change: "-0.3 days" },
  { title: "Feed Conversion Ratio", value: "2.6:1", icon: Ratio, change: "+0.1" },
  { title: "Total Pigs", value: "1,240", icon: PiggyBank, change: "+50 this month" },
];

const productionData = [
  { name: 'Jan', born: 98, weaned: 90 },
  { name: 'Feb', born: 110, weaned: 105 },
  { name: 'Mar', born: 125, weaned: 118 },
  { name: 'Apr', born: 115, weaned: 110 },
  { name: 'May', born: 130, weaned: 122 },
  { name: 'Jun', born: 140, weaned: 135 },
];


export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiData.map((kpi, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground">{kpi.change} from last period</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Monthly Production</CardTitle>
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
                  <Bar dataKey="born" fill="hsl(var(--chart-1))" name="Born" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="weaned" fill="hsl(var(--chart-2))" name="Weaned" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

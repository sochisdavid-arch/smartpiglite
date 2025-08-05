
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, Activity, Repeat, Baby, XCircle } from 'lucide-react';

const kpiData = [
  { title: "Tasa de Partos", value: "89.5%", icon: Baby, description: "Porcentaje de servicios que finalizan en parto." },
  { title: "Promedio Nacidos Vivos / Parto", value: "12.8", icon: Baby, description: "Promedio de lechones nacidos vivos por cada parto." },
  { title: "Días No Productivos (DNP)", value: "25 días", icon: Activity, description: "Promedio de días que una cerda no está gestando ni lactando." },
  { title: "Tasa de Repetición de Celo", value: "7.2%", icon: Repeat, description: "Porcentaje de cerdas que repiten celo después de la inseminación." },
  { title: "Tasa de Abortos", value: "2.1%", icon: XCircle, description: "Porcentaje de gestaciones que terminan en aborto." },
  { title: "Intervalo Destete-Servicio (IDS)", value: "5.8 días", icon: Activity, description: "Tiempo promedio desde el destete hasta la siguiente cubrición." },
];

export default function GestationPerformancePage() {

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
                        <CardTitle>Próximamente: Gráficos de Tendencias</CardTitle>
                        <CardDescription>
                            Visualice la evolución de los principales indicadores a lo largo del tiempo para identificar patrones y tomar decisiones informadas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center h-64 bg-muted rounded-lg">
                        <div className="text-center text-muted-foreground">
                            <BarChart className="h-12 w-12 mx-auto mb-2"/>
                            <p>Gráficos de tendencias estarán disponibles en una futura actualización.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}


"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PreceboReport, PreceboReportData } from '@/components/PreceboReport';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format, parseISO, isValid } from 'date-fns';

export default function LiquidatedBatchesPage() {
    const [liquidatedPrecebo, setLiquidatedPrecebo] = React.useState<PreceboReportData[]>([]);
    const [selectedReport, setSelectedReport] = React.useState<PreceboReportData | null>(null);

    React.useEffect(() => {
        const storedReports = localStorage.getItem('liquidatedPreceboReports');
        if (storedReports) {
            setLiquidatedPrecebo(JSON.parse(storedReports));
        }
    }, []);
   
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Análisis de Lotes Liquidados</h1>
                </div>

                <Tabs defaultValue="precebo" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="precebo">Precebo</TabsTrigger>
                        <TabsTrigger value="ceba">Ceba</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="precebo" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informes de Lotes de Precebo</CardTitle>
                                <CardDescription>Aquí se listan todos los lotes de precebo que han sido finalizados (trasladados o vendidos).</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID Lote</TableHead>
                                            <TableHead>Fecha Finalización</TableHead>
                                            <TableHead>Motivo</TableHead>
                                            <TableHead>Nº Final</TableHead>
                                            <TableHead>Conversión</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {liquidatedPrecebo.length > 0 ? liquidatedPrecebo.map((report) => (
                                            <TableRow key={report.batchId}>
                                                <TableCell className="font-medium">{report.batchId}</TableCell>
                                                <TableCell>{isValid(parseISO(report.endDate)) ? format(parseISO(report.endDate), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                                <TableCell>{report.liquidationReason}</TableCell>
                                                <TableCell>{report.finalCount}</TableCell>
                                                <TableCell>{report.feedConversion.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>Ver Informe</Button>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center">No hay informes de lotes liquidados.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="ceba" className="mt-6">
                         <Card>
                            <CardHeader>
                                <CardTitle>Informes de Lotes de Ceba</CardTitle>
                                 <CardDescription>Funcionalidad en desarrollo. Próximamente podrá ver los informes de lotes de ceba finalizados.</CardDescription>
                            </CardHeader>
                            <CardContent>
                               <p className="text-muted-foreground">En desarrollo.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <Dialog open={!!selectedReport} onOpenChange={(isOpen) => !isOpen && setSelectedReport(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Informe de Liquidación de Lote de Precebo: {selectedReport?.batchId}</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto pr-2">
                           {selectedReport && <PreceboReport reportData={selectedReport} />}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

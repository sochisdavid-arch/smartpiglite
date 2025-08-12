
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { Logo } from "@/components/Logo";

export default function MovimientoLechonesForm() {
    const handlePrint = () => {
        window.print();
    };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none">
        <div className="flex justify-between items-center p-4 sm:p-8 border-b print:hidden">
            <Button variant="outline" asChild>
                <Link href="/forms">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Link>
            </Button>
            <Button onClick={handlePrint}>
                <Download className="mr-2 h-4 w-4" />
                Imprimir o Guardar como PDF
            </Button>
        </div>
        <div id="printable-content">
            <div className="p-8 sm:p-12">
            <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Logo className="h-16 w-16 text-primary" />
                        <div>
                            <h1 className="text-2xl font-bold text-primary">SmartPig</h1>
                            <p className="text-muted-foreground">Granja Demo</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold uppercase">Movimiento de Lechones</h2>
                    </div>
                </div>
            <Card className="w-full border-none shadow-none">
                <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="flex items-baseline gap-2">
                        <p className="font-semibold w-24">Sala:</p>
                        <div className="border-b flex-1"></div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="font-semibold w-24">Fecha:</p>
                        <div className="border-b flex-1"></div>
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID Madre</TableHead>
                            <TableHead>Tipo Evento</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead>Causa (Muerte)</TableHead>
                            <TableHead>Madre Origen/Destino</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 15 }).map((_, index) => (
                            <TableRow key={index}>
                                <TableCell className="h-12"></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
            </div>
        </div>
      </div>
    </div>
  );
}

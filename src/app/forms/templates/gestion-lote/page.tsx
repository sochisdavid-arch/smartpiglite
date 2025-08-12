
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { Logo } from "@/components/Logo";

export default function GestionLoteForm() {
    const handlePrint = () => {
        window.print();
    };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white">
        <header className="max-w-4xl mx-auto flex justify-between items-center py-4 print:hidden">
            <Button variant="outline" asChild>
                <Link href="/forms">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Formularios
                </Link>
            </Button>
            <Button onClick={handlePrint}>
                <Download className="mr-2 h-4 w-4" />
                Imprimir o Guardar como PDF
            </Button>
        </header>
        <main id="printable-content" className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-lg print:shadow-none">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Logo className="h-16 w-16 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold text-primary">SmartPig</h1>
                        <p className="text-muted-foreground">Granja Demo</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold uppercase">Gestión de Lote</h2>
                </div>
            </div>
            <Card className="w-full border-none shadow-none">
                <CardContent className="p-0">
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="flex items-baseline gap-2">
                        <p className="font-semibold w-24">ID del Lote:</p>
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
                            <TableHead>Tipo de Evento</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead>Peso Total (kg)</TableHead>
                            <TableHead>Causa/Destino/Lote</TableHead>
                            <TableHead>Valor ($)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 10 }).map((_, index) => (
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
                <div className="mt-8">
                    <h4 className="font-semibold mb-2">Observaciones Generales:</h4>
                    <div className="border-b h-20"></div>
                </div>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}

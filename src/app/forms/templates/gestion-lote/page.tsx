"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import Link from 'next/link';

export default function GestionLoteForm() {
    const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
      <div className="max-w-4xl mx-auto bg-white shadow-lg">
        <div className="flex justify-between items-center p-4 sm:p-8 border-b no-print">
            <Button variant="outline" asChild>
                <Link href="/forms">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Link>
            </Button>
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir Formulario
            </Button>
        </div>
        <div className="p-8 sm:p-12 printable-area">
          <Card className="w-full border-none shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl">Formulario de Gestión de Lote</CardTitle>
              <CardDescription>Para recolección de muertes, transferencias entre lotes, fases y ventas de lechones.</CardDescription>
            </CardHeader>
            <CardContent>
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
        </div>
      </div>
    </div>
  );
}

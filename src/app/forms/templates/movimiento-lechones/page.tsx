"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function MovimientoLechonesForm() {
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-4 no-print">
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir Formulario
            </Button>
        </div>
        <div className="bg-white p-8 sm:p-12 shadow-lg printable-area">
          <Card className="w-full border-none shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl">Formulario de Muerte/Movimiento de Lechones</CardTitle>
              <CardDescription>Para recolección de bajas y transferencias de lechones en maternidad.</CardDescription>
            </CardHeader>
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
  );
}

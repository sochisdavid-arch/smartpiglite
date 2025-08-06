
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import Link from 'next/link';

export default function PartoReversoForm() {

  const handlePrint = () => {
    window.print();
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white">
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
                Imprimir / Exportar
            </Button>
        </div>
        <div className="p-8 sm:p-12 print:p-4">
          <Card className="w-full border-none shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl text-center">REGISTRO DE PARTO</CardTitle>
            </CardHeader>
            <CardContent className="text-xs">
              <div className="grid grid-cols-3 gap-4 mb-4 border p-2 rounded-md">
                <div className="flex items-baseline gap-2"><p className="font-bold">FECHA PARTO:</p><div className="border-b flex-1"></div></div>
                <div className="flex items-baseline gap-2"><p className="font-bold">HORA INICIO:</p><div className="border-b flex-1"></div></div>
                <div className="flex items-baseline gap-2"><p className="font-bold">HORA FIN:</p><div className="border-b flex-1"></div></div>
                <div className="flex items-baseline gap-2"><p className="font-bold">PESO CAMADA:</p><div className="border-b flex-1"></div></div>
                <div className="flex items-baseline gap-2"><p className="font-bold">PESO PROMEDIO:</p><div className="border-b flex-1"></div></div>
                <div className="flex items-baseline gap-2"><p className="font-bold">Nº CERDA:</p><div className="border-b flex-1"></div></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-1">
                   <Table className="border">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="p-1 text-center font-bold text-black border" colSpan={3}>TEMPERATURA</TableHead>
                        </TableRow>
                        <TableRow>
                          <TableHead className="p-1 text-center font-bold text-black border">DÍA</TableHead>
                          <TableHead className="p-1 text-center font-bold text-black border">MAÑANA</TableHead>
                          <TableHead className="p-1 text-center font-bold text-black border">TARDE</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow><TableCell className="p-1 border text-center font-bold">1</TableCell><TableCell className="p-1 border h-6"></TableCell><TableCell className="p-1 border h-6"></TableCell></TableRow>
                        <TableRow><TableCell className="p-1 border text-center font-bold">2</TableCell><TableCell className="p-1 border h-6"></TableCell><TableCell className="p-1 border h-6"></TableCell></TableRow>
                        <TableRow><TableCell className="p-1 border text-center font-bold">3</TableCell><TableCell className="p-1 border h-6"></TableCell><TableCell className="p-1 border h-6"></TableCell></TableRow>
                      </TableBody>
                    </Table>
                </div>
              </div>

              <Table className="border">
                  <TableHeader>
                      <TableRow>
                          <TableHead className="p-1 border text-center text-black font-bold">Nº</TableHead>
                          <TableHead className="p-1 border text-center text-black font-bold">PESO</TableHead>
                          <TableHead className="p-1 border text-center text-black font-bold">HORA</TableHead>
                          <TableHead className="p-1 border text-center text-black font-bold">VIVO</TableHead>
                          <TableHead className="p-1 border text-center text-black font-bold">MUERTO</TableHead>
                          <TableHead className="p-1 border text-center text-black font-bold">MOMIA</TableHead>
                          <TableHead className="p-1 border text-center text-black font-bold">DEFORME</TableHead>
                          <TableHead className="p-1 border text-center text-black font-bold">BAJA V.</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {Array.from({ length: 20 }).map((_, index) => (
                          <TableRow key={index}>
                              <TableCell className="p-1 border h-6 text-center font-bold">{index + 1}</TableCell>
                              <TableCell className="p-1 border"></TableCell>
                              <TableCell className="p-1 border"></TableCell>
                              <TableCell className="p-1 border"></TableCell>
                              <TableCell className="p-1 border"></TableCell>
                              <TableCell className="p-1 border"></TableCell>
                              <TableCell className="p-1 border"></TableCell>
                              <TableCell className="p-1 border"></TableCell>
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

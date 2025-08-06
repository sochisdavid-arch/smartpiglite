
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function GestionLoteForm() {
    const handleExport = (format: 'pdf' | 'csv' | 'xlsx') => {
        const doc = new jsPDF();
        const tableHead = [['Tipo de Evento', 'Cantidad', 'Peso Total (kg)', 'Causa/Destino/Lote', 'Valor ($)']];
        const tableBody = Array.from({ length: 10 }).map(() => Array(5).fill(''));

        const title = "Formulario de Gestión de Lote";
        doc.text(title, 14, 16);

        if (format === 'pdf') {
            autoTable(doc, {
                head: tableHead,
                body: tableBody,
                startY: 24,
                headStyles: { fillColor: '#e07a5f' }
            });
            doc.save(`formulario_gestion_lote.pdf`);
        } else {
            const worksheet = XLSX.utils.aoa_to_sheet([
                [title],
                [],
                ...tableHead,
                ...tableBody,
                 [],
                ['Observaciones Generales:']
            ]);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Formulario");
            XLSX.writeFile(workbook, `formulario_gestion_lote.${format}`);
        }
    };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg">
        <div className="flex justify-between items-center p-4 sm:p-8 border-b">
            <Button variant="outline" asChild>
                <Link href="/forms">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Link>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => handleExport('pdf')}>PDF</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleExport('xlsx')}>Excel (XLSX)</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleExport('csv')}>CSV</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div className="p-8 sm:p-12">
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


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


export default function PerdidaReproductivaForm() {
    const handleExport = (format: 'pdf' | 'csv' | 'xlsx') => {
        const doc = new jsPDF();
        const tableHead = [['ID Madre', 'Fecha', 'Tipo de Pérdida', 'Causa / Observación']];
        const tableBody = Array.from({ length: 15 }).map(() => Array(4).fill(''));

        const title = "Formulario de Pérdida Reproductiva";
        doc.text(title, 14, 16);

        if (format === 'pdf') {
            autoTable(doc, {
                head: tableHead,
                body: tableBody,
                startY: 24,
                headStyles: { fillColor: '#e07a5f' }
            });
            doc.save(`formulario_perdida_reproductiva.pdf`);
        } else {
            const worksheet = XLSX.utils.aoa_to_sheet([
                [title],
                [],
                ...tableHead,
                ...tableBody
            ]);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Formulario");
            XLSX.writeFile(workbook, `formulario_perdida_reproductiva.${format}`);
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
              <CardTitle className="text-2xl">Formulario de Pérdida Reproductiva</CardTitle>
              <CardDescription>Para recolectar datos de pérdidas reproductivas de las madres.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>ID Madre</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Tipo de Pérdida</TableHead>
                          <TableHead>Causa / Observación</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {Array.from({ length: 15 }).map((_, index) => (
                          <TableRow key={index}>
                              <TableCell className="h-12"></TableCell>
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

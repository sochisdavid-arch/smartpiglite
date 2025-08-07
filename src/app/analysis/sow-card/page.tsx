
"use client";

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, UserSearch, Printer, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SowProfileCard, type SowData, processSowHistory } from '@/components/SowProfileCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format, parseISO, addDays } from 'date-fns';


interface Pig {
    id: string;
    breed: string;
    birthDate: string;
    status: string;
    gender: string;
    events: any[]; // Using 'any' for simplicity, should be typed Event[]
}

const FarrowingRecordForm = () => (
    <div className="bg-white py-8 print:p-4">
      <Card className="w-full max-w-4xl mx-auto border-none shadow-none">
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
);


export default function SowCardPage() {
    const searchParams = useSearchParams();
    const sowIdFromQuery = searchParams.get('sowId');
    
    const [allSows, setAllSows] = React.useState<Pig[]>([]);
    const [selectedSow, setSelectedSow] = React.useState<Pig | null>(null);
    const [open, setOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState("sow-card");


    React.useEffect(() => {
        const pigsFromStorage = localStorage.getItem('pigs');
        const allPigs: Pig[] = pigsFromStorage ? JSON.parse(pigsFromStorage) : [];
        const femalePigs = allPigs.filter(p => p.gender === 'Hembra');
        setAllSows(femalePigs);

        if (sowIdFromQuery) {
            const sowToSelect = femalePigs.find(s => s.id === sowIdFromQuery);
            setSelectedSow(sowToSelect || null);
        }
    }, [sowIdFromQuery]);

    const handlePrint = () => {
        const printContent = document.getElementById(activeTab === 'sow-card' ? 'printable-sow-card' : 'printable-farrowing-form');
        if (printContent) {
            const printHtml = printContent.innerHTML;
            const printWindow = window.open('', '', 'height=800,width=1200');

            if(printWindow) {
                printWindow.document.write('<html><head><title>Imprimir Ficha</title>');
                printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
                 printWindow.document.write('<style>body { font-family: Arial, sans-serif; } @media print { .no-print { display: none; } } </style>');
                printWindow.document.write('</head><body style="padding: 20px;">');
                printWindow.document.write(printHtml);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();

                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500);
            }
        }
    };

    const handleExport = (formatType: 'pdf' | 'xlsx') => {
        if (activeTab === 'farrowing-form') {
            const doc = new jsPDF();
            autoTable(doc, {
                html: '#printable-farrowing-form',
                startY: 10,
                theme: 'plain',
                styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak' },
                didDrawCell: (data) => {
                    if (data.section === 'body') {
                        // Custom styling to mimic the form
                        if (data.row.index === 0 && data.column.index === 0) { // Header
                             doc.setFont('helvetica', 'bold');
                        }
                         // Add borders to all cells
                        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height);
                    }
                }
            });
            doc.save(`formulario_parto_${selectedSow?.id || 'nuevo'}.pdf`);
            return;
        }

        if (!selectedSow) return;

        const sowData = processSowHistory(selectedSow);
        
        if (formatType === 'pdf') {
            const doc = new jsPDF();
            doc.text(`Ficha de Vida - Cerda: ${selectedSow.id}`, 14, 15);
            doc.setFontSize(10);
            doc.text(`Raza: ${selectedSow.breed} | Estado: ${selectedSow.status}`, 14, 22);

            autoTable(doc, {
                head: [['Métrica', 'Valor']],
                body: Object.entries(sowData.kpis).map(([key, value]) => [key, typeof value === 'number' ? value.toFixed(2) : value]),
                startY: 30,
                theme: 'grid',
                headStyles: { fillColor: '#e07a5f' },
            });

            autoTable(doc, {
                head: [['Ciclo', 'Fecha Parto', 'NV', 'NM', 'Mom', 'Dest', 'Días Gest.', 'Días Lact.']],
                body: sowData.cycles.map(c => [c.cycle, c.farrowingDate ? format(parseISO(c.farrowingDate), 'dd/MM/yy') : '-', c.liveBorn, c.stillborn, c.mummified, c.pigletsWeaned, c.gestationDays || '-', c.lactationDays || '-']),
                startY: (doc as any).lastAutoTable.finalY + 10,
                theme: 'grid',
                headStyles: { fillColor: '#e07a5f' },
            });
            
            doc.save(`ficha_vida_${selectedSow.id}.pdf`);
        } else if (formatType === 'xlsx') {
            const kpiSheet = XLSX.utils.json_to_sheet(Object.entries(sowData.kpis).map(([key, value]) => ({ Métrica: key, Valor: value })));
            const cycleSheet = XLSX.utils.json_to_sheet(sowData.cycles.map(c => ({...c, farrowingDate: c.farrowingDate ? format(parseISO(c.farrowingDate), 'dd/MM/yyyy') : ''})));
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, kpiSheet, "KPIs");
            XLSX.utils.book_append_sheet(wb, cycleSheet, "Historial de Ciclos");
            XLSX.writeFile(wb, `ficha_vida_${selectedSow.id}.xlsx`);
        }
    };


    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
                    <div className="flex items-center gap-4">
                        <UserSearch className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold tracking-tight">Ficha de la Madre</h1>
                    </div>
                     <div className="flex flex-wrap items-center gap-2">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full sm:w-[250px] justify-between"
                                >
                                    {selectedSow
                                        ? allSows.find((sow) => sow.id === selectedSow.id)?.id
                                        : "Seleccionar madre..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Buscar por ID..." />
                                    <CommandList>
                                        <CommandEmpty>No se encontraron madres.</CommandEmpty>
                                        <CommandGroup>
                                            {allSows.map((sow) => (
                                                <CommandItem
                                                    key={sow.id}
                                                    value={sow.id}
                                                    onSelect={(currentValue) => {
                                                        const sowToSelect = allSows.find(s => s.id.toLowerCase() === currentValue.toLowerCase());
                                                        setSelectedSow(sowToSelect || null);
                                                        setOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedSow?.id === sow.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {sow.id}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                         <Button variant="outline" onClick={handlePrint} disabled={!selectedSow}>
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimir
                        </Button>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button disabled={!selectedSow}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Exportar
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onSelect={() => handleExport('pdf')}>Exportar a PDF</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleExport('xlsx')} disabled={activeTab === 'farrowing-form'}>Exportar a Excel (XLSX)</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                
                 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 print:hidden">
                        <TabsTrigger value="sow-card">Ficha de Vida</TabsTrigger>
                        <TabsTrigger value="farrowing-form">Formulario de Parto</TabsTrigger>
                    </TabsList>
                    <TabsContent value="sow-card">
                        {selectedSow ? (
                            <div id="printable-sow-card">
                                <SowProfileCard sow={selectedSow} />
                            </div>
                        ) : (
                            <Card className="flex items-center justify-center min-h-[400px] border-dashed">
                                <div className="text-center text-muted-foreground">
                                    <UserSearch className="h-16 w-16 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold">Seleccione una madre</h3>
                                    <p>Elija una madre de la lista para ver su hoja de vida completa.</p>
                                </div>
                            </Card>
                        )}
                    </TabsContent>
                    <TabsContent value="farrowing-form">
                         {selectedSow ? (
                            <div id="printable-farrowing-form">
                                <FarrowingRecordForm />
                            </div>
                         ) : (
                             <Card className="flex items-center justify-center min-h-[400px] border-dashed">
                                <div className="text-center text-muted-foreground">
                                    <UserSearch className="h-16 w-16 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold">Seleccione una madre</h3>
                                    <p>Primero debe seleccionar una madre para ver su formulario de parto.</p>
                                </div>
                            </Card>
                         )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

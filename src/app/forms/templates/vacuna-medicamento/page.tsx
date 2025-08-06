
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function VacunaMedicamentoForm() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Formulario de Vacuna/Medicamento</CardTitle>
        <CardDescription>Para recolección de datos de vacunas y medicamentos utilizados en los lotes.</CardDescription>
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
                    <TableHead>Producto</TableHead>
                    <TableHead>Tipo (Vacuna/Med)</TableHead>
                    <TableHead>Dosis/Animal</TableHead>
                    <TableHead>Nº Animales</TableHead>
                    <TableHead>Motivo</TableHead>
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
      </CardContent>
    </Card>
  );
}

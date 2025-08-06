
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function MovimientoLechonesForm() {
  return (
    <Card className="w-full">
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
  );
}

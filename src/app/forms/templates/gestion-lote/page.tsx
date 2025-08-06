
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function GestionLoteForm() {
  return (
    <Card className="w-full">
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
  );
}

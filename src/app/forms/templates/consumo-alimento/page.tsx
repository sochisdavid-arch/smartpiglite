
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ConsumoAlimentoForm() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Formulario de Consumo de Alimento</CardTitle>
        <CardDescription>Para recolección de consumo de alimento en lotes de precebo o ceba.</CardDescription>
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
            <div className="flex items-baseline gap-2">
                <p className="font-semibold w-24">Fase:</p>
                <div className="border-b flex-1"></div>
            </div>
             <div className="flex items-baseline gap-2">
                <p className="font-semibold w-24">Semana N°:</p>
                <div className="border-b flex-1"></div>
            </div>
        </div>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Día</TableHead>
                    <TableHead>Alimento</TableHead>
                    <TableHead>Cantidad (kg)</TableHead>
                    <TableHead>Observaciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: 7 }).map((_, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium h-12">Día {index + 1}</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
         <div className="mt-8">
            <h4 className="font-semibold mb-2">Observaciones Generales de la Semana:</h4>
            <div className="border-b h-24"></div>
        </div>
      </CardContent>
    </Card>
  );
}

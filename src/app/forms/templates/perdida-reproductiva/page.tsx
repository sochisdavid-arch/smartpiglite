
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function PerdidaReproductivaForm() {
  return (
    <Card className="w-full">
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
  );
}

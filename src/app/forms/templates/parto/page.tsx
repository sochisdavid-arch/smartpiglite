
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function PartoForm() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Formulario de Parto</CardTitle>
        <CardDescription>Para recolección de datos de partos.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>ID Madre</TableHead>
                    <TableHead>Fecha Parto</TableHead>
                    <TableHead>Nac. Vivos</TableHead>
                    <TableHead>Mortinatos</TableHead>
                    <TableHead>Momias</TableHead>
                    <TableHead>Peso Camada (kg)</TableHead>
                    <TableHead>Observaciones</TableHead>
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

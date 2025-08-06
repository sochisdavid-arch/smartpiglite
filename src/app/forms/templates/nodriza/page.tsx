
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function NodrizaForm() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Formulario de Nodrizas</CardTitle>
        <CardDescription>Para registrar y gestionar madres nodrizas y sus lechones.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>ID Madre Nodriza</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>ID Madre Original</TableHead>
                    <TableHead>Nº Lechones</TableHead>
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
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

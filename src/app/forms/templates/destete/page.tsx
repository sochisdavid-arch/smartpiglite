
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DesteteForm() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Formulario de Destete</CardTitle>
        <CardDescription>Para recolección de datos de destetes de camadas.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>ID Madre</TableHead>
                    <TableHead>Fecha Destete</TableHead>
                    <TableHead>Nº Lechones</TableHead>
                    <TableHead>Peso Total (kg)</TableHead>
                    <TableHead>Destino</TableHead>
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
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

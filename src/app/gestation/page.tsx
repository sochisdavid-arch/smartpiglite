import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Download, Filter, Search, QrCode } from 'lucide-react';

export default function GestationPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Gestación</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline"><Search className="mr-2 h-4 w-4" /> Búsqueda Avanzada</Button>
            <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filtros</Button>
            <Button variant="outline"><QrCode className="mr-2 h-4 w-4" /> Escanear QR</Button>
          </div>
        </div>

        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10">
            <TabsTrigger value="services">Servicios</TabsTrigger>
            <TabsTrigger value="tracking">Seguimiento</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnóstico</TabsTrigger>
            <TabsTrigger value="abortions">Abortos</TabsTrigger>
            <TabsTrigger value="movements">Movimientos</TabsTrigger>
            <TabsTrigger value="feeding">Alimentación</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
            <TabsTrigger value="treatments">Tratamientos</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Registro de Servicios e Inseminaciones</CardTitle>
                <CardDescription>Registre los detalles de la inseminación o monta natural de la cerda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sow-id">Selección de Cerda (ID, tatuaje, QR)</Label>
                    <Input id="sow-id" placeholder="Buscar cerda..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-date">Fecha del Servicio</Label>
                    <Input id="service-date" type="date" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Tipo de Servicio</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Seleccione un tipo" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="natural">Monta Natural</SelectItem>
                        <SelectItem value="artificial">Inseminación Artificial</SelectItem>
                        <SelectItem value="double">Doble Servicio</SelectItem>
                        <SelectItem value="failed">Servicio Fallido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="semen-dose">Dosis de Semen (Lote, Macho)</Label>
                    <Input id="semen-dose" placeholder="Lote-123, Macho-A42" />
                  </div>
                </div>
                 <div className="grid gap-4 md:grid-cols-2">
                   <div className="space-y-2">
                    <Label htmlFor="technician">Técnico</Label>
                    <Input id="technician" placeholder="Nombre del técnico" />
                  </div>
                  <div className="space-y-2">
                    <Label>Método Detección de Celo</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Seleccione un método" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visual">Visual</SelectItem>
                        <SelectItem value="boar_exposure">Exposición al Macho</SelectItem>
                        <SelectItem value="automated">Automatizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observations">Observaciones Clínicas</Label>
                  <Textarea id="observations" placeholder="Cualquier observación relevante..." />
                </div>
                <Button>Registrar Servicio</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Seguimiento de la Gestación</CardTitle>
                <CardDescription>Visualice el progreso y las fechas clave de la gestación de una cerda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-2">
                  <div className="flex-grow space-y-2">
                     <Label htmlFor="tracking-sow-id">Selección de Cerda</Label>
                    <Input id="tracking-sow-id" placeholder="Buscar cerda gestante..." />
                  </div>
                  <Button><Search className="h-4 w-4"/></Button>
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-semibold text-lg mb-4 text-center">Calendario Gestacional: Cerda PIG-001</h3>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">Día 35</p>
                    <p className="text-muted-foreground">de 114 (aprox.)</p>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="font-semibold">Implantación</p>
                      <p className="text-sm text-green-600">Completada (Día 12-18)</p>
                    </div>
                    <div>
                      <p className="font-semibold">Formación Fetal</p>
                      <p className="text-sm text-blue-600">En progreso (Día 25+)</p>
                    </div>
                     <div>
                      <p className="font-semibold">Parto Estimado</p>
                      <p className="text-sm">25 de Agosto, 2024</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="diagnosis" className="mt-6">
             <Card>
              <CardHeader>
                <CardTitle>Diagnóstico de Preñez</CardTitle>
                <CardDescription>Registre los resultados de ecografías u otros métodos de diagnóstico.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="diag-sow-id">Cerda</Label>
                      <Input id="diag-sow-id" placeholder="ID de la cerda"/>
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="diag-date">Fecha de Diagnóstico</Label>
                      <Input id="diag-date" type="date"/>
                    </div>
                 </div>
                 <div className="grid gap-4 md:grid-cols-2">
                   <div className="space-y-2">
                      <Label>Método Utilizado</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Seleccione método" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ultrasound">Ecografía</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Resultado</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Seleccione resultado" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pregnant">Preñada</SelectItem>
                          <SelectItem value="empty">Vacía</SelectItem>
                          <SelectItem value="doubtful">Dudosa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                 </div>
                 <Button>Registrar Diagnóstico</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle>Reportes de Gestación</CardTitle>
                        <CardDescription>Analice el rendimiento reproductivo de su granja.</CardDescription>
                    </div>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Exportar</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Métrica</TableHead>
                                <TableHead className="text-right">Valor Actual</TableHead>
                                <TableHead className="text-right">Ciclo Anterior</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Tasa de Concepción (%)</TableCell>
                                <TableCell className="text-right text-green-600 font-medium">92%</TableCell>
                                <TableCell className="text-right">89%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Tasa de Abortos (%)</TableCell>
                                <TableCell className="text-right text-red-600 font-medium">1.5%</TableCell>
                                <TableCell className="text-right">2.1%</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Intervalo Destete-Servicio (días)</TableCell>
                                <TableCell className="text-right text-green-600 font-medium">5.2</TableCell>
                                <TableCell className="text-right">5.8</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </TabsContent>

          {/* Placeholder for other tabs */}
          <TabsContent value="abortions" className="mt-6 text-center text-muted-foreground p-8"><p>Manejo de Abortos - Próximamente</p></TabsContent>
          <TabsContent value="movements" className="mt-6 text-center text-muted-foreground p-8"><p>Cambios de Grupo o Ubicación - Próximamente</p></TabsContent>
          <TabsContent value="feeding" className="mt-6 text-center text-muted-foreground p-8"><p>Alimentación en Gestación - Próximamente</p></TabsContent>
          <TabsContent value="alerts" className="mt-6 text-center text-muted-foreground p-8"><p>Alertas Automáticas y Programación - Próximamente</p></TabsContent>
          <TabsContent value="treatments" className="mt-6 text-center text-muted-foreground p-8"><p>Registro de Tratamientos - Próximamente</p></TabsContent>
          <TabsContent value="history" className="mt-6 text-center text-muted-foreground p-8"><p>Historial Reproductivo Individual - Próximamente</p></TabsContent>

        </Tabs>
      </div>
    </AppLayout>
  );
}


"use client";

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPigDiagnosis, type PigDoctorOutput } from '@/ai/flows/pig-doctor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Activity, GitCommitHorizontal, Lightbulb, Loader2, Syringe, AlertTriangle, ShieldCheck, Microscope, FlaskConical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';

const formSchema = z.object({
  symptoms: z.string().min(5, { message: "Describa al menos un síntoma." }),
  severity: z.enum(['Leve', 'Moderado', 'Grave']),
  age: z.string().min(1, { message: "La edad es requerida." }),
  stage: z.string().min(3, { message: "La etapa es requerida." }),
  environmentalConditions: z.string().min(5, { message: "Describa brevemente el ambiente." }),
  healthHistory: z.string().min(3, { message: "Indique el historial o 'Ninguno'." }),
  location: z.string().min(3, { message: "La ubicación es requerida." }),
  similarCases: z.coerce.number().min(0, { message: "Debe ser un número no negativo." }),
});

export function PigDoctorForm() {
  const [diagnosis, setDiagnosis] = useState<PigDoctorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: 'Diarrea acuosa, deshidratación, letargo.',
      severity: 'Moderado',
      age: '35 días',
      stage: 'Precebo',
      environmentalConditions: 'Sala con calefacción, densidad normal.',
      healthHistory: 'Vacunado contra Mycoplasma.',
      location: 'Sala de Precebo 2, Corral 5',
      similarCases: 4,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setDiagnosis(null);
    try {
      const result = await getPigDiagnosis(values);
      setDiagnosis(result);
    } catch (error) {
      console.error("Error al obtener el diagnóstico:", error);
      toast({
        variant: "destructive",
        title: "¡Oh no! Algo salió mal.",
        description: "Hubo un problema con la solicitud. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Información Clínica</CardTitle>
          <CardDescription>Complete los datos del caso para que la IA genere un análisis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Síntomas Clínicos</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ej: Tos, diarrea, fiebre, secreción nasal..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gravedad</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Seleccione gravedad" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Leve">Leve</SelectItem>
                          <SelectItem value="Moderado">Moderado</SelectItem>
                          <SelectItem value="Grave">Grave</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Edad</FormLabel>
                      <FormControl><Input placeholder="Ej: 35 días" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                    control={form.control}
                    name="stage"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Etapa Productiva</FormLabel>
                        <FormControl><Input placeholder="Ej: Ceba, Gestación..." {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="similarCases"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nº Casos Similares</FormLabel>
                        <FormControl><Input type="number" placeholder="Ej: 4" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
              </div>
               <FormField
                control={form.control}
                name="environmentalConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condiciones Ambientales</FormLabel>
                    <FormControl><Input placeholder="Ej: Temperatura 25°C, alta humedad" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="healthHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Historial Sanitario</FormLabel>
                    <FormControl><Input placeholder="Ej: Vacunado contra Circovirus" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación en Granja</FormLabel>
                    <FormControl><Input placeholder="Ej: Sala Maternidad 1, Corral 3" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analizando...</> : 'Obtener Diagnóstico IA'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {isLoading && (
            <Card className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center text-muted-foreground p-8">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <h3 className="text-xl font-semibold">Procesando Datos Clínicos</h3>
                    <p>PigDoctor está correlacionando síntomas, historial y datos ambientales para encontrar el diagnóstico más probable. Por favor espera.</p>
                </div>
            </Card>
        )}
        {diagnosis ? (
          <Card className="bg-secondary/50">
            <CardHeader>
              <CardTitle>Análisis de PigDoctor AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert variant={diagnosis.riskLevel === "Brote Potencial" ? "destructive" : "default"}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Riesgo Sanitario: {diagnosis.riskLevel}</AlertTitle>
                    <AlertDescription>Nivel de riesgo estimado basado en el número de casos y síntomas.</AlertDescription>
                </Alert>

                <div className="p-4 border rounded-lg bg-background">
                    <div className="flex items-start gap-4">
                        <Microscope className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold text-lg">Diagnóstico Presuntivo</h4>
                            <p className="text-xl font-bold text-primary">{diagnosis.presumptiveDiagnosis.diseaseName} ({diagnosis.presumptiveDiagnosis.probability}%)</p>
                            <p className="text-sm text-muted-foreground mt-1">{diagnosis.presumptiveDiagnosis.justification}</p>
                        </div>
                    </div>
                    <Separator className="my-4" />
                    <h5 className="font-semibold mb-2">Diagnósticos Diferenciales</h5>
                    <ul className="space-y-2 text-sm">
                        {diagnosis.differentialDiagnoses.map((d, i) => (
                           <li key={i} className="flex justify-between items-center">
                               <span>{d.diseaseName}</span>
                               <span className="font-mono text-xs p-1 bg-muted rounded-md">{d.probability}%</span>
                           </li>
                        ))}
                    </ul>
                </div>
                
                <Alert>
                    <Syringe className="h-4 w-4" />
                    <AlertTitle>Tratamiento Sugerido</AlertTitle>
                    <AlertDescription>
                        <p className="font-semibold">Medicación:</p>
                        <p>{diagnosis.recommendedTreatment.medication}</p>
                        <p className="font-semibold mt-2">Medidas Complementarias:</p>
                        <p>{diagnosis.recommendedTreatment.complementaryMeasures}</p>
                        <p className="font-semibold mt-2">Período de Retiro:</p>
                        <p>{diagnosis.recommendedTreatment.withdrawalPeriod}</p>
                    </AlertDescription>
                </Alert>

                <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>Recomendaciones Operativas</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc pl-5 space-y-1">
                            {diagnosis.operationalRecommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                        </ul>
                    </AlertDescription>
                </Alert>

                <Alert variant="destructive">
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>Aviso Importante</AlertTitle>
                    <AlertDescription>Este es un diagnóstico presuntivo y debe ser validado por un médico veterinario.</AlertDescription>
                </Alert>
            </CardContent>
          </Card>
        ) : !isLoading && (
             <Card className="flex h-full items-center justify-center border-dashed">
                <div className="flex flex-col items-center gap-4 text-center text-muted-foreground p-8">
                    <FlaskConical className="h-12 w-12" />
                    <h3 className="text-xl font-semibold">Esperando Datos del Caso</h3>
                    <p>Completa el formulario para que PigDoctor AI pueda analizar el caso y generar un diagnóstico presuntivo.</p>
                </div>
            </Card>
        )}
      </div>
    </div>
  );
}

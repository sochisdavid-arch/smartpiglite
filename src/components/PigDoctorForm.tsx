
"use client";

import { useState, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPigDiagnosis, type PigDoctorOutput } from '@/ai/flows/pig-doctor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, GitCommitHorizontal, Lightbulb, Loader2, Syringe, AlertTriangle, ShieldCheck, Microscope, FlaskConical, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  symptoms: z.string().min(10, { message: "Describa los síntomas con al menos 10 caracteres." }),
  photoDataUri: z.string().optional(),
});

export function PigDoctorForm() {
  const [diagnosis, setDiagnosis] = useState<PigDoctorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: 'Lechón de 35 días presenta diarrea acuosa amarillenta, deshidratación severa y letargo. No quiere comer. Se observan 4 casos similares en el mismo corral.',
      photoDataUri: undefined,
    },
  });

  const { setValue, watch } = form;
  const photoDataUri = watch('photoDataUri');

  const startCamera = async () => {
    try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCameraActive(true);
                setValue('photoDataUri', undefined); // Clear any uploaded photo
            }
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'La cámara no es soportada por este navegador.' });
        }
    } catch (error) {
        console.error('Error accessing camera:', error);
        toast({ variant: 'destructive', title: 'Acceso a la Cámara Denegado', description: 'Por favor, habilita los permisos de la cámara.' });
    }
  };

  const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('photoDataUri', reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setDiagnosis(null);

    let submissionValues = { ...values };

    if (isCameraActive && videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if(context) {
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUri = canvas.toDataURL('image/jpeg');
            submissionValues.photoDataUri = dataUri;
        }
        stopCamera();
    }
    
    try {
      const result = await getPigDiagnosis(submissionValues);
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

  const clearImage = () => {
      setValue('photoDataUri', undefined);
      if (isCameraActive) {
          stopCamera();
      }
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Información Clínica</CardTitle>
          <CardDescription>Describa los síntomas y adjunte una foto para que la IA genere un análisis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Síntomas, Historial y Observaciones</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describa todo lo que observa: síntomas, edad, etapa, condiciones del corral, etc." {...field} rows={8}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Foto (Opcional)</FormLabel>
                 <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={startCamera}>
                        <Camera className="mr-2 h-4 w-4" /> Cámara
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" /> Subir Foto
                    </Button>
                    <Input 
                        type="file" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*"
                    />
                </div>

                { (photoDataUri || isCameraActive) && (
                    <div className="relative aspect-video w-full">
                        {isCameraActive ? (
                            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover rounded-md bg-muted" />
                        ) : photoDataUri ? (
                            <img src={photoDataUri} alt="Vista previa" className="w-full h-full object-cover rounded-md" />
                        ) : null}
                         <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 rounded-full"
                            onClick={clearImage}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                )}
              </div>
              
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

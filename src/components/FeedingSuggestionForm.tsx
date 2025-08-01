
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFeedingSuggestion, type FeedingSuggestionOutput } from '@/ai/flows/feeding-suggestion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Loader2, Wheat, Pill } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


const formSchema = z.object({
  pigAge: z.coerce.number().min(1, { message: "La edad debe ser de al menos 1 semana." }),
  pigWeight: z.coerce.number().min(1, { message: "El peso debe ser un número positivo." }),
  pigBreed: z.string().min(2, { message: "La raza es requerida." }),
  currentFeed: z.string().min(2, { message: "El alimento actual es requerido." }),
  environmentalConditions: z.string().min(10, { message: "Por favor describe las condiciones (mín. 10 caracteres)." }),
});

export function FeedingSuggestionForm() {
  const [suggestion, setSuggestion] = useState<FeedingSuggestionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pigAge: 8,
      pigWeight: 25,
      pigBreed: 'Duroc',
      currentFeed: 'Pellets de inicio',
      environmentalConditions: 'Interior, establo con temperatura controlada a 22°C.',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await getFeedingSuggestion(values);
      setSuggestion(result);
    } catch (error) {
      console.error("Error al obtener la sugerencia de alimentación:", error);
      toast({
        variant: "destructive",
        title: "¡Oh no! Algo salió mal.",
        description: "Hubo un problema con tu solicitud. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Información del Cerdo</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="pigAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Edad (semanas)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="ej. 8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pigWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="ej. 25" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="pigBreed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raza</FormLabel>
                    <FormControl>
                      <Input placeholder="ej. Duroc" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentFeed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alimento Actual</FormLabel>
                    <FormControl>
                      <Input placeholder="ej. Pellets de inicio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="environmentalConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condiciones Ambientales</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe las condiciones de vida del cerdo..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Incluye temperatura, tipo de alojamiento, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Obteniendo Sugerencia...
                  </>
                ) : (
                  'Obtener Sugerencia de IA'
                )}
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
                    <h3 className="text-xl font-semibold">Generando Sugerencias</h3>
                    <p>Nuestra IA está analizando los datos para proporcionar el mejor plan de alimentación para tu cerdo. Por favor espera un momento.</p>
                </div>
            </Card>
        )}
        {suggestion ? (
          <Card className="bg-secondary/50">
            <CardHeader>
              <CardTitle>Recomendación de la IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Wheat className="h-4 w-4" />
                <AlertTitle>Tipo de Alimento Sugerido</AlertTitle>
                <AlertDescription>{suggestion.suggestedFeedType}</AlertDescription>
              </Alert>
               <Alert>
                <Pill className="h-4 w-4" />
                <AlertTitle>Cantidad de Alimento Sugerida</AlertTitle>
                <AlertDescription>{suggestion.suggestedFeedQuantity}</AlertDescription>
              </Alert>
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Recomendaciones Adicionales</AlertTitle>
                <AlertDescription>{suggestion.additionalRecommendations}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : !isLoading && (
             <Card className="flex h-full items-center justify-center border-dashed">
                <div className="flex flex-col items-center gap-4 text-center text-muted-foreground p-8">
                    <Lightbulb className="h-12 w-12" />
                    <h3 className="text-xl font-semibold">Esperando Datos</h3>
                    <p>Completa el formulario para recibir una sugerencia de alimentación para tu cerdo impulsada por IA.</p>
                </div>
            </Card>
        )}
      </div>
    </div>
  );
}

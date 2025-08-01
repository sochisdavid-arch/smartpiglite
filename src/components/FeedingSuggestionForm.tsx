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
  pigAge: z.coerce.number().min(1, { message: "Age must be at least 1 week." }),
  pigWeight: z.coerce.number().min(1, { message: "Weight must be a positive number." }),
  pigBreed: z.string().min(2, { message: "Breed is required." }),
  currentFeed: z.string().min(2, { message: "Current feed is required." }),
  environmentalConditions: z.string().min(10, { message: "Please describe conditions (min 10 chars)." }),
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
      currentFeed: 'Starter pellets',
      environmentalConditions: 'Indoor, temperature-controlled barn at 22°C.',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await getFeedingSuggestion(values);
      setSuggestion(result);
    } catch (error) {
      console.error("Error getting feeding suggestion:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "There was a problem with your request. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Pig Information</CardTitle>
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
                      <FormLabel>Age (weeks)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 8" {...field} />
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
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 25" {...field} />
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
                    <FormLabel>Breed</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Duroc" {...field} />
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
                    <FormLabel>Current Feed</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Starter pellets" {...field} />
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
                    <FormLabel>Environmental Conditions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the pig's living conditions..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include temperature, housing type, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Suggestion...
                  </>
                ) : (
                  'Get AI Suggestion'
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
                    <h3 className="text-xl font-semibold">Generating Suggestions</h3>
                    <p>Our AI is analyzing the data to provide the best feeding plan for your pig. Please wait a moment.</p>
                </div>
            </Card>
        )}
        {suggestion ? (
          <Card className="bg-secondary/50">
            <CardHeader>
              <CardTitle>AI Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Wheat className="h-4 w-4" />
                <AlertTitle>Suggested Feed Type</AlertTitle>
                <AlertDescription>{suggestion.suggestedFeedType}</AlertDescription>
              </Alert>
               <Alert>
                <Pill className="h-4 w-4" />
                <AlertTitle>Suggested Feed Quantity</AlertTitle>
                <AlertDescription>{suggestion.suggestedFeedQuantity}</AlertDescription>
              </Alert>
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Additional Recommendations</AlertTitle>
                <AlertDescription>{suggestion.additionalRecommendations}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : !isLoading && (
             <Card className="flex h-full items-center justify-center border-dashed">
                <div className="flex flex-col items-center gap-4 text-center text-muted-foreground p-8">
                    <Lightbulb className="h-12 w-12" />
                    <h3 className="text-xl font-semibold">Awaiting Input</h3>
                    <p>Fill out the form on the left to receive an AI-powered feeding suggestion for your pig.</p>
                </div>
            </Card>
        )}
      </div>
    </div>
  );
}

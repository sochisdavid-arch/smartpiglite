import { AppLayout } from '@/components/AppLayout';
import { FeedingSuggestionForm } from '@/components/FeedingSuggestionForm';

export default function FeedingPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Sugerencias de Alimentación con IA</h1>
        </div>
        <p className="text-muted-foreground">
          Basado en los datos de entrada de todos los parámetros sobre alimentación, nuestra IA hará sugerencias inteligentes sobre tipos de alimentación y alimentos para evitar enfermedades y aumentar la cosecha.
        </p>
        <FeedingSuggestionForm />
      </div>
    </AppLayout>
  );
}

import { AppLayout } from '@/components/AppLayout';
import { FeedingSuggestionForm } from '@/components/FeedingSuggestionForm';

export default function FeedingPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">AI Feeding Suggestions</h1>
        </div>
        <p className="text-muted-foreground">
          Based on data inputs of all parameters about feeding, our AI will make intelligent suggestions about types of feeding and food to avoid illness and increase harvest.
        </p>
        <FeedingSuggestionForm />
      </div>
    </AppLayout>
  );
}

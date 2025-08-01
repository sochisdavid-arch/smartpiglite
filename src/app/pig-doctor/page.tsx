
import { AppLayout } from '@/components/AppLayout';
import { PigDoctorForm } from '@/components/PigDoctorForm';
import { Stethoscope } from 'lucide-react';

export default function PigDoctorPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Stethoscope className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">PigDoctor AI</h1>
        </div>
        <p className="text-muted-foreground max-w-3xl">
          Utilice esta herramienta de diagnóstico con IA para obtener análisis presuntivos basados en síntomas y datos clínicos.
          Proporcione la información más detallada posible para recibir la evaluación más precisa.
          <span className="font-semibold text-destructive block mt-2">Recuerde: esta herramienta es un asistente y no reemplaza el criterio de un médico veterinario profesional.</span>
        </p>
        <PigDoctorForm />
      </div>
    </AppLayout>
  );
}

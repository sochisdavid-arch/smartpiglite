
"use client";

import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ClipboardList } from 'lucide-react';
import Link from 'next/link';

const forms = [
    { title: "Formulario de Servicio", description: "Registrar una inseminación o monta natural con fecha y reproductor.", href: "/gestation", disabled: false },
    { title: "Formulario de Parto", description: "Recolectar todos los datos de un nuevo parto.", href: "/gestation", disabled: false },
    { title: "Formulario de Destete", description: "Registrar los detalles de un destete de camada.", href: "/lactation", disabled: false },
    { title: "Pérdida Reproductiva", description: "Anotar abortos, repeticiones de celo u otras pérdidas.", href: "/gestation", disabled: false },
    { title: "Muerte/Movimiento de Lechones", description: "Registrar bajas y transferencias de lechones en maternidad.", href: "/lactation", disabled: false },
    { title: "Formulario de Nodrizas", description: "Registrar y gestionar madres nodrizas.", href: "/lactation", disabled: false },
    { title: "Consumo de Alimento (Lote)", description: "Registrar el consumo de alimento para lotes de precebo o ceba.", href: "/precebo", disabled: false },
    { title: "Gestión de Lotes", description: "Registrar muertes, transferencias o ventas de lechones de un lote.", href: "/precebo", disabled: false },
    { title: "Vacuna/Medicamento (Lote)", description: "Aplicar vacunas o medicamentos a un lote completo.", href: "/precebo", disabled: false },
];

const FormCard = ({ title, description, href, disabled }: { title: string, description: string, href: string, disabled?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow flex flex-col">
        <CardHeader className="flex-grow">
            <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{title}</CardTitle>
                <FileText className="h-6 w-6 text-muted-foreground"/>
            </div>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            <Button asChild disabled={disabled} className="w-full">
                <Link href={href}>Ir al Formulario</Link>
            </Button>
        </CardContent>
    </Card>
)

export default function FormsPage() {
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <ClipboardList className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">Formularios de Registro</h1>
                </div>
                <p className="text-muted-foreground max-w-3xl">
                    Utilice estos formularios para registrar eventos y datos importantes de la granja de manera rápida y sencilla.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {forms.map(form => (
                       <FormCard key={form.title} {...form} />
                   ))}
                </div>
            </div>
        </AppLayout>
    );
}

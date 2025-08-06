
"use client";

import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ClipboardList } from 'lucide-react';
import Link from 'next/link';

const forms = [
    { title: "Registro de Parto", description: "Registrar un nuevo parto y los detalles de la camada.", href: "/gestation", disabled: true },
    { title: "Registro de Servicio", description: "Anotar una inseminación o monta natural.", href: "/gestation", disabled: true },
    { title: "Registro de Destete", description: "Registrar un destete, peso y número de lechones.", href: "/lactation", disabled: true },
    { title: "Mortalidad de Lechones", description: "Registrar la muerte de lechones y su causa.", href: "/lactation", disabled: true },
    { title: "Entrada de Alimento", description: "Registrar una nueva compra de alimento.", href: "/inventory/alimentos", disabled: true },
    { title: "Nuevo Animal", description: "Añadir una nueva hembra o macho al sistema.", href: "/gestation", disabled: true },
];

const FormCard = ({ title, description, href, disabled }: { title: string, description: string, href: string, disabled?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
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

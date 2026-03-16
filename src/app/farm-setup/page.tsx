
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { useToast } from '@/hooks/use-toast';
import { Globe, Building, Phone, Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { ref, set } from 'firebase/database';

const FARM_INFO_KEY = 'farmInformation';

export default function FarmSetupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const user = auth.currentUser;
        
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Error de autenticación',
                description: 'Debes estar conectado para configurar tu granja.',
            });
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData(event.currentTarget);
        const farmInfo = {
            farmName: formData.get('farmName') as string,
            location: formData.get('location') as string,
            country: formData.get('country') as string,
            phone: formData.get('phone') as string,
            setupCompleted: true,
            setupDate: new Date().toISOString(),
        };

        try {
            // Guardar en Firebase para persistencia entre dispositivos
            await set(ref(db, `users/${user.uid}/farmInfo`), farmInfo);
            
            // Guardar en localStorage para acceso rápido sin red
            localStorage.setItem(FARM_INFO_KEY, JSON.stringify(farmInfo));

            toast({
                title: '¡Granja Configurada!',
                description: 'La información de tu granja ha sido guardada correctamente.',
            });
            
            router.push('/dashboard');
        } catch (error) {
            console.error("Error saving farm info:", error);
            toast({
                variant: 'destructive',
                title: 'Error al guardar',
                description: 'No pudimos guardar la información. Por favor, inténtalo de nuevo.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="mx-auto w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="mb-4 flex justify-center">
                        <Logo className="h-12 w-12" />
                    </div>
                    <CardTitle className="text-2xl font-bold">¡Bienvenido a SmartPig!</CardTitle>
                    <CardDescription>Solo un paso más. Cuéntanos sobre tu granja para personalizar tu experiencia.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="farmName">Nombre de la Granja</Label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input id="farmName" name="farmName" placeholder="Ej: Granja El Porvenir" required className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Ubicación (Ciudad/Municipio)</Label>
                             <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input id="location" name="location" placeholder="Ej: Anolaima" required className="pl-10" />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="country">País</Label>
                            <Input id="country" name="country" placeholder="Ej: Colombia" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono de Contacto</Label>
                             <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input id="phone" name="phone" type="tel" placeholder="Ej: 3101234567" required className="pl-10" />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                            ) : (
                                'Guardar y Empezar a Usar SmartPig'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

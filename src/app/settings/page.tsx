
"use client";

import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight mb-6">Configuración</h1>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notificaciones</CardTitle>
                            <CardDescription>Gestiona cómo recibes las notificaciones de la aplicación.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="email-notifications">Notificaciones por correo electrónico</Label>
                                <Switch id="email-notifications" />
                            </div>
                             <div className="flex items-center justify-between">
                                <Label htmlFor="push-notifications">Notificaciones push</Label>
                                <Switch id="push-notifications" disabled/>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Apariencia</CardTitle>
                             <CardDescription>Personaliza la apariencia de la aplicación.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex items-center justify-between">
                                <Label htmlFor="dark-mode">Modo Oscuro</Label>
                                <Switch id="dark-mode" />
                            </div>
                        </CardContent>
                    </Card>
                    <Button>Guardar Preferencias</Button>
                </div>
            </div>
        </AppLayout>
    );
}

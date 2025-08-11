
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfilePage() {
    const [profileImage, setProfileImage] = React.useState<string | null>("https://placehold.co/100x100.png");
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight mb-6">Perfil de Usuario</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Información de la Cuenta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={profileImage || undefined} />
                                <AvatarFallback>A</AvatarFallback>
                            </Avatar>
                            <Input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                                accept="image/*"
                            />
                            <Button variant="outline" onClick={handleButtonClick}>Cambiar foto</Button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input id="name" defaultValue="Admin de la Granja" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input id="email" type="email" defaultValue="admin@smartpig.com" readOnly />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Contraseña Actual</Label>
                                <Input id="current-password" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">Nueva Contraseña</Label>
                                <Input id="new-password" type="password" />
                            </div>
                        </div>
                         <Button>Guardar Cambios</Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

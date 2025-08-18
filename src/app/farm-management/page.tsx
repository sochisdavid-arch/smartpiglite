
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Building, Trash2, Edit } from 'lucide-react';
import { useFarms, Farm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';

export default function FarmManagementPage() {
    const { farms, addFarm, updateFarm, deleteFarm, loading } = useFarms();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingFarm, setEditingFarm] = React.useState<Farm | null>(null);

    const handleOpenDialog = (farm?: Farm) => {
        setEditingFarm(farm || null);
        setIsDialogOpen(true);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const farmData = {
            name: formData.get('name') as string,
            location: formData.get('location') as string,
        };

        try {
            if (editingFarm) {
                await updateFarm({ ...editingFarm, ...farmData });
                toast({ title: "Granja actualizada", description: `Los datos de ${farmData.name} han sido guardados.` });
            } else {
                await addFarm(farmData);
                toast({ title: "Granja creada", description: `${farmData.name} ha sido añadida a tu lista.` });
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la granja.' });
        }
    };
    
    const handleDelete = async (farmId: string) => {
        if(confirm('¿Estás seguro de que quieres eliminar esta granja? Esta acción no se puede deshacer.')) {
            try {
                await deleteFarm(farmId);
                toast({ title: 'Granja eliminada' });
            } catch (error) {
                console.error(error);
                toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar la granja.' });
            }
        }
    }

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Gestionar Granjas</h1>
                    <Button onClick={() => handleOpenDialog()}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Agregar Granja
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Mis Granjas</CardTitle>
                        <CardDescription>Aquí puedes ver, editar y eliminar las granjas que administras.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading && <p>Cargando granjas...</p>}
                        {!loading && farms.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                <p>No tienes ninguna granja registrada.</p>
                                <p>Haz clic en "Agregar Granja" para empezar.</p>
                            </div>
                        )}
                        {!loading && farms.map(farm => (
                            <div key={farm.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <Building className="h-8 w-8 text-primary"/>
                                    <div>
                                        <p className="font-bold">{farm.name}</p>
                                        <p className="text-sm text-muted-foreground">{farm.location}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                     <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(farm)}>
                                        <Edit className="h-4 w-4"/>
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(farm.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingFarm ? 'Editar' : 'Agregar Nueva'} Granja</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} id="farm-form" className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre de la Granja</Label>
                                <Input id="name" name="name" required defaultValue={editingFarm?.name}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Ubicación (Ciudad/Municipio)</Label>
                                <Input id="location" name="location" required defaultValue={editingFarm?.location}/>
                            </div>
                        </form>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" form="farm-form">{editingFarm ? 'Guardar Cambios' : 'Crear Granja'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

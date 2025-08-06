"use client";

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, UserSearch, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SowProfileCard, type SowData } from '@/components/SowProfileCard';

interface Pig {
    id: string;
    breed: string;
    birthDate: string;
    status: string;
    gender: string;
    events: any[]; // Using 'any' for simplicity, should be typed Event[]
}


export default function SowCardPage() {
    const searchParams = useSearchParams();
    const sowIdFromQuery = searchParams.get('sowId');
    
    const [allSows, setAllSows] = React.useState<Pig[]>([]);
    const [selectedSow, setSelectedSow] = React.useState<Pig | null>(null);
    const [open, setOpen] = React.useState(false);


    React.useEffect(() => {
        const pigsFromStorage = localStorage.getItem('pigs');
        const allPigs: Pig[] = pigsFromStorage ? JSON.parse(pigsFromStorage) : [];
        const femalePigs = allPigs.filter(p => p.gender === 'Hembra');
        setAllSows(femalePigs);

        if (sowIdFromQuery) {
            const sowToSelect = femalePigs.find(s => s.id === sowIdFromQuery);
            setSelectedSow(sowToSelect || null);
        }
    }, [sowIdFromQuery]);

    const handlePrint = () => {
        const printContent = document.getElementById('printable-sow-card')?.innerHTML;
        if(printContent) {
             const originalContent = document.body.innerHTML;
             document.body.innerHTML = printContent;
             window.print();
             document.body.innerHTML = originalContent;
             window.location.reload(); // Reload to restore styles and event listeners
        }
    };


    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <UserSearch className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold tracking-tight">Ficha de la Madre</h1>
                    </div>
                     <div className="flex gap-2">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full sm:w-[250px] justify-between"
                                >
                                    {selectedSow
                                        ? allSows.find((sow) => sow.id === selectedSow.id)?.id
                                        : "Seleccionar madre..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Buscar por ID..." />
                                    <CommandList>
                                        <CommandEmpty>No se encontraron madres.</CommandEmpty>
                                        <CommandGroup>
                                            {allSows.map((sow) => (
                                                <CommandItem
                                                    key={sow.id}
                                                    value={sow.id}
                                                    onSelect={(currentValue) => {
                                                        const sowToSelect = allSows.find(s => s.id.toLowerCase() === currentValue.toLowerCase());
                                                        setSelectedSow(sowToSelect || null);
                                                        setOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedSow?.id === sow.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {sow.id}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                         <Button onClick={handlePrint} disabled={!selectedSow}>
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimir / Exportar
                        </Button>
                    </div>
                </div>

                {selectedSow ? (
                     <div id="printable-sow-card">
                        <SowProfileCard sow={selectedSow} />
                    </div>
                ) : (
                    <Card className="flex items-center justify-center min-h-[400px] border-dashed">
                        <div className="text-center text-muted-foreground">
                            <UserSearch className="h-16 w-16 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">Seleccione una madre</h3>
                            <p>Elija una madre de la lista para ver su hoja de vida completa.</p>
                        </div>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

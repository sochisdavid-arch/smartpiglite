
"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface NurseryBatch {
    id: string;
    creationDate: string;
    pigletCount: number;
    avgWeight: number;
    avgAge: number;
    sows: string[];
    status: 'Activo' | 'Finalizado';
}

export default function LotePreceboPage() {
    const router = useRouter();
    const params = useParams();
    const loteId = params.loteId as string;

    const [lote, setLote] = React.useState<NurseryBatch | null>(null);

    React.useEffect(() => {
        if (loteId) {
            const storedBatches = localStorage.getItem('nurseryBatches');
            if (storedBatches) {
                const batchData = JSON.parse(storedBatches);
                const foundBatch = batchData[loteId];
                if (foundBatch) {
                    setLote(foundBatch);
                }
            }
        }
    }, [loteId]);
    
    if (!lote) {
        return (
            <AppLayout>
                <div className="flex justify-center items-center h-full">
                    <p>Cargando datos del lote...</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push('/precebo')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Registro de Lote Precebo: {lote.id}</h1>
                </div>
            </div>
        </AppLayout>
    );
}

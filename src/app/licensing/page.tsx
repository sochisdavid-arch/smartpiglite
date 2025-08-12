
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { getLicenseInfo, setSelectedPlan } from '@/lib/license';
import Link from 'next/link';

const tiers = [
    { id: 'tier-a', label: '1 - 50 Madres', basePrice: 5, sowLimit: 50 },
    { id: 'tier-b', label: '51 - 100 Madres', basePrice: 10, sowLimit: 100 },
    { id: 'tier-c', label: '101 - 200 Madres', basePrice: 18, sowLimit: 200 },
    { id: 'tier-d', label: '201+ Madres', basePrice: 30, sowLimit: Infinity },
];

const billingCycles = [
    { id: 'monthly', label: 'Mensual', months: 1, discount: 0, tag: '' },
    { id: 'quarterly', label: 'Trimestral', months: 3, discount: 0.07, tag: 'Ahorra 7%' },
    { id: 'semiannual', label: 'Semestral', months: 6, discount: 0.12, tag: 'Ahorra 12%' },
    { id: 'annual', label: 'Anual', months: 12, discount: 0.25, tag: 'Ahorra 25%' },
];

const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

// Objeto para almacenar los links de pago
const paymentLinks: Record<string, Record<string, string>> = {
    'tier-a': {
        'monthly': 'https://biz.payulatam.com/L0faca4D7ABAB27',
        // TODO: Reemplazar con los links de pago reales de PayU para cada ciclo
        'quarterly': 'https://biz.payulatam.com/L0faca4D7ABAB27',
        'semiannual': 'https://biz.payulatam.com/L0faca4D7ABAB27',
        'annual': 'https://biz.payulatam.com/L0faca4D7ABAB27',
    },
    'tier-b': {
        'monthly': 'https://biz.payulatam.com/link_de_pago_ejemplo_B_M',
        'quarterly': 'https://biz.payulatam.com/link_de_pago_ejemplo_B_Q',
        'semiannual': 'https://biz.payulatam.com/link_de_pago_ejemplo_B_S',
        'annual': 'https://biz.payulatam.com/link_de_pago_ejemplo_B_A',
    },
    'tier-c': {
        'monthly': 'https://biz.payulatam.com/link_de_pago_ejemplo_C_M',
        'quarterly': 'https://biz.payulatam.com/link_de_pago_ejemplo_C_Q',
        'semiannual': 'https://biz.payulatam.com/link_de_pago_ejemplo_C_S',
        'annual': 'https://biz.payulatam.com/link_de_pago_ejemplo_C_A',
    },
    'tier-d': {
        'monthly': 'https://biz.payulatam.com/link_de_pago_ejemplo_D_M',
        'quarterly': 'https://biz.payulatam.com/link_de_pago_ejemplo_D_Q',
        'semiannual': 'https://biz.payulatam.com/link_de_pago_ejemplo_D_S',
        'annual': 'https://biz.payulatam.com/link_de_pago_ejemplo_D_A',
    },
};

export default function LicensingPage() {
    const router = useRouter();
    const [selectedTierId, setSelectedTierId] = React.useState(tiers[0].id);
    const [selectedCycleId, setSelectedCycleId] = React.useState(billingCycles[0].id);
    const [licenseExists, setLicenseExists] = React.useState(false);

    React.useEffect(() => {
        const license = getLicenseInfo();
        if (license) {
            setLicenseExists(true);
        }
    }, []);

    const selectedTier = React.useMemo(() => tiers.find(t => t.id === selectedTierId)!, [selectedTierId]);
    const selectedCycle = React.useMemo(() => billingCycles.find(c => c.id === selectedCycleId)!, [selectedCycleId]);

    const pricing = React.useMemo(() => {
        const baseTotal = selectedTier.basePrice * selectedCycle.months;
        const totalDiscount = baseTotal * selectedCycle.discount;
        const finalPrice = baseTotal - totalDiscount;
        const effectiveMonthly = finalPrice / selectedCycle.months;

        return {
            finalPrice,
            effectiveMonthly,
        };
    }, [selectedTier, selectedCycle]);
    
    const handlePlanSelection = () => {
        setSelectedPlan(selectedTier.id, selectedCycle.months);
    };

    const paymentUrl = paymentLinks[selectedTierId]?.[selectedCycleId] || 'https://payu.com';

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <main className="w-full max-w-4xl mx-auto">
                 {licenseExists && (
                    <div className="mb-6">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver al Panel de Control
                            </Link>
                        </Button>
                    </div>
                )}
                <div className="text-center mb-10">
                    <Logo className="h-16 w-16 mx-auto mb-4 text-primary" />
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">Elige tu Plan</h1>
                    <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
                        Selecciona tu plan, realiza el pago y luego activa tu licencia usando el código de transacción que recibirás en tu correo.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Tier Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle>1. ¿Cuántas madres productivas tienes en tu granja?</CardTitle>
                                <CardDescription>Selecciona el rango que se ajuste al tamaño de tu operación.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup value={selectedTierId} onValueChange={setSelectedTierId} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {tiers.map((tier) => (
                                        <Label key={tier.id} htmlFor={tier.id} className={cn(
                                            "flex items-center justify-between rounded-lg border-2 p-4 cursor-pointer transition-all",
                                            selectedTierId === tier.id ? "border-primary bg-primary/5" : "border-gray-200 bg-white hover:bg-gray-50"
                                        )}>
                                            <span className="font-semibold">{tier.label}</span>
                                            <RadioGroupItem value={tier.id} id={tier.id} className="sr-only"/>
                                            {selectedTierId === tier.id && <CheckCircle className="h-5 w-5 text-primary" />}
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </CardContent>
                        </Card>

                        {/* Billing Cycle Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle>2. Elige tu ciclo de facturación</CardTitle>
                                <CardDescription>Ahorra más con planes a largo plazo.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup value={selectedCycleId} onValueChange={setSelectedCycleId} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {billingCycles.map((cycle) => (
                                        <Label key={cycle.id} htmlFor={cycle.id} className={cn(
                                            "relative flex flex-col rounded-lg border-2 p-4 cursor-pointer transition-all",
                                            selectedCycleId === cycle.id ? "border-primary bg-primary/5" : "border-gray-200 bg-white hover:bg-gray-50"
                                        )}>
                                            {cycle.tag && <div className="absolute -top-3 right-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">{cycle.tag}</div>}
                                            <div className="flex justify-between items-center w-full">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-lg">{cycle.label}</span>
                                                    <span className="text-sm text-gray-500">{cycle.months} mes{cycle.months > 1 ? 'es' : ''}</span>
                                                </div>
                                                <RadioGroupItem value={cycle.id} id={cycle.id} className="sr-only"/>
                                                 {selectedCycleId === cycle.id && <CheckCircle className="h-5 w-5 text-primary" />}
                                            </div>
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Pricing Summary */}
                    <div className="lg:col-span-1 sticky top-8">
                        <Card className="shadow-lg">
                            <CardHeader className="bg-gray-50">
                                <CardTitle className="text-center text-primary">Resumen de tu Suscripción</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-gray-600">Plan:</span>
                                    <span className="font-bold">{selectedTier.label}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-gray-600">Ciclo:</span>
                                    <span className="font-bold">{selectedCycle.label}</span>
                                </div>
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Pagas hoy</span>
                                        <span className="text-2xl font-bold text-gray-900">{formatCurrency(pricing.finalPrice)}</span>
                                    </div>
                                    <p className="text-right text-sm text-gray-500">
                                        Efectivo a {formatCurrency(pricing.effectiveMonthly)} / mes
                                    </p>
                                </div>
                                <div className="space-y-4 pt-4">
                                     <Button size="lg" className="w-full" asChild>
                                        <Link href={paymentUrl} target="_blank" onClick={handlePlanSelection}>
                                            Proceder al Pago
                                        </Link>
                                    </Button>
                                </div>
                                <p className="text-xs text-center text-gray-500 mt-4">
                                   Serás redirigido a la página segura de PayU para completar tu compra.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

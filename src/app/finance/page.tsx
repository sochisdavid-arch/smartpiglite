
"use client";

import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { getFinancialSummary, FinancialTransaction } from '@/lib/finance';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '$0';
    return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
};

export default function FinancePage() {
    const [transactions, setTransactions] = React.useState<FinancialTransaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = React.useState<FinancialTransaction[]>([]);
    const [summary, setSummary] = React.useState({ income: 0, expenses: 0, balance: 0 });
    const [monthlyData, setMonthlyData] = React.useState<any[]>([]);
    const [filter, setFilter] = React.useState('all');

    React.useEffect(() => {
        const { transactions: allTransactions, summary: financialSummary, monthlyData: financialMonthlyData } = getFinancialSummary();
        setTransactions(allTransactions);
        setFilteredTransactions(allTransactions);
        setSummary(financialSummary);
        setMonthlyData(financialMonthlyData);
    }, []);

    React.useEffect(() => {
        if (filter === 'all') {
            setFilteredTransactions(transactions);
        } else {
            setFilteredTransactions(transactions.filter(t => t.type === filter));
        }
    }, [filter, transactions]);

    return (
        <AppLayout>
            <div className="flex flex-col gap-8">
                <h1 className="text-3xl font-bold tracking-tight">Análisis Financiero</h1>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.income)}</div>
                            <p className="text-xs text-muted-foreground">Total de ingresos registrados</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Egresos Totales</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.expenses)}</div>
                            <p className="text-xs text-muted-foreground">Total de egresos registrados</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Saldo Actual</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(summary.balance)}</div>
                            <p className="text-xs text-muted-foreground">Ingresos - Egresos</p>
                        </CardContent>
                    </Card>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Flujo de Caja Mensual</CardTitle>
                        <CardDescription>Comparativo de ingresos y egresos por mes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis 
                                    stroke="hsl(var(--muted-foreground))" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(value) => formatCurrency(value as number)}
                                />
                                <Tooltip
                                    contentStyle={{
                                      backgroundColor: 'hsl(var(--card))',
                                      borderColor: 'hsl(var(--border))',
                                    }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Legend iconSize={10}/>
                                <Bar dataKey="ingresos" fill="hsl(var(--chart-2))" name="Ingresos" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="egresos" fill="hsl(var(--chart-5))" name="Egresos" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Historial de Transacciones</CardTitle>
                                <CardDescription>Lista de todos los movimientos financieros registrados.</CardDescription>
                            </div>
                            <Select value={filter} onValueChange={setFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filtrar por tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas</SelectItem>
                                    <SelectItem value="income">Ingresos</SelectItem>
                                    <SelectItem value="expense">Egresos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell>{format(t.date, 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{t.description}</div>
                                            <div className="text-sm text-muted-foreground">{t.category}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={t.type === 'income' ? 'default' : 'destructive'}>
                                                {t.type === 'income' ? 'Ingreso' : 'Egreso'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={`text-right font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(t.amount)}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">No hay transacciones registradas.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

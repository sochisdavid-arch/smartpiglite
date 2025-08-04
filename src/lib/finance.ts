
"use client";

import { format, getMonth, getYear, parseISO, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

export interface FinancialTransaction {
    id: string;
    date: Date;
    description: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
}

export const getFinancialSummary = () => {
    let transactions: FinancialTransaction[] = [];
    
    // 1. Get Income from liquidated batches (precebo & ceba)
    const liquidatedPreceboReports = JSON.parse(localStorage.getItem('liquidatedPreceboReports') || '[]');
    const liquidatedCebaReports = JSON.parse(localStorage.getItem('liquidatedCebaReports') || '[]');
    
    [...liquidatedPreceboReports, ...liquidatedCebaReports].forEach(report => {
        if (report.liquidationReason === 'Venta de lote' && report.finalEvent?.saleValue > 0) {
             transactions.push({
                id: `sale-batch-${report.batchId}`,
                date: parseISO(report.endDate),
                description: `Venta de Lote ${report.batchId}`,
                type: 'income',
                category: `Venta de Lote ${report.batchId.includes('CEBA') ? 'Ceba' : 'Precebo'}`,
                amount: report.finalEvent.saleValue,
            });
        }
    });

    // 2. Get Income/Expenses from individual pig events (Venta, Descarte, Muerte) and Purchase
    const pigs = JSON.parse(localStorage.getItem('pigs') || '[]');
    pigs.forEach((pig: any) => {
        // Pig Purchase as an expense
        if (pig.purchaseValue > 0) {
            transactions.push({
                id: `purchase-pig-${pig.id}`,
                date: parseISO(pig.arrivalDate),
                description: `Compra de Animal ${pig.id}`,
                type: 'expense',
                category: 'Compra de Animales',
                amount: pig.purchaseValue,
            });
        }

        // Pig Sale events as income
        pig.events.forEach((event: any) => {
            if (event.type === 'Venta' && event.saleValue > 0) {
                transactions.push({
                    id: `sale-pig-${pig.id}-${event.id}`,
                    date: parseISO(event.date),
                    description: `Venta de Animal ${pig.id}`,
                    type: 'income',
                    category: 'Venta de Animales',
                    amount: event.saleValue,
                });
            }
        });
    });

    // 3. Get Expenses from food purchases
    const foodPurchases = JSON.parse(localStorage.getItem('foodPurchaseHistory') || '[]');
    foodPurchases.forEach((purchase: any) => {
        if (purchase.totalValue > 0) {
            transactions.push({
                id: `purchase-food-${purchase.id}`,
                date: parseISO(purchase.entryDate),
                description: `Compra de ${purchase.productName}`,
                type: 'expense',
                category: 'Compra de Alimento',
                amount: purchase.totalValue,
            });
        }
    });
    
    // 4. Get Expenses from personnel salaries
    const personnel = JSON.parse(localStorage.getItem('personnelList') || '[]');
    // NOTE: This is a simplified model. A real app would track monthly payroll.
    // Here, we just add their base salary as a one-time expense for demonstration.
    personnel.forEach((person: any) => {
        if (person.salary > 0) {
             transactions.push({
                id: `salary-${person.id}-${person.hireDate}`,
                date: parseISO(person.hireDate),
                description: `Salario Base de ${person.name}`,
                type: 'expense',
                category: 'Salarios',
                amount: person.salary,
            });
        }
         if (person.bonus > 0) {
             transactions.push({
                id: `bonus-${person.id}-${person.hireDate}`,
                date: parseISO(person.hireDate), // Assume bonus paid on hire for simplicity
                description: `Bonificación para ${person.name}`,
                type: 'expense',
                category: 'Salarios',
                amount: person.bonus,
            });
        }
    });

    // Sort transactions by date
    transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Calculate summary
    const summary = transactions.reduce((acc, t) => {
        if (t.type === 'income') acc.income += t.amount;
        else acc.expenses += t.amount;
        return acc;
    }, { income: 0, expenses: 0, balance: 0 });
    summary.balance = summary.income - summary.expenses;

    // Group data by month for the chart
    const monthlyDataMap = new Map<string, { name: string, ingresos: number, egresos: number }>();
    
    transactions.forEach(t => {
        const monthKey = format(t.date, 'yyyy-MM');
        const monthName = format(t.date, 'MMM yyyy', { locale: es });
        if (!monthlyDataMap.has(monthKey)) {
            monthlyDataMap.set(monthKey, { name: monthName, ingresos: 0, egresos: 0 });
        }
        const month = monthlyDataMap.get(monthKey)!;
        if (t.type === 'income') {
            month.ingresos += t.amount;
        } else {
            month.egresos += t.amount;
        }
    });

    const monthlyData = Array.from(monthlyDataMap.values()).sort((a,b) => {
        const aDate = new Date(a.name.split(' ')[1], Object.values(es.localize!.month).indexOf(a.name.split(' ')[0]));
        const bDate = new Date(b.name.split(' ')[1], Object.values(es.localize!.month).indexOf(b.name.split(' ')[0]));
        return aDate.getTime() - bDate.getTime();
    });

    return { transactions, summary, monthlyData };
};

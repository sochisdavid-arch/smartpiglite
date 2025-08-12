
"use client";

import { format, getMonth, getYear, parseISO, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { getInventory } from './inventory';

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
    let totalProductionCost = 0;
    let totalWeightProduced = 0;
    
    // 1. Get Income from liquidated batches (precebo & ceba)
    try {
        const liquidatedPreceboReports = JSON.parse(localStorage.getItem('liquidatedPreceboReports') || '[]');
        const liquidatedCebaReports = JSON.parse(localStorage.getItem('liquidatedCebaReports') || '[]');
        
        const allReports = [...liquidatedPreceboReports, ...liquidatedCebaReports];

        allReports.forEach(report => {
            const saleValue = report.saleValue;
            if (report.liquidationReason === 'Venta de lote' && saleValue > 0) {
                 transactions.push({
                    id: `sale-batch-${report.batchId}`,
                    date: parseISO(report.endDate),
                    description: `Venta de Lote ${report.batchId}`,
                    type: 'income',
                    category: `Venta de Lote ${report.batchId.includes('CEBA') ? 'Ceba' : 'Precebo'}`,
                    amount: saleValue,
                });
                totalWeightProduced += report.finalTotalWeight || 0;
            }
        });
    } catch (e) { console.error("Error processing batch reports:", e); }

    // 2. Get Income/Expenses from individual pig events (Venta, Descarte, Muerte) and Purchase
    try {
        const pigs = JSON.parse(localStorage.getItem('pigs') || '[]');
        pigs.forEach((pig: any) => {
            // Pig Purchase as an expense
            if (pig.purchaseValue > 0) {
                const purchaseCost = {
                    id: `purchase-pig-${pig.id}`,
                    date: parseISO(pig.arrivalDate),
                    description: `Compra de Animal ${pig.id}`,
                    type: 'expense' as 'expense',
                    category: 'Compra de Animales',
                    amount: pig.purchaseValue,
                };
                transactions.push(purchaseCost);
                totalProductionCost += purchaseCost.amount;
            }

            // Pig Sale events as income
            pig.events.forEach((event: any) => {
                if ((event.type === 'Venta' || event.type === 'Venta de lote') && event.saleValue > 0) {
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
    } catch (e) { console.error("Error processing pig data:", e); }

    // 3. Get Expenses from food purchases
    try {
        const foodPurchases = JSON.parse(localStorage.getItem('foodPurchaseHistory') || '[]');
        foodPurchases.forEach((purchase: any) => {
            if (purchase.totalValue > 0) {
                const foodCost = {
                    id: `purchase-food-${purchase.id}`,
                    date: parseISO(purchase.entryDate),
                    description: `Compra de ${purchase.productName}`,
                    type: 'expense' as 'expense',
                    category: 'Compra de Alimento',
                    amount: purchase.totalValue,
                };
                transactions.push(foodCost);
                totalProductionCost += foodCost.amount;
            }
        });
    } catch (e) { console.error("Error processing food purchases:", e); }
    
    // 4. Get Expenses from personnel salaries
    try {
        const personnel = JSON.parse(localStorage.getItem('personnelList') || '[]');
        personnel.forEach((person: any) => {
            if (person.salary > 0) {
                 const salaryCost = {
                    id: `salary-${person.id}-${person.hireDate}`,
                    date: parseISO(person.hireDate),
                    description: `Salario Base de ${person.name}`,
                    type: 'expense' as 'expense',
                    category: 'Salarios',
                    amount: person.salary,
                };
                 transactions.push(salaryCost);
                 totalProductionCost += salaryCost.amount;
            }
             if (person.bonus > 0) {
                 const bonusCost = {
                    id: `bonus-${person.id}-${person.hireDate}`,
                    date: parseISO(person.hireDate),
                    description: `Bonificación para ${person.name}`,
                    type: 'expense' as 'expense',
                    category: 'Salarios',
                    amount: person.bonus,
                };
                 transactions.push(bonusCost);
                 totalProductionCost += bonusCost.amount;
            }
        });
    } catch (e) { console.error("Error processing personnel data:", e); }

    // 5. Get manual transactions
     try {
        const manualTransactions: any[] = JSON.parse(localStorage.getItem('manualTransactions') || '[]');
        manualTransactions.forEach(t => {
            const parsedTransaction = { ...t, date: parseISO(t.date) };
            transactions.push(parsedTransaction);
            if (parsedTransaction.type === 'expense') {
                totalProductionCost += parsedTransaction.amount;
            }
        });
    } catch(e) { console.error("Error processing manual transactions:", e)}


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
        const [aMonth, aYear] = a.name.split(' ');
        const [bMonth, bYear] = b.name.split(' ');
        const aDate = new Date(parseInt(aYear), Object.values(es.localize!.month).findIndex(m => m.toLowerCase().startsWith(aMonth.replace('.','').toLowerCase())));
        const bDate = new Date(parseInt(bYear), Object.values(es.localize!.month).findIndex(m => m.toLowerCase().startsWith(bMonth.replace('.','').toLowerCase())));
        return aDate.getTime() - bDate.getTime();
    });

    const costPerKilo = totalWeightProduced > 0 ? totalProductionCost / totalWeightProduced : 0;

    return { transactions, summary, monthlyData, costPerKilo };
};
    
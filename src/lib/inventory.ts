
"use client";

import { mockInventory } from './mock-data';

export interface InventoryItem {
    id: string;
    name: string;
    category: 'medicamento' | 'vacuna' | 'alimento';
    stock: number;
}

export interface FoodConsumptionRecord {
    id: string; // unique id for the record
    date: string;
    productId: string;
    productName: string;
    quantity: number;
    area: string; // e.g., 'Precebo Lote X', 'Ceba Lote Y'
}

export interface MedicalConsumptionRecord {
    id: string;
    date: string;
    productId: string;
    productName: string;
    category: 'medicamento' | 'vacuna';
    quantity: number;
    area: string; // e.g., 'Cerda PIG-001', 'Lote Precebo X'
}


export const getInventory = (): InventoryItem[] => {
    try {
        const storedInventory = typeof window !== 'undefined' ? localStorage.getItem('farmInventory') : null;
        if (storedInventory) {
            return JSON.parse(storedInventory);
        } else {
            // Initialize with mock data if nothing is in storage
            if (typeof window !== 'undefined') {
                localStorage.setItem('farmInventory', JSON.stringify(mockInventory));
            }
            return mockInventory;
        }
    } catch (error) {
        console.error("Failed to read inventory from localStorage", error);
        return mockInventory; // Fallback to mock data
    }
};

export const updateInventory = (inventory: InventoryItem[]): void => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem('farmInventory', JSON.stringify(inventory));
            window.dispatchEvent(new Event('storage'));
        }
    } catch (error) {
        console.error("Failed to write inventory to localStorage", error);
    }
};

export const deductFromStock = (
    inventory: InventoryItem[],
    foodConsumptionHistory: FoodConsumptionRecord[],
    medicalConsumptionHistory: MedicalConsumptionRecord[],
    productId: string, 
    quantityToDeduct: number,
    area?: string,
    consumptionDate?: string
): { success: boolean, newStock?: number, message?: string, updatedInventory: InventoryItem[], updatedFoodHistory: FoodConsumptionRecord[], updatedMedicalHistory: MedicalConsumptionRecord[] } => {
    
    if (!productId || quantityToDeduct <= 0) {
        return { success: false, message: 'ID de producto o cantidad inválidos.', updatedInventory: inventory, updatedFoodHistory: foodConsumptionHistory, updatedMedicalHistory: medicalConsumptionHistory };
    }

    const productIndex = inventory.findIndex(item => item.id === productId);

    if (productIndex === -1) {
        return { success: false, message: `Producto con ID ${productId} no encontrado.`, updatedInventory: inventory, updatedFoodHistory: foodConsumptionHistory, updatedMedicalHistory: medicalConsumptionHistory };
    }

    const product = inventory[productIndex];

    if (product.stock < quantityToDeduct) {
        return { success: false, message: `No hay suficiente stock de ${product.name}. Stock: ${product.stock}, Necesario: ${quantityToDeduct}.`, updatedInventory: inventory, updatedFoodHistory: foodConsumptionHistory, updatedMedicalHistory: medicalConsumptionHistory };
    }

    const updatedInventory = [...inventory];
    updatedInventory[productIndex] = { ...product, stock: product.stock - quantityToDeduct };

    let updatedFoodHistory = [...foodConsumptionHistory];
    let updatedMedicalHistory = [...medicalConsumptionHistory];

    if (product.category === 'alimento') {
        const newRecord: FoodConsumptionRecord = {
            id: `consumo-alim-${Date.now()}-${Math.random()}`,
            date: consumptionDate || new Date().toISOString(),
            productId: product.id,
            productName: product.name,
            quantity: quantityToDeduct,
            area: area || 'Área no especificada',
        };
        updatedFoodHistory.unshift(newRecord);
    } else {
        const newRecord: MedicalConsumptionRecord = {
            id: `consumo-med-${Date.now()}-${Math.random()}`,
            date: consumptionDate || new Date().toISOString(),
            productId: product.id,
            productName: product.name,
            category: product.category,
            quantity: quantityToDeduct,
            area: area || 'Área no especificada',
        };
        updatedMedicalHistory.unshift(newRecord);
    }

    return { 
        success: true, 
        newStock: updatedInventory[productIndex].stock,
        updatedInventory,
        updatedFoodHistory,
        updatedMedicalHistory
    };
};

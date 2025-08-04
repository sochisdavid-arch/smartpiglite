
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

const INVENTORY_STORAGE_KEY = 'farmInventory';
const FOOD_CONSUMPTION_HISTORY_KEY = 'foodConsumptionHistory';


// Function to get the current inventory
export const getInventory = (): InventoryItem[] => {
    try {
        const storedInventory = localStorage.getItem(INVENTORY_STORAGE_KEY);
        if (storedInventory) {
            return JSON.parse(storedInventory);
        } else {
            // Initialize with mock data if nothing is in storage
            localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(mockInventory));
            return mockInventory;
        }
    } catch (error) {
        console.error("Failed to read inventory from localStorage", error);
        return mockInventory; // Fallback to mock data
    }
};

// Function to update the entire inventory
export const updateInventory = (inventory: InventoryItem[]): void => {
    try {
        localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
        // Dispatch a storage event to notify other tabs/windows
        window.dispatchEvent(new Event('storage'));
    } catch (error) {
        console.error("Failed to write inventory to localStorage", error);
    }
};

// Function to deduct a quantity from the stock of a specific product
export const deductFromStock = (
    productId: string, 
    quantityToDeduct: number,
    area?: string,
    consumptionDate?: string
): { success: boolean, newStock?: number, message?: string } => {
    if (!productId) {
        return { success: false, message: 'Invalid product ID or quantity.' };
    }
     if (quantityToDeduct <= 0 && quantityToDeduct !== 0) { // allow 0 for edits
        return { success: false, message: 'La cantidad debe ser un número positivo.' };
    }


    const inventory = getInventory();
    const productIndex = inventory.findIndex(item => item.id === productId);

    if (productIndex === -1) {
        return { success: false, message: `Product with ID ${productId} not found in inventory.` };
    }

    const product = inventory[productIndex];
    inventory[productIndex].stock -= quantityToDeduct;

    // If it's a food item, record the consumption if quantity is positive
    if (product.category === 'alimento' && quantityToDeduct > 0) {
        const consumptionHistory: FoodConsumptionRecord[] = JSON.parse(localStorage.getItem(FOOD_CONSUMPTION_HISTORY_KEY) || '[]');
        const newRecord: FoodConsumptionRecord = {
            id: `consumo-${Date.now()}-${Math.random()}`,
            date: consumptionDate || new Date().toISOString(),
            productId: product.id,
            productName: product.name,
            quantity: quantityToDeduct,
            area: area || 'Área no especificada',
        };
        consumptionHistory.unshift(newRecord); // Add to the beginning
        localStorage.setItem(FOOD_CONSUMPTION_HISTORY_KEY, JSON.stringify(consumptionHistory));
    }


    updateInventory(inventory);

    return { success: true, newStock: inventory[productIndex].stock };
};

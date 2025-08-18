
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getDatabase, ref, onValue, set, push, remove } from "firebase/database";
import { db } from '@/lib/firebase';

export interface Farm {
    id: string;
    name: string;
    location: string;
}

interface FarmContextType {
    farms: Farm[];
    activeFarm: Farm | null;
    switchFarm: (farmId: string) => void;
    addFarm: (farm: Omit<Farm, 'id'>) => Promise<void>;
    updateFarm: (farm: Farm) => Promise<void>;
    deleteFarm: (farmId: string) => Promise<void>;
    loading: boolean;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [farms, setFarms] = useState<Farm[]>([]);
    const [activeFarm, setActiveFarm] = useState<Farm | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const farmsRef = ref(db, `users/${user.uid}/farms`);
            const unsubscribe = onValue(farmsRef, (snapshot) => {
                const data = snapshot.val();
                const farmsList: Farm[] = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
                setFarms(farmsList);
                
                const lastActiveFarmId = localStorage.getItem('activeFarmId');
                const farmToActivate = farmsList.find(f => f.id === lastActiveFarmId) || farmsList[0];

                if (farmToActivate) {
                    setActiveFarm(farmToActivate);
                } else {
                    setActiveFarm(null);
                }
                setLoading(false);
            });

            return () => unsubscribe();
        } else {
            setFarms([]);
            setActiveFarm(null);
            setLoading(false);
        }
    }, [user]);

    const switchFarm = useCallback((farmId: string) => {
        const farm = farms.find(f => f.id === farmId);
        if (farm) {
            setActiveFarm(farm);
            localStorage.setItem('activeFarmId', farmId);
        }
    }, [farms]);

    const addFarm = async (farmData: Omit<Farm, 'id'>) => {
        if (!user) throw new Error("User not authenticated");
        const farmsRef = ref(db, `users/${user.uid}/farms`);
        const newFarmRef = push(farmsRef);
        await set(newFarmRef, farmData);
    };

    const updateFarm = async (farmData: Farm) => {
        if (!user) throw new Error("User not authenticated");
        const farmRef = ref(db, `users/${user.uid}/farms/${farmData.id}`);
        await set(farmRef, { name: farmData.name, location: farmData.location });
    };
    
    const deleteFarm = async (farmId: string) => {
        if (!user) throw new Error("User not authenticated");
        const farmRef = ref(db, `users/${user.uid}/farms/${farmId}`);
        await remove(farmRef);
    };


    const value = { farms, activeFarm, switchFarm, addFarm, updateFarm, deleteFarm, loading };

    return (
        <FarmContext.Provider value={value}>
            {children}
        </FarmContext.Provider>
    );
};

export const useFarms = () => {
    const context = useContext(FarmContext);
    if (context === undefined) {
        throw new Error('useFarms must be used within a FarmProvider');
    }
    return context;
};

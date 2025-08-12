
"use client";

import { addMonths, isAfter } from 'date-fns';
import { db } from './firebase';
import { ref, set, get } from "firebase/database";

const LICENSE_INFO_KEY = 'userLicenseInfo';

interface LicenseInfo {
    tierId: 'demo' | 'tier-a' | 'tier-b' | 'tier-c' | 'tier-d';
    tierName: string;
    sowLimit: number;
    expirationDate: string;
}

const tiers = {
    'demo': { name: 'Versión de Prueba', sowLimit: 10 },
    'tier-a': { name: 'Plan 1-50 Madres', sowLimit: 50 },
    'tier-b': { name: 'Plan 51-100 Madres', sowLimit: 100 },
    'tier-c': { name: 'Plan 101-200 Madres', sowLimit: 200 },
    'tier-d': { name: 'Plan 201+ Madres', sowLimit: Infinity },
};

// Generates a random session ID and saves the plan details under it in Firebase
export const saveVerificationSession = async (tierId: string, durationInMonths: number): Promise<string> => {
    const sessionId = `sid_${Math.random().toString(36).substring(2, 12)}`;
    const sessionRef = ref(db, `verificationSessions/${sessionId}`);
    await set(sessionRef, {
        tierId,
        durationInMonths,
        status: 'pending',
        createdAt: new Date().toISOString()
    });
    return sessionId;
};

// This function will be used by the mobile verification page
export const submitTransactionCode = async (sessionId: string, transactionCode: string): Promise<{ success: boolean; message: string }> => {
    const sessionRef = ref(db, `verificationSessions/${sessionId}`);
    const snapshot = await get(sessionRef);

    if (!snapshot.exists()) {
        return { success: false, message: 'La sesión de verificación es inválida o ha expirado.' };
    }
    
    await set(sessionRef, {
        ...snapshot.val(),
        status: 'completed',
        transactionCode: transactionCode,
        completedAt: new Date().toISOString()
    });

    return { success: true, message: '¡Verificación completada! Puedes cerrar esta ventana.' };
};


export const setLicense = (tierId: string, durationInMonths: number) => {
    const tier = tiers[tierId as keyof typeof tiers];
    if (!tier) return;

    const expirationDate = addMonths(new Date(), durationInMonths);
    
    const licenseInfo: LicenseInfo = {
        tierId: tierId as LicenseInfo['tierId'],
        tierName: tier.name,
        sowLimit: tier.sowLimit,
        expirationDate: expirationDate.toISOString(),
    };

    localStorage.setItem(LICENSE_INFO_KEY, JSON.stringify(licenseInfo));
};

export const getLicenseInfo = (): LicenseInfo | null => {
    const storedInfo = localStorage.getItem(LICENSE_INFO_KEY);
    if (!storedInfo) return null;
    try {
        const parsedInfo = JSON.parse(storedInfo);
        return {
            ...parsedInfo,
            expirationDate: parsedInfo.expirationDate,
        };
    } catch {
        return null;
    }
};

export const checkLicense = (currentSowCount: number): { isValid: boolean, canAdd: boolean, message: string } => {
    const license = getLicenseInfo();

    if (!license) {
        setLicense('demo'); // Set a demo license if none exists
        return { isValid: true, canAdd: true, message: 'Licencia de demostración activada.' };
    }

    const isExpired = isAfter(new Date(), new Date(license.expirationDate));
    if (isExpired) {
        return { isValid: false, canAdd: false, message: 'Tu licencia ha expirado. Por favor, renueva tu plan para continuar.' };
    }
    
    if (currentSowCount >= license.sowLimit) {
        return { isValid: true, canAdd: false, message: `Has alcanzado el límite de ${license.sowLimit} cerdas para tu plan "${license.tierName}".` };
    }

    return { isValid: true, canAdd: true, message: `Licencia "${license.tierName}" activa.` };
};

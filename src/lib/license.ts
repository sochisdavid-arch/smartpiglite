
"use client";

import { addMonths, isAfter } from 'date-fns';

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
        setLicense('demo', 1); // Set a 1-month demo license if none exists
        const demoLicense = getLicenseInfo()!;
         return { isValid: true, canAdd: currentSowCount < demoLicense.sowLimit, message: 'Licencia de demostración activada.' };
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

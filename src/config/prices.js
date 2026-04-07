// Modul narxlari — barcha sahifalarda ishlatiladigan rasmiy narxlar
// Backend narxlarini override qiladi
export const MODULE_PRICES = {
    'Kompyuter savodxonligi': 100000,
    'Dasturlash': 130000,
    'Montaj': 90000,
};

// Modul nomi bo'yicha rasmiy narxni qaytaradi
export function getModulePrice(moduleName, fallbackPrice) {
    return MODULE_PRICES[moduleName] ?? fallbackPrice ?? 0;
}

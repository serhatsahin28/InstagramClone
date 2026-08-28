// MongoDB ObjectId'nin ilk 4 baytı oluşturulma zamanını (unix saniye) içerir;
// ayrı bir "createdAt" alanı olmadan gönderi/hikaye yaşını buradan çıkarırız.
function dateFromObjectId(id) {
    const hex = String(id).slice(0, 8);
    if (!/^[0-9a-fA-F]{8}$/.test(hex)) return null;
    return new Date(parseInt(hex, 16) * 1000);
}

const UNITS = [
    { limit: 60, divisor: 1, single: "az önce", suffix: null },
    { limit: 3600, divisor: 60, suffix: "dakika önce" },
    { limit: 86400, divisor: 3600, suffix: "saat önce" },
    { limit: 604800, divisor: 86400, suffix: "gün önce" },
    { limit: 2629800, divisor: 604800, suffix: "hafta önce" },
    { limit: 31557600, divisor: 2629800, suffix: "ay önce" },
    { limit: Infinity, divisor: 31557600, suffix: "yıl önce" }
];

// id: ObjectId (veya string) ya da Date/ISO string kabul eder.
export function timeAgo(id) {
    const date = id instanceof Date ? id : dateFromObjectId(id) || new Date(id);
    if (!date || Number.isNaN(date.getTime())) return "";

    const diffSeconds = Math.max(0, (Date.now() - date.getTime()) / 1000);

    for (const unit of UNITS) {
        if (diffSeconds < unit.limit) {
            if (!unit.suffix) return unit.single;
            return `${Math.floor(diffSeconds / unit.divisor)} ${unit.suffix}`;
        }
    }
    return "";
}

// Yayindaki backend adresi. Gizli bir bilgi degil; tarayiciya inen pakete
// zaten gomuluyor, bu yuzden ortam degiskeni zorunlu tutulmuyor.
// Frankfurt bolgesindeki servis; veritabani da Avrupa'da oldugu icin
// Washington'daki eski servise gore belirgin sekilde hizli.
const PRODUCTION_API = "https://instagramclone-1xlb.onrender.com";
const LOCAL_API = "http://localhost:3000";

function resolveApiBase() {
    // Ortam degiskeni verilmisse her zaman o kazanir.
    if (import.meta.env.VITE_API_BASE) return import.meta.env.VITE_API_BASE;

    // Yerelde calisiyorsak yerel backend'e, aksi halde yayindakine baglan.
    const host = typeof window !== "undefined" ? window.location.hostname : "";
    const isLocal = host === "localhost" || host === "127.0.0.1";

    return isLocal ? LOCAL_API : PRODUCTION_API;
}

export const API_BASE = resolveApiBase();

// Oturum cerezi siteler arasi (Vercel <-> Render) gonderildigi icin gizli
// sekme / sıkı gizlilik ayarlarinda ucuncu taraf cerez olarak engelleniyordu.
// Bunu asmak icin kimlik dogrulama gerektiren istekler ayni origin uzerinden
// (vercel.json'daki /api rewrite'i ile) gonderiliyor; boylece cerez birinci
// taraf sayiliyor. Gorsel/ikon adresleri (API_BASE) bundan etkilenmez, cunku
// onlar cerez gerektirmiyor ve dogrudan Render'dan servis edilmeye devam eder.
function resolveApiRoot() {
    if (import.meta.env.VITE_API_BASE) return import.meta.env.VITE_API_BASE;

    const host = typeof window !== "undefined" ? window.location.hostname : "";
    const isLocal = host === "localhost" || host === "127.0.0.1";

    return isLocal ? LOCAL_API : "";
}

const API_ROOT = resolveApiRoot();

// Cloudinary adreslerine donusum parametreleri eklenir: modern format (webp/avif),
// otomatik kalite ve ekranda kullanilan genislik. Orijinal dosyayi indirmek yerine
// kucultulmus surum gelir. Render diskindeki eski gorseller donusturulemez.
function withCloudinaryTransform(url, width) {
    if (!width || !url.includes("/image/upload/")) return url;
    return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,w_${width},c_limit/`);
}

// Gorsel adresi uretir. Cloudinary'ye yuklenenler tam URL olarak saklanir,
// daha eski kayitlar ise sadece dosya adi icerir; ikisini de destekler.
export function mediaUrl(value, folder, width) {
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return withCloudinaryTransform(value, width);
    return `${API_BASE}/${folder}/${value}`;
}

// Gonderi gorselleri en fazla 600px genislikte gosteriliyor; 2x ekranlar icin 1200.
export const postImage = (name) => mediaUrl(name, "posts", 1200);
export const profileImage = (name) => mediaUrl(name, "users_profile", 320);

// Kucuk kareler (izgara, avatar listeleri) icin daha da kucuk surum.
export const thumbImage = (name) => mediaUrl(name, "posts", 400);

async function request(path, options = {}) {
    const res = await fetch(`${API_ROOT}/api${path}`, {
        credentials: "include",
        headers: options.body && !(options.body instanceof FormData)
            ? { "Content-Type": "application/json" }
            : undefined,
        ...options
    });

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await res.json() : null;

    if (!res.ok) {
        const error = new Error(data?.error || "İstek başarısız oldu");
        error.status = res.status;
        error.data = data;
        throw error;
    }

    return data;
}

export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
    put: (path, body) => request(path, { method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body) }),
    delete: (path, body) => request(path, { method: "DELETE", body: body instanceof FormData ? body : JSON.stringify(body) })
};

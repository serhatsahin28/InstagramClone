// Yayindaki backend adresi. Gizli bir bilgi degil; tarayiciya inen pakete
// zaten gomuluyor, bu yuzden ortam degiskeni zorunlu tutulmuyor.
const PRODUCTION_API = "https://instagram-clone-api-gwl1.onrender.com";
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

// Gorsel adresi uretir. Cloudinary'ye yuklenenler tam URL olarak saklanir,
// daha eski kayitlar ise sadece dosya adi icerir; ikisini de destekler.
export function mediaUrl(value, folder) {
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    return `${API_BASE}/${folder}/${value}`;
}

export const postImage = (name) => mediaUrl(name, "posts");
export const profileImage = (name) => mediaUrl(name, "users_profile");

async function request(path, options = {}) {
    const res = await fetch(`${API_BASE}/api${path}`, {
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
    delete: (path, body) => request(path, { method: "DELETE", body: body instanceof FormData ? body : JSON.stringify(body) })
};

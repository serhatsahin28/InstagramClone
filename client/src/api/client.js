// Production'da Vercel ortam değişkeninden gelir (VITE_API_BASE),
// geliştirmede yerel backend'e düşer.
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

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

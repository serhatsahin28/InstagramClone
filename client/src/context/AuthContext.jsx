import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [feed, setFeed] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/auth/me")
            .then((data) => setFeed(data))
            .catch(() => setFeed(null))
            .finally(() => setLoading(false));
    }, []);

    async function login(userName, password) {
        const data = await api.post("/auth/login", { userName, password });
        setFeed(data);
        return data;
    }

    async function logout() {
        await api.post("/auth/logout");
        setFeed(null);
    }

    async function refresh() {
        const data = await api.get("/auth/me");
        setFeed(data);
        return data;
    }

    const value = {
        feed,
        loading,
        isAuthenticated: !!feed,
        login,
        logout,
        refresh
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

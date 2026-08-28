import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";

const MessagesContext = createContext(null);

// Gelen kutusu tek yerden, uygulama açılır açılmaz önceden yüklenir.
// Böylece sağ alttaki mesaj panelini açmak beklemesiz olur ve sidebar/anasayfa
// rozetleri aynı veriyi paylaşır.
export function MessagesProvider({ children }) {
    const { feed, isAuthenticated } = useAuth();
    const socket = useSocket();
    const [threads, setThreads] = useState([]);
    const [totalUnread, setTotalUnread] = useState(0);
    const loaded = useRef(false);

    const refresh = useCallback(() => {
        if (!isAuthenticated) return;
        return api.get("/messages/inbox")
            .then((res) => {
                setThreads(res.newDirectInbox || []);
                setTotalUnread(res.totalUnread || 0);
                loaded.current = true;
            })
            .catch(() => {});
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated && !loaded.current) refresh();
        if (!isAuthenticated) {
            loaded.current = false;
            setThreads([]);
            setTotalUnread(0);
        }
    }, [isAuthenticated, refresh]);

    useEffect(() => {
        if (!socket) return;

        function onIncoming(formData) {
            const mine = feed?.userName;
            if (!mine) return;
            if (formData.sessionUserName !== mine && formData.username !== mine) return;
            refresh();
        }

        socket.on("submitForm2", onIncoming);
        return () => socket.off("submitForm2", onIncoming);
    }, [socket, feed, refresh]);

    // Bir sohbet açılıp okunduğunda o kişinin sayısı yerelde de sıfırlanır;
    // sunucuya tekrar sormaya gerek kalmaz.
    const markThreadReadLocally = useCallback((otherUsername) => {
        setThreads((prev) => {
            let removed = 0;
            const next = prev.map((t) => {
                if (t.otherUsername === otherUsername && t.unreadCount > 0) {
                    removed += t.unreadCount;
                    return { ...t, unreadCount: 0 };
                }
                return t;
            });
            if (removed > 0) setTotalUnread((n) => Math.max(0, n - removed));
            return next;
        });
    }, []);

    return (
        <MessagesContext.Provider value={{ threads, totalUnread, refresh, markThreadReadLocally }}>
            {children}
        </MessagesContext.Provider>
    );
}

export function useMessages() {
    const ctx = useContext(MessagesContext);
    if (!ctx) throw new Error("useMessages must be used within MessagesProvider");
    return ctx;
}

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE } from "../api/client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const { isAuthenticated, feed } = useAuth();
    const socketRef = useRef(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
            }
            return;
        }

        const instance = io(API_BASE, { withCredentials: true });
        socketRef.current = instance;
        setSocket(instance);

        return () => {
            instance.disconnect();
            socketRef.current = null;
        };
    }, [isAuthenticated]);

    // Kendi adımıza açılan odaya katıl; kişisel bildirimler oraya gelir.
    useEffect(() => {
        const username = feed?.userName;
        if (!socket || !username) return;

        socket.emit("register", username);
        socket.on("connect", () => socket.emit("register", username));

        return () => socket.off("connect");
    }, [socket, feed]);

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
    return useContext(SocketContext);
}

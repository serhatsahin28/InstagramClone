import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileImage } from "../api/client";
import { useSocket } from "../context/SocketContext";
import "./NotificationToasts.css";

const STYLES = {
    follow_request: { icon: "👤", cls: "follow", text: () => "sana takip isteği gönderdi" },
    follower: { icon: "👤", cls: "follow", text: () => "seni takip etmeye başladı" },
    like: { icon: "❤️", cls: "like", text: () => "gönderini beğendi" },
    comment: { icon: "💬", cls: "comment", text: (n) => `yorum yaptı: ${n.comment}` }
};

export default function NotificationToasts({ suppressed }) {
    const socket = useSocket();
    const navigate = useNavigate();
    const [toasts, setToasts] = useState([]);
    const suppressedRef = useRef(suppressed);

    useEffect(() => {
        suppressedRef.current = suppressed;
    }, [suppressed]);

    useEffect(() => {
        if (!socket) return;

        function onNotify(payload) {
            // Bildirim paneli açıkken uyarı gösterme; zaten listede görünüyor.
            if (suppressedRef.current) return;

            const id = `${Date.now()}-${Math.random()}`;
            setToasts((prev) => [...prev, { ...payload, id }]);

            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 5000);
        }

        socket.on("notify", onNotify);
        return () => socket.off("notify", onNotify);
    }, [socket]);

    function dismiss(id) {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }

    if (toasts.length === 0) return null;

    return (
        <div className="toast-stack">
            {toasts.map((t) => {
                const style = STYLES[t.type] || STYLES.follower;
                return (
                    <div
                        key={t.id}
                        className={`toast toast-${style.cls}`}
                        onClick={() => { dismiss(t.id); navigate(`/${t.username}`); }}
                    >
                        <span className="toast-icon">{style.icon}</span>

                        {t.profilePicture && (
                            <img className="toast-avatar" src={profileImage(t.profilePicture)} alt="" />
                        )}

                        <span className="toast-text">
                            <strong>{t.username}</strong> {style.text(t)}
                        </span>

                        <button
                            className="toast-close"
                            onClick={(e) => { e.stopPropagation(); dismiss(t.id); }}
                            aria-label="Kapat"
                        >
                            ✕
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

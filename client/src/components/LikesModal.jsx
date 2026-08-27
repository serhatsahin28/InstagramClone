import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../api/client";
import { useSocket } from "../context/SocketContext";
import "./LikesModal.css";

export default function LikesModal({ postId, onClose }) {
    const socket = useSocket();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!socket) return;

        socket.emit("likeSee", postId);

        function onResult(docs) {
            const list = [];
            for (const doc of docs || []) {
                if (String(doc.post_id) !== String(postId)) continue;
                for (const u of doc.userWhoLike) list.push(u);
            }
            setUsers(list);
            setLoading(false);
        }

        socket.on("likeSeeReturn", onResult);
        return () => socket.off("likeSeeReturn", onResult);
    }, [socket, postId]);

    return (
        <div className="likes-overlay" onClick={onClose}>
            <div className="likes-modal" onClick={(e) => e.stopPropagation()}>
                <header className="likes-header">
                    <span />
                    <h3>Beğenmeler</h3>
                    <button className="likes-close" onClick={onClose}>✕</button>
                </header>

                {!loading && (
                    <p className="likes-count">
                        <strong>{users.length}</strong> kişi beğendi
                    </p>
                )}

                <div className="likes-list">
                    {loading ? (
                        <p className="likes-hint">Yükleniyor...</p>
                    ) : users.length === 0 ? (
                        <p className="likes-hint">Henüz beğeni yok.</p>
                    ) : (
                        users.map((u, i) => (
                            <Link key={i} to={`/${u.username}`} className="likes-item" onClick={onClose}>
                                <img src={`${API_BASE}/users_profile/${u.userPicture}`} alt="" />
                                <div className="likes-item-text">
                                    <span className="username">{u.username}</span>
                                    <span className="muted">{u.userProfileName}</span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

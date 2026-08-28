import { useEffect, useState } from "react";
import { api, profileImage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import "./NewMessageModal.css";

// Bir gönderiyi takip ettiğin kişilerden birine (veya birkaçına) DM olarak yollar.
export default function ShareModal({ post, onClose }) {
    const { feed } = useAuth();
    const socket = useSocket();
    const [users, setUsers] = useState([]);
    const [term, setTerm] = useState("");
    const [selected, setSelected] = useState(new Set());
    const [sent, setSent] = useState(false);

    useEffect(() => {
        api.get("/messages/candidates")
            .then((res) => setUsers(res.users || []))
            .catch(() => setUsers([]));
    }, []);

    const filtered = users.filter((u) =>
        u.username.toLowerCase().includes(term.trim().toLowerCase())
    );

    function toggle(username) {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(username) ? next.delete(username) : next.add(username);
            return next;
        });
    }

    function handleSend() {
        if (!socket || selected.size === 0) return;

        for (const username of selected) {
            socket.emit("submitForm", {
                username,
                sessionUserName: feed.userName,
                message: "Bir gönderi paylaştı",
                profilePicture: feed.sessionProfilePicture,
                sharedPostId: post._id
            });
        }

        setSent(true);
        setTimeout(onClose, 900);
    }

    return (
        <div className="new-message-overlay" onClick={onClose}>
            <div className="new-message-modal" onClick={(e) => e.stopPropagation()}>
                <header className="new-message-header">
                    <button className="new-message-close" onClick={onClose}>✕</button>
                    <h3>Gönderiyi Paylaş</h3>
                    <span />
                </header>

                {sent ? (
                    <p className="new-message-hint" style={{ padding: "2rem", textAlign: "center" }}>
                        Gönderildi ✓
                    </p>
                ) : (
                    <>
                        <div className="new-message-search">
                            <label>Kime:</label>
                            <input
                                type="text"
                                placeholder="Ara..."
                                value={term}
                                onChange={(e) => setTerm(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="new-message-list">
                            {filtered.length === 0 ? (
                                <p className="new-message-hint">
                                    {users.length === 0
                                        ? "Paylaşabileceğin kimse yok. Önce birini takip et."
                                        : "Sonuç bulunamadı."}
                                </p>
                            ) : (
                                filtered.map((user) => (
                                    <button
                                        key={user._id}
                                        className={selected.has(user.username) ? "new-message-item selected" : "new-message-item"}
                                        onClick={() => toggle(user.username)}
                                    >
                                        <img loading="lazy" decoding="async" src={profileImage(user.profilePicture)} alt="" />
                                        <div className="new-message-item-text">
                                            <span className="username">{user.username}</span>
                                            <span className="muted">{user.profileName}</span>
                                        </div>
                                        <span className={selected.has(user.username) ? "radio checked" : "radio"} />
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="new-message-footer">
                            <button disabled={selected.size === 0} onClick={handleSend}>
                                {selected.size > 1 ? `${selected.size} kişiye gönder` : "Gönder"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

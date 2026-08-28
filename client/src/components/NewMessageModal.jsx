import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, profileImage } from "../api/client";
import "./NewMessageModal.css";

export default function NewMessageModal({ onClose }) {
    const [users, setUsers] = useState([]);
    const [term, setTerm] = useState("");
    const [selected, setSelected] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/messages/candidates")
            .then((res) => setUsers(res.users || []))
            .catch(() => setUsers([]));
    }, []);

    const filtered = users.filter((u) =>
        u.username.toLowerCase().includes(term.trim().toLowerCase())
    );

    function handleStart() {
        if (!selected) return;
        onClose();
        navigate(`/direct/${selected._id}`);
    }

    return (
        <div className="new-message-overlay" onClick={onClose}>
            <div className="new-message-modal" onClick={(e) => e.stopPropagation()}>
                <header className="new-message-header">
                    <button className="new-message-close" onClick={onClose}>✕</button>
                    <h3>Yeni mesaj</h3>
                    <span />
                </header>

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
                                ? "Mesaj gönderebileceğin kimse yok. Önce birini takip et."
                                : "Sonuç bulunamadı."}
                        </p>
                    ) : (
                        filtered.map((user) => (
                            <button
                                key={user._id}
                                className={selected?._id === user._id ? "new-message-item selected" : "new-message-item"}
                                onClick={() => setSelected(user)}
                            >
                                <img loading="lazy" decoding="async"
                src={profileImage(user.profilePicture)} alt="" />
                                <div className="new-message-item-text">
                                    <span className="username">{user.username}</span>
                                    <span className="muted">{user.profileName}</span>
                                </div>
                                <span className={selected?._id === user._id ? "radio checked" : "radio"} />
                            </button>
                        ))
                    )}
                </div>

                <div className="new-message-footer">
                    <button disabled={!selected} onClick={handleStart}>Sohbet</button>
                </div>
            </div>
        </div>
    );
}

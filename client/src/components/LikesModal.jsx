import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, profileImage } from "../api/client";
import "./LikesModal.css";

export default function LikesModal({ postId, onClose }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        // Doğrudan REST çağrısı; eski socket yayını herkese emit ettiği için
        // gereksiz beklemeye sebep oluyordu.
        api.get(`/posts/${postId}/likes`)
            .then((res) => {
                if (active) setUsers(res.users || []);
            })
            .catch(() => {
                if (active) setUsers([]);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [postId]);

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
                                <img loading="lazy" decoding="async" src={profileImage(u.userPicture)} alt="" />
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

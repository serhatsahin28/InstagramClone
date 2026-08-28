import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, profileImage } from "../api/client";
import "./UserListModal.css";

export default function UserListModal({ username, kind, onClose }) {
    const [users, setUsers] = useState(null);

    useEffect(() => {
        api.get(`/users/${username}/${kind}`)
            .then((res) => setUsers(res.users || []))
            .catch(() => setUsers([]));
    }, [username, kind]);

    const title = kind === "followers" ? "Takipçiler" : "Takip edilenler";

    return (
        <div className="user-list-overlay" onClick={onClose}>
            <div className="user-list-modal" onClick={(e) => e.stopPropagation()}>
                <header className="user-list-header">
                    <span />
                    <h3>{title}</h3>
                    <button className="user-list-close" onClick={onClose}>✕</button>
                </header>

                <div className="user-list-body">
                    {users === null ? (
                        <p className="user-list-hint">Yükleniyor...</p>
                    ) : users.length === 0 ? (
                        <p className="user-list-hint">
                            {kind === "followers" ? "Henüz takipçi yok." : "Henüz kimseyi takip etmiyor."}
                        </p>
                    ) : (
                        users.map((u) => (
                            <Link key={u._id} to={`/${u.username}`} className="user-list-item" onClick={onClose}>
                                <img loading="lazy" decoding="async"
                src={profileImage(u.profilePicture)} alt="" />
                                <div className="user-list-item-text">
                                    <span className="username">{u.username}</span>
                                    <span className="muted">{u.profileName}</span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

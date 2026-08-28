import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, profileImage } from "../api/client";
import "./LikesModal.css";

// Hikayeyi kimlerin gördüğünü ve beğendiğini gösterir (yalnızca sahibi görür).
export default function StoryViewersModal({ storyId, onClose }) {
    const [viewers, setViewers] = useState([]);
    const [likeCount, setLikeCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        api.get(`/stories/${storyId}/viewers`)
            .then((res) => {
                if (!active) return;
                setViewers(res.viewers || []);
                setLikeCount(res.likeCount || 0);
            })
            .finally(() => active && setLoading(false));
        return () => { active = false; };
    }, [storyId]);

    return (
        <div className="likes-overlay" onClick={onClose}>
            <div className="likes-modal" onClick={(e) => e.stopPropagation()}>
                <header className="likes-header">
                    <span />
                    <h3>Görüntüleyenler</h3>
                    <button className="likes-close" onClick={onClose}>✕</button>
                </header>

                {!loading && (
                    <p className="likes-count">
                        <strong>{viewers.length}</strong> görüntüleme · <strong>{likeCount}</strong> beğeni
                    </p>
                )}

                <div className="likes-list">
                    {loading ? (
                        <p className="likes-hint">Yükleniyor...</p>
                    ) : viewers.length === 0 ? (
                        <p className="likes-hint">Henüz kimse görmedi.</p>
                    ) : (
                        viewers.map((v, i) => (
                            <Link key={i} to={`/${v.username}`} className="likes-item" onClick={onClose}>
                                <img loading="lazy" decoding="async" src={profileImage(v.userPicture)} alt="" />
                                <div className="likes-item-text">
                                    <span className="username">{v.username}</span>
                                    <span className="muted">{v.userProfileName}</span>
                                </div>
                                {v.liked && <span style={{ marginLeft: "auto", fontSize: "1.1rem" }}>❤️</span>}
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

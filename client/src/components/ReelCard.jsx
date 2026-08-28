import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE, api, mediaUrl, profileImage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Caption from "./Caption";
import ReelCommentsDrawer from "./ReelCommentsDrawer";
import "./ReelCard.css";

export default function ReelCard({ reel, onDeleted }) {
    const { feed } = useAuth();
    const videoRef = useRef(null);
    const [muted, setMuted] = useState(true);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [showComments, setShowComments] = useState(false);
    const [deleted, setDeleted] = useState(false);

    useEffect(() => {
        api.get(`/posts/${reel._id}/likes`)
            .then((res) => {
                const users = res.users || [];
                setLikeCount(users.length);
                setLiked(users.some((u) => u.username === feed?.userName));
            })
            .catch(() => {});
    }, [reel._id, feed]);

    // Ekranda goruldugunde oynat, gorunmez olunca duraklat.
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) video.play().catch(() => {});
                else video.pause();
            },
            { threshold: 0.6 }
        );
        observer.observe(video);
        return () => observer.disconnect();
    }, []);

    async function toggleLike() {
        const next = !liked;
        setLiked(next);
        setLikeCount((n) => n + (next ? 1 : -1));
        try {
            if (next) await api.post(`/reels/${reel._id}/like`);
            else await api.delete(`/reels/${reel._id}/like`);
        } catch {
            setLiked(!next);
            setLikeCount((n) => n + (next ? -1 : 1));
        }
    }

    async function handleDelete() {
        if (!window.confirm("Bu reeli silmek istediğine emin misin?")) return;
        await api.delete(`/reels/${reel._id}`);
        setDeleted(true);
        onDeleted?.();
    }

    if (deleted) return null;
    const isOwn = reel.username === feed?.userName;

    return (
        <div className="reel-card">
            <video
                ref={videoRef}
                className="reel-video"
                src={mediaUrl(reel.video, "reels")}
                muted={muted}
                loop
                playsInline
                onClick={() => videoRef.current?.paused ? videoRef.current.play() : videoRef.current.pause()}
            />

            <button className="reel-mute-btn" onClick={() => setMuted((m) => !m)}>
                {muted ? "🔇" : "🔊"}
            </button>

            <div className="reel-overlay-bottom">
                <Link to={`/${reel.username}`} className="reel-user">
                    <img src={profileImage(reel.profilePhoto)} alt="" />
                    <span>{reel.username}</span>
                </Link>
                {reel.description && (
                    <p className="reel-caption"><Caption text={reel.description} /></p>
                )}
            </div>

            <div className="reel-side-actions">
                <button onClick={toggleLike}>
                    <img src={`${API_BASE}/Icons/${liked ? "redHeart.png" : "heart.png"}`} alt="beğen" />
                    <span>{likeCount}</span>
                </button>
                <button onClick={() => setShowComments(true)}>
                    <img src={`${API_BASE}/Icons/icon_chat.png`} alt="yorum" />
                </button>
                {isOwn && (
                    <button onClick={handleDelete}>
                        <span className="reel-delete-label">Sil</span>
                    </button>
                )}
            </div>

            {showComments && <ReelCommentsDrawer reel={reel} onClose={() => setShowComments(false)} />}
        </div>
    );
}

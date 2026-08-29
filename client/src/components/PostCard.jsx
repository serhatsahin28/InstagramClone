import { useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE, profileImage } from "../api/client";
import usePostActions from "../hooks/usePostActions";
import PostCarousel from "./PostCarousel";
import CommentModal from "./CommentModal";
import LikesModal from "./LikesModal";
import ShareModal from "./ShareModal";
import PostMenu from "./PostMenu";
import SaveIcon from "./SaveIcon";
import Caption from "./Caption";
import { timeAgo } from "../utils/timeAgo";
import "./PostCard.css";

export default function PostCard({ post, likedByMe, savedByMe, eager = false, onDeleted, onEdited }) {
    const { liked, toggleLike, saved, toggleSave } = usePostActions(post, likedByMe, savedByMe);
    const [showComments, setShowComments] = useState(false);
    const [showLikes, setShowLikes] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [description, setDescription] = useState(post.description);

    const photos = post.photos?.[0]
        ? [post.photos[0].photo1, post.photos[0].photo2, post.photos[0].photo3, post.photos[0].photo4]
        : [];

    if (deleted) return null;

    return (
        <article className="post-card">
            <header className="post-card-header">
                <img className="post-card-avatar" loading="lazy" decoding="async"
                src={profileImage(post.profilePhoto)} alt="" />
                <Link to={`/${post.username}`} className="post-card-username">{post.username}</Link>
                <PostMenu
                    post={{ ...post, description }}
                    className="post-card-dots"
                    onDeleted={() => { setDeleted(true); onDeleted?.(); }}
                    onEdited={(next) => { setDescription(next); onEdited?.(next); }}
                />
            </header>

            <PostCarousel photos={photos} eager={eager} />

            <div className="post-card-actions">
                <button className="icon-btn" onClick={toggleLike} title="Beğen">
                    <img src={`${API_BASE}/Icons/${liked ? "redHeart.png" : "heart.png"}`} alt="beğen" />
                </button>
                <button className="icon-btn" onClick={() => setShowComments(true)} title="Yorum yap">
                    <img src={`${API_BASE}/Icons/icon_chat.png`} alt="yorum" />
                </button>
                <button className="icon-btn" onClick={() => setShowShare(true)} title="Gönder">
                    <img src={`${API_BASE}/Icons/direct-instagram.png`} alt="gönder" />
                </button>

                <button
                    className={saved ? "icon-btn save-btn saved" : "icon-btn save-btn"}
                    onClick={toggleSave}
                    title={saved ? "Kaydedildi" : "Kaydet"}
                >
                    <SaveIcon saved={saved} />
                </button>
            </div>

            <button className="post-card-likes" onClick={() => setShowLikes(true)}>
                Beğenmeleri görüntüle
            </button>

            <p className="post-card-caption">
                <Link to={`/${post.username}`} className="post-card-caption-user">{post.username}</Link>
                {description ? <> <Caption text={description} /></> : ""}
            </p>

            <button className="post-card-comments-link" onClick={() => setShowComments(true)}>
                Yorumları gör
            </button>

            <span className="post-card-time">{timeAgo(post._id)}</span>

            {showComments && (
                <CommentModal
                    post={{ ...post, description }}
                    onClose={() => setShowComments(false)}
                    onDeleted={() => { setDeleted(true); onDeleted?.(); }}
                    onEdited={(next) => { setDescription(next); onEdited?.(next); }}
                    liked={liked}
                    onToggleLike={toggleLike}
                    saved={saved}
                    onToggleSave={toggleSave}
                />
            )}

            {showLikes && <LikesModal postId={post._id} onClose={() => setShowLikes(false)} />}
            {showShare && <ShareModal post={post} onClose={() => setShowShare(false)} />}
        </article>
    );
}

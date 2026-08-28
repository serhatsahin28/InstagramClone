import { useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE, profileImage } from "../api/client";
import usePostActions from "../hooks/usePostActions";
import PostCarousel from "./PostCarousel";
import CommentModal from "./CommentModal";
import LikesModal from "./LikesModal";
import "./PostCard.css";

export default function PostCard({ post, likedByMe, savedByMe }) {
    const { liked, toggleLike, saved, toggleSave } = usePostActions(post, likedByMe, savedByMe);
    const [showComments, setShowComments] = useState(false);
    const [showLikes, setShowLikes] = useState(false);

    const photos = post.photos?.[0]
        ? [post.photos[0].photo1, post.photos[0].photo2, post.photos[0].photo3, post.photos[0].photo4]
        : [];

    return (
        <article className="post-card">
            <header className="post-card-header">
                <img className="post-card-avatar" src={profileImage(post.profilePhoto)} alt="" />
                <Link to={`/${post.username}`} className="post-card-username">{post.username}</Link>
                <img className="post-card-dots" src={`${API_BASE}/Icons/dots.png`} alt="" />
            </header>

            <PostCarousel photos={photos} />

            <div className="post-card-actions">
                <button className="icon-btn" onClick={toggleLike} title="Beğen">
                    <img src={`${API_BASE}/Icons/${liked ? "redHeart.png" : "heart.png"}`} alt="beğen" />
                </button>
                <button className="icon-btn" onClick={() => setShowComments(true)} title="Yorum yap">
                    <img src={`${API_BASE}/Icons/chat.png`} alt="yorum" />
                </button>
                <button className="icon-btn" title="Gönder">
                    <img src={`${API_BASE}/Icons/direct-instagram.png`} alt="gönder" />
                </button>

                <button
                    className={saved ? "icon-btn save-btn saved" : "icon-btn save-btn"}
                    onClick={toggleSave}
                    title={saved ? "Kaydedildi" : "Kaydet"}
                >
                    <img src={`${API_BASE}/Icons/bookmark.png`} alt="kaydet" />
                </button>
            </div>

            <button className="post-card-likes" onClick={() => setShowLikes(true)}>
                Beğenmeleri görüntüle
            </button>

            <p className="post-card-caption">
                <Link to={`/${post.username}`} className="post-card-caption-user">{post.username}</Link>
                {post.description ? ` ${post.description}` : ""}
            </p>

            <button className="post-card-comments-link" onClick={() => setShowComments(true)}>
                Yorumları gör
            </button>

            {showComments && (
                <CommentModal
                    post={post}
                    onClose={() => setShowComments(false)}
                    liked={liked}
                    onToggleLike={toggleLike}
                    saved={saved}
                    onToggleSave={toggleSave}
                />
            )}

            {showLikes && <LikesModal postId={post._id} onClose={() => setShowLikes(false)} />}
        </article>
    );
}

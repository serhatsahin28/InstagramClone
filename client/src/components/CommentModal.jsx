import { useEffect, useState } from "react";
import { API_BASE, profileImage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import PostCarousel from "./PostCarousel";
import LikesModal from "./LikesModal";
import ShareModal from "./ShareModal";
import "./CommentModal.css";

export default function CommentModal({ post, onClose, liked, onToggleLike, saved, onToggleSave }) {
    const { feed } = useAuth();
    const socket = useSocket();
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [showLikes, setShowLikes] = useState(false);
    const [showShare, setShowShare] = useState(false);

    useEffect(() => {
        if (!socket) return;

        socket.emit("commentPost", { data: { imgId: post._id }, sessionUserName: feed.userName });

        function onInitial({ query, post_id }) {
            if (post_id !== post._id) return;
            setComments(query);
        }
        function onUpdate(newQuery) {
            setComments(newQuery);
        }

        socket.on("commentPostReturn", onInitial);
        socket.on("commentPostReturn2", onUpdate);
        return () => {
            socket.off("commentPostReturn", onInitial);
            socket.off("commentPostReturn2", onUpdate);
        };
    }, [socket, post, feed]);

    function handleSend(e) {
        e.preventDefault();
        if (!text.trim() || !socket) return;
        socket.emit("commentMessageAdd", {
            imgId: post._id,
            sessionUserName: feed.userName,
            newComment: text,
            usernamePostOwner: post.username,
            sessionUserPicture: feed.sessionProfilePicture
        });
        setText("");
    }

    const allComments = comments.flatMap((c) => c.userWhoComment.map((u) => ({ ...u, id: c._id })));

    const photos = post.photos?.[0]
        ? [post.photos[0].photo1, post.photos[0].photo2, post.photos[0].photo3, post.photos[0].photo4]
        : [];

    return (
        <div className="comment-modal-overlay" onClick={onClose}>
            <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
                <button className="comment-modal-close" onClick={onClose}>✕</button>

                <div className="comment-modal-image-wrap">
                    <PostCarousel photos={photos} eager />
                </div>

                <div className="comment-modal-side">
                    <header className="comment-modal-header">
                        <img loading="lazy" decoding="async"
                src={profileImage(post.profilePhoto)} alt="" />
                        <span>{post.username}</span>
                        <img className="dots" loading="lazy" decoding="async"
                src={`${API_BASE}/Icons/dots.png`} alt="" />
                    </header>

                    <div className="comment-modal-list">
                        {post.description && (
                            <div className="comment-item comment-caption">
                                <img className="comment-item-avatar" loading="lazy" decoding="async"
                src={profileImage(post.profilePhoto)} alt="" />
                                <span><strong>{post.username}</strong> {post.description}</span>
                            </div>
                        )}

                        {allComments.length ? allComments.map((c, i) => (
                            <div key={i} className="comment-item">
                                <img className="comment-item-avatar" loading="lazy" decoding="async"
                src={profileImage(c.userPicture)} alt="" />
                                <span><strong>{c.username}</strong> {c.userComment}</span>
                            </div>
                        )) : <p className="comment-empty">Henüz yorum yok.</p>}
                    </div>

                    <div className="comment-modal-actions">
                        <button onClick={onToggleLike} title="Beğen">
                            <img loading="lazy" decoding="async"
                src={`${API_BASE}/Icons/${liked ? "redHeart.png" : "heart.png"}`} alt="" />
                        </button>
                        <button onClick={() => setShowShare(true)} title="Gönder">
                            <img loading="lazy" decoding="async"
                src={`${API_BASE}/Icons/direct-instagram.png`} alt="" />
                        </button>
                        <button
                            className={saved ? "bookmark-btn saved" : "bookmark-btn"}
                            onClick={onToggleSave}
                            title={saved ? "Kaydedildi" : "Kaydet"}
                        >
                            <img
                                loading="lazy"
                                decoding="async"
                                src={`${API_BASE}/Icons/bookmark.png`}
                                alt=""
                                style={saved ? {
                                    WebkitMaskImage: `url(${API_BASE}/Icons/bookmark.png)`,
                                    maskImage: `url(${API_BASE}/Icons/bookmark.png)`,
                                    WebkitMaskSize: "contain",
                                    maskSize: "contain",
                                    WebkitMaskRepeat: "no-repeat",
                                    maskRepeat: "no-repeat",
                                    WebkitMaskPosition: "center",
                                    maskPosition: "center"
                                } : undefined}
                            />
                        </button>
                    </div>

                    <button className="comment-view-likes" onClick={() => setShowLikes(true)}>
                        Beğenmeleri görüntüle
                    </button>

                    <form className="comment-form" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Yorum ekle..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <button type="submit">Gönder</button>
                    </form>
                </div>
            </div>

            {showLikes && <LikesModal postId={post._id} onClose={() => setShowLikes(false)} />}
            {showShare && <ShareModal post={post} onClose={() => setShowShare(false)} />}
        </div>
    );
}

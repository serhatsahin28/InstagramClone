import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE, profileImage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import PostCarousel from "./PostCarousel";
import LikesModal from "./LikesModal";
import ShareModal from "./ShareModal";
import PostMenu from "./PostMenu";
import SaveIcon from "./SaveIcon";
import Caption from "./Caption";
import { timeAgo } from "../utils/timeAgo";
import "./CommentModal.css";

export default function CommentModal({ post, onClose, onDeleted, onEdited, liked, onToggleLike, saved, onToggleSave }) {
    const { feed } = useAuth();
    const socket = useSocket();
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [showLikes, setShowLikes] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [description, setDescription] = useState(post.description);
    const [replyTo, setReplyTo] = useState(null); // { id, username } | null

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
            sessionUserPicture: feed.sessionProfilePicture,
            parentId: replyTo?.id
        });
        setText("");
        setReplyTo(null);
    }

    const allComments = comments.flatMap((c) => c.userWhoComment.map((u) => ({
        ...u, id: c._id, likes: c.likes || [], parentId: c.parentId
    })));
    const topLevelComments = allComments.filter((c) => !c.parentId);
    const repliesByParent = {};
    for (const c of allComments) {
        if (c.parentId) (repliesByParent[c.parentId] ||= []).push(c);
    }

    function renderComment(c, isReply) {
        return (
            <div key={c.id} className={isReply ? "comment-item comment-reply" : "comment-item"}>
                <img className="comment-item-avatar" loading="lazy" decoding="async"
                    src={profileImage(c.userPicture)} alt="" />
                <span className="comment-item-text">
                    <Link to={`/${c.username}`} className="comment-item-username"><strong>{c.username}</strong></Link> {c.userComment}
                    <button className="comment-item-reply-btn" onClick={() => setReplyTo({ id: c.id, username: c.username })}>
                        Yanıtla
                    </button>
                </span>
                <div className="comment-item-side">
                    <button
                        className="comment-item-like"
                        onClick={() => socket?.emit("commentLike", { commentId: c.id, sessionUserName: feed.userName })}
                    >
                        <img
                            loading="lazy" decoding="async"
                            src={`${API_BASE}/Icons/${c.likes.some((l) => l.username === feed?.userName) ? "redHeart.png" : "heart.png"}`}
                            alt=""
                        />
                        {c.likes.length > 0 && <span className="comment-item-like-count">{c.likes.length}</span>}
                    </button>
                    {(c.username === feed?.userName || post.username === feed?.userName) && (
                        <button
                            className="comment-item-delete"
                            onClick={() => socket?.emit("commentDelete", { commentId: c.id, sessionUserName: feed.userName })}
                        >
                            Sil
                        </button>
                    )}
                </div>
            </div>
        );
    }

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
                        <Link to={`/${post.username}`} className="comment-modal-username">{post.username}</Link>
                        <PostMenu
                            post={{ ...post, description }}
                            className="dots"
                            onDeleted={() => {
                                onDeleted?.();
                                onClose();
                            }}
                            onEdited={(next) => {
                                setDescription(next);
                                onEdited?.(next);
                            }}
                        />
                    </header>

                    <div className="comment-modal-list">
                        {description && (
                            <div className="comment-item comment-caption">
                                <img className="comment-item-avatar" loading="lazy" decoding="async"
                src={profileImage(post.profilePhoto)} alt="" />
                                <span><Link to={`/${post.username}`} className="comment-item-username"><strong>{post.username}</strong></Link> <Caption text={description} /></span>
                            </div>
                        )}

                        {topLevelComments.length ? topLevelComments.map((c) => (
                            <div key={c.id} className="comment-thread">
                                {renderComment(c, false)}
                                {repliesByParent[c.id]?.map((r) => renderComment(r, true))}
                            </div>
                        )) : <p className="comment-empty">Henüz yorum yok.</p>}
                    </div>

                    <span className="comment-modal-time">{timeAgo(post._id)}</span>

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
                            <SaveIcon saved={saved} />
                        </button>
                    </div>

                    <button className="comment-view-likes" onClick={() => setShowLikes(true)}>
                        Beğenmeleri görüntüle
                    </button>

                    {replyTo && (
                        <div className="comment-reply-banner">
                            <span>@{replyTo.username} kullanıcısına yanıt veriyorsun</span>
                            <button onClick={() => setReplyTo(null)}>✕</button>
                        </div>
                    )}

                    <form className="comment-form" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder={replyTo ? "Yanıt yaz..." : "Yorum ekle..."}
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

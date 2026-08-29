import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE, profileImage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import "./ReelCommentsDrawer.css";

// CommentModal ile ayni socket olaylarini (commentPost/commentMessageAdd/
// commentDelete/commentLike) kullanir; sadece daha sade, alttan acilan bir
// yerlesimi var (Reels'te resim paneli olmadigi icin).
export default function ReelCommentsDrawer({ reel, onClose }) {
    const { feed } = useAuth();
    const socket = useSocket();
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");

    useEffect(() => {
        if (!socket) return;

        socket.emit("commentPost", { data: { imgId: reel._id }, sessionUserName: feed.userName });

        function onInitial({ query, post_id }) {
            if (post_id !== reel._id) return;
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
    }, [socket, reel, feed]);

    function handleSend(e) {
        e.preventDefault();
        if (!text.trim() || !socket) return;
        socket.emit("commentMessageAdd", {
            imgId: reel._id,
            sessionUserName: feed.userName,
            newComment: text,
            usernamePostOwner: reel.username,
            sessionUserPicture: feed.sessionProfilePicture
        });
        setText("");
    }

    const allComments = comments.flatMap((c) => c.userWhoComment.map((u) => ({ ...u, id: c._id, likes: c.likes || [] })));

    return (
        <div className="reel-comments-overlay" onClick={onClose}>
            <div className="reel-comments-drawer" onClick={(e) => e.stopPropagation()}>
                <div className="reel-comments-header">
                    <span>Yorumlar</span>
                    <button onClick={onClose}>✕</button>
                </div>

                <div className="reel-comments-list">
                    {allComments.length ? allComments.map((c) => (
                        <div key={c.id} className="reel-comment-item">
                            <img loading="lazy" decoding="async" src={profileImage(c.userPicture)} alt="" />
                            <span className="reel-comment-text"><Link to={`/${c.username}`} className="reel-comment-username"><strong>{c.username}</strong></Link> {c.userComment}</span>
                            <div className="reel-comment-side">
                                <button
                                    className="reel-comment-like"
                                    onClick={() => socket?.emit("commentLike", { commentId: c.id, sessionUserName: feed.userName })}
                                >
                                    <img
                                        loading="lazy" decoding="async"
                                        src={`${API_BASE}/Icons/${c.likes.some((l) => l.username === feed?.userName) ? "redHeart.png" : "heart.png"}`}
                                        alt=""
                                    />
                                    {c.likes.length > 0 && <span>{c.likes.length}</span>}
                                </button>
                                {(c.username === feed?.userName || reel.username === feed?.userName) && (
                                    <button
                                        className="reel-comment-delete"
                                        onClick={() => socket?.emit("commentDelete", { commentId: c.id, sessionUserName: feed.userName })}
                                    >
                                        Sil
                                    </button>
                                )}
                            </div>
                        </div>
                    )) : <p className="reel-comments-empty">Henüz yorum yok.</p>}
                </div>

                <form className="reel-comment-form" onSubmit={handleSend}>
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
    );
}

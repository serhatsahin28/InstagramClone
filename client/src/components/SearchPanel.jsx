import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, API_BASE, profileImage, thumbImage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import SlidePanel from "./SlidePanel";
import PostModal from "./PostModal";
import "../pages/Explore.css";
import "./SearchPanel.css";

export default function SearchPanel({ open, onClose }) {
    const { feed } = useAuth();
    const socket = useSocket();
    const [term, setTerm] = useState("");
    const [results, setResults] = useState([]);
    const [explorePosts, setExplorePosts] = useState(null);
    const [openPost, setOpenPost] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (!socket) return;
        function onResults(users) {
            setResults(users);
        }
        socket.on("searchUser2", onResults);
        return () => socket.off("searchUser2", onResults);
    }, [socket]);

    useEffect(() => {
        if (open) {
            inputRef.current?.focus();
            // Mobilde arama panelinin altinda "Kesfet" izgarasi gosterilir;
            // panel her acildiginda degil, ilk sefer yuklenir.
            if (explorePosts === null) {
                api.get("/posts/explore")
                    .then((res) => setExplorePosts(res.posts || []))
                    .catch(() => setExplorePosts([]));
            }
        } else {
            setTerm("");
            setResults([]);
        }
    }, [open, explorePosts]);

    const likedPostIds = new Set((feed?.userLikePostUser || []).map((l) => String(l.post_id)));
    const savedPostIds = new Set(feed?.savedPostIds || []);

    function handleChange(e) {
        const value = e.target.value;
        setTerm(value);
        if (!socket) return;
        if (!value.trim()) {
            setResults([]);
            return;
        }
        socket.emit("searchUser", { formUser: value, sessionUserName: feed.userName });
    }

    return (
        <SlidePanel open={open} title="Ara" onClose={onClose}>
            <div className="search-panel-input-wrap">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ara"
                    value={term}
                    onChange={handleChange}
                />
                {term && (
                    <button className="search-panel-clear" onClick={() => { setTerm(""); setResults([]); }}>
                        ✕
                    </button>
                )}
            </div>

            <div className="slide-panel-list">
                {term.trim() === "" ? (
                    <>
                        <p className="slide-panel-hint search-panel-hint-desktop">
                            Aramak istediğin kişinin adını yaz.
                        </p>

                        <div className="search-panel-explore">
                            {explorePosts === null ? null : explorePosts.length === 0 ? (
                                <p className="explore-empty">Henüz gösterilecek gönderi yok.</p>
                            ) : (
                                <div className="explore-grid">
                                    {explorePosts.map((post) => {
                                        const p = post.photos?.[0] || {};
                                        const isMulti = [p.photo2, p.photo3, p.photo4].some(Boolean);
                                        return (
                                            <button
                                                key={post._id}
                                                className="explore-grid-item"
                                                onClick={() => setOpenPost(post)}
                                            >
                                                {isMulti && (
                                                    <img className="explore-grid-multi" src={`${API_BASE}/Icons/instagramPost.png`} alt="" />
                                                )}
                                                <img loading="lazy" decoding="async" src={thumbImage(p.photo1)} alt="" />
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                ) : results.length === 0 ? (
                    <p className="slide-panel-hint">Sonuç bulunamadı.</p>
                ) : (
                    results.map((user) => (
                        <Link
                            key={user._id}
                            to={`/${user.username}`}
                            className="slide-panel-row"
                            onClick={onClose}
                        >
                            <img loading="lazy" decoding="async"
                src={profileImage(user.profilePicture)} alt="" />
                            <div className="slide-panel-row-text">
                                <span className="username">{user.username}</span>
                                <span className="muted">{user.profileName}</span>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {openPost && (
                <PostModal
                    post={openPost}
                    onClose={() => setOpenPost(null)}
                    onDeleted={() => {
                        const id = openPost._id;
                        setOpenPost(null);
                        setExplorePosts((prev) => prev?.filter((p) => p._id !== id) ?? prev);
                    }}
                    onHidden={() => {
                        const id = openPost._id;
                        setOpenPost(null);
                        setExplorePosts((prev) => prev?.filter((p) => p._id !== id) ?? prev);
                    }}
                    onEdited={(description) => {
                        const id = openPost._id;
                        setExplorePosts((prev) => prev?.map((p) => (p._id === id ? { ...p, description } : p)) ?? prev);
                    }}
                    likedByMe={likedPostIds.has(String(openPost._id))}
                    savedByMe={savedPostIds.has(String(openPost._id))}
                />
            )}
        </SlidePanel>
    );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, thumbImage } from "../api/client";
import Sidebar from "../components/Sidebar";
import PostModal from "../components/PostModal";
import { useAuth } from "../context/AuthContext";
import "./Settings.css";

const TABS = [
    { key: "saved", label: "Kaydedilenler" },
    { key: "liked", label: "Beğenilenler" },
    { key: "comments", label: "Yorumlar" },
    { key: "privacy", label: "Gizli hesap" }
];

function PostGrid({ posts, emptyText, onOpen }) {
    if (!posts || posts.length === 0) {
        return <p className="settings-empty">{emptyText}</p>;
    }

    return (
        <div className="settings-grid">
            {posts.map((post) => (
                <button key={post._id} className="settings-grid-item" onClick={() => onOpen(post)}>
                    <img src={thumbImage(post.photos[0].photo1)} alt="" loading="lazy" decoding="async" />
                </button>
            ))}
        </div>
    );
}

export default function Settings() {
    const { feed } = useAuth();
    const [tab, setTab] = useState("saved");
    const [openPost, setOpenPost] = useState(null);
    const [saved, setSaved] = useState(null);
    const [liked, setLiked] = useState(null);
    const [comments, setComments] = useState(null);
    const [isPrivate, setIsPrivate] = useState(false);

    useEffect(() => {
        api.get("/users/privacy-setting").then((res) => setIsPrivate(!!res.isPrivate)).catch(() => {});
    }, []);

    useEffect(() => {
        if (tab === "saved" && saved === null) {
            api.get("/posts/saved").then((res) => setSaved(res.posts || [])).catch(() => setSaved([]));
        }
        if (tab === "liked" && liked === null) {
            api.get("/posts/liked").then((res) => setLiked(res.posts || [])).catch(() => setLiked([]));
        }
        if (tab === "comments" && comments === null) {
            api.get("/posts/my-comments").then((res) => setComments(res.items || [])).catch(() => setComments([]));
        }
    }, [tab, saved, liked, comments]);

    async function handlePrivacyToggle() {
        const next = !isPrivate;
        setIsPrivate(next);

        const form = new FormData();
        // Backend geçmişten beri name="true" değerini "herkese açık yap" olarak yorumluyor.
        form.append("name", String(!next));
        await api.post("/users/privacy-setting", form);
    }

    return (
        <div className="home-layout">
            <Sidebar />
            <main className="settings-page">
                <h2>Ayarlar</h2>

                <div className="settings-tabs">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            className={tab === t.key ? "active" : undefined}
                            onClick={() => setTab(t.key)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab === "saved" && (
                    <PostGrid posts={saved} emptyText="Henüz kaydedilmiş gönderin yok." onOpen={setOpenPost} />
                )}

                {tab === "liked" && (
                    <PostGrid posts={liked} emptyText="Henüz beğendiğin gönderi yok." onOpen={setOpenPost} />
                )}

                {tab === "comments" && (
                    comments && comments.length > 0 ? (
                        <div className="settings-comments">
                            {comments.map((item) => (
                                <div key={item.id} className="settings-comment-row">
                                    {item.post?.photos?.[0]?.photo1 && (
                                        <button className="settings-comment-thumb" onClick={() => setOpenPost(item.post)}>
                                            <img src={thumbImage(item.post.photos[0].photo1)} alt="" loading="lazy" decoding="async" />
                                        </button>
                                    )}
                                    <div className="settings-comment-text">
                                        <span className="comment-body">{item.comment}</span>
                                        <Link to={`/${item.postOwnerUsername}`} className="comment-owner">
                                            @{item.postOwnerUsername} gönderisinde
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="settings-empty">Henüz yorum yapmadın.</p>
                    )
                )}

                {tab === "privacy" && (
                    <div className="settings-privacy">
                        <div className="settings-privacy-text">
                            <span className="title">Gizli hesap</span>
                            <span className="muted">
                                Açıkken gönderilerini yalnızca onayladığın takipçiler görebilir.
                            </span>
                        </div>
                        <button className={isPrivate ? "toggle on" : "toggle"} onClick={handlePrivacyToggle}>
                            <span className="toggle-dot" />
                        </button>
                    </div>
                )}
            </main>

            {openPost && (
                <PostModal
                    post={openPost}
                    onClose={() => setOpenPost(null)}
                    likedByMe={(feed?.userLikePostUser || []).some((l) => String(l.post_id) === String(openPost._id))}
                    savedByMe={(feed?.savedPostIds || []).includes(String(openPost._id))}
                />
            )}
        </div>
    );
}

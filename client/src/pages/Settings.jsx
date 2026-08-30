import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, API_BASE, thumbImage } from "../api/client";
import Sidebar from "../components/Sidebar";
import PostModal from "../components/PostModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Spinner from "../components/Spinner";
import "./Settings.css";

const TABS = [
    { key: "saved", label: "Kaydedilenler" },
    { key: "liked", label: "Beğenilenler" },
    { key: "comments", label: "Yorumlar" },
    { key: "privacy", label: "Gizli hesap" },
    { key: "theme", label: "Görünüm" },
    { key: "account", label: "Hesap" }
];

function PostGrid({ posts, emptyText, onOpen }) {
    if (posts === null) return <Spinner />;
    if (posts.length === 0) {
        return <p className="settings-empty">{emptyText}</p>;
    }

    return (
        <div className="settings-grid">
            {posts.map((post) => {
                const p = post.photos?.[0] || {};
                const isMulti = [p.photo2, p.photo3, p.photo4].some(Boolean);
                return (
                    <button key={post._id} className="settings-grid-item" onClick={() => onOpen(post)}>
                        {isMulti && (
                            <img className="profile-grid-multi" src={`${API_BASE}/Icons/instagramPost.png`} alt="" />
                        )}
                        <img loading="lazy" decoding="async"
                src={thumbImage(p.photo1)} alt="" />
                    </button>
                );
            })}
        </div>
    );
}

export default function Settings() {
    const { feed } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [tab, setTab] = useState("saved");
    const [openPost, setOpenPost] = useState(null);
    const [saved, setSaved] = useState(null);
    const [liked, setLiked] = useState(null);
    const [comments, setComments] = useState(null);
    const [isPrivate, setIsPrivate] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);

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

    async function handleDeleteAccount() {
        if (!deletePassword.trim()) {
            setDeleteError("Şifreni girmelisin");
            return;
        }
        if (!window.confirm("Hesabını kalıcı olarak silmek istediğine emin misin? Tüm gönderilerin, mesajların ve verilerin silinir; bu işlem geri alınamaz.")) {
            return;
        }

        setDeleteError("");
        setDeleting(true);
        try {
            await api.delete("/users/me", { password: deletePassword });
            // Oturum sunucuda zaten sonlandirildi; temiz bir durum icin
            // sayfayi tam olarak yeniliyoruz.
            window.location.href = "/login";
        } catch (err) {
            setDeleteError(err.data?.error || "Hesap silinemedi");
            setDeleting(false);
        }
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
                    comments === null ? <Spinner /> : comments.length > 0 ? (
                        <div className="settings-comments">
                            {comments.map((item) => (
                                <div key={item.id} className="settings-comment-row">
                                    {item.post?.photos?.[0]?.photo1 && (
                                        <button className="settings-comment-thumb" onClick={() => setOpenPost(item.post)}>
                                            <img loading="lazy" decoding="async"
                src={thumbImage(item.post.photos[0].photo1)} alt="" />
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

                {tab === "theme" && (
                    <div className="settings-privacy">
                        <div className="settings-privacy-text">
                            <span className="title">Koyu tema</span>
                            <span className="muted">
                                Açıkken uygulama koyu renklerde görünür.
                            </span>
                        </div>
                        <button className={theme === "dark" ? "toggle on" : "toggle"} onClick={toggleTheme}>
                            <span className="toggle-dot" />
                        </button>
                    </div>
                )}

                {tab === "account" && (
                    <div className="settings-danger-zone">
                        <span className="title">Hesabı sil</span>
                        <span className="muted">
                            Hesabın, tüm gönderilerin, yorumların, hikayelerin ve mesajların kalıcı olarak silinir.
                            Bu işlem geri alınamaz.
                        </span>
                        <input
                            type="password"
                            placeholder="Şifreni onayla"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                        />
                        {deleteError && <p className="settings-danger-error">{deleteError}</p>}
                        <button className="settings-danger-btn" onClick={handleDeleteAccount} disabled={deleting}>
                            {deleting ? "Siliniyor..." : "Hesabımı kalıcı olarak sil"}
                        </button>
                    </div>
                )}
            </main>

            {openPost && (
                <PostModal
                    post={openPost}
                    onClose={() => setOpenPost(null)}
                    onDeleted={() => {
                        const id = openPost._id;
                        setOpenPost(null);
                        setSaved((prev) => prev?.filter((p) => p._id !== id) ?? prev);
                        setLiked((prev) => prev?.filter((p) => p._id !== id) ?? prev);
                    }}
                    onEdited={(description) => {
                        const id = openPost._id;
                        const patch = (p) => (p._id === id ? { ...p, description } : p);
                        setSaved((prev) => prev?.map(patch) ?? prev);
                        setLiked((prev) => prev?.map(patch) ?? prev);
                    }}
                    likedByMe={(feed?.userLikePostUser || []).some((l) => String(l.post_id) === String(openPost._id))}
                    savedByMe={(feed?.savedPostIds || []).includes(String(openPost._id))}
                />
            )}
        </div>
    );
}

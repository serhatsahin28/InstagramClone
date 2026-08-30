import { useEffect, useState } from "react";
import { api, API_BASE, thumbImage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import PostModal from "../components/PostModal";
import Spinner from "../components/Spinner";
import "./Explore.css";

// Takip durumundan bağımsız, rastgele karışık gönderiler. Normal akışta
// (Anasayfa) yalnızca takip edilenlerin paylaşımları görünür, burada herkesinki.
export default function Explore() {
    const { feed } = useAuth();
    const [posts, setPosts] = useState(null);
    const [openPost, setOpenPost] = useState(null);

    useEffect(() => {
        api.get("/posts/explore")
            .then((res) => setPosts(res.posts || []))
            .catch(() => setPosts([]));
    }, []);

    const likedPostIds = new Set((feed?.userLikePostUser || []).map((l) => String(l.post_id)));
    const savedPostIds = new Set(feed?.savedPostIds || []);

    return (
        <div className="home-layout">
            <Sidebar />
            <main className="explore-page">
                <h2 className="explore-title">Keşfet</h2>

                {posts === null ? <Spinner /> : posts.length === 0 ? (
                    <p className="explore-empty">Henüz gösterilecek gönderi yok.</p>
                ) : (
                    <div className="explore-grid">
                        {posts.map((post) => {
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
            </main>

            {openPost && (
                <PostModal
                    post={openPost}
                    onClose={() => setOpenPost(null)}
                    onDeleted={() => {
                        const id = openPost._id;
                        setOpenPost(null);
                        setPosts((prev) => prev?.filter((p) => p._id !== id) ?? prev);
                    }}
                    onHidden={() => {
                        const id = openPost._id;
                        setOpenPost(null);
                        setPosts((prev) => prev?.filter((p) => p._id !== id) ?? prev);
                    }}
                    onEdited={(description) => {
                        const id = openPost._id;
                        setPosts((prev) => prev?.map((p) => (p._id === id ? { ...p, description } : p)) ?? prev);
                    }}
                    likedByMe={likedPostIds.has(String(openPost._id))}
                    savedByMe={savedPostIds.has(String(openPost._id))}
                />
            )}
        </div>
    );
}

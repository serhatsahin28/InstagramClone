import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API_BASE, api, profileImage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import StoryViewersModal from "../components/StoryViewersModal";
import Spinner from "../components/Spinner";
import "./Story.css";

const STORY_DURATION_MS = 15000;

export default function Story() {
    const { username, id } = useParams();
    const navigate = useNavigate();
    const { feed } = useAuth();

    const [stories, setStories] = useState(null);
    const [index, setIndex] = useState(0);
    const [liked, setLiked] = useState(false);
    const [showViewers, setShowViewers] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // Liste yalnizca bir kez cekilir; ileri/geri tamamen istemci tarafinda
    // ilerledigi icin her gecis aninda olur, yeniden istek atilmaz.
    const fetched = useRef(false);

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;

        api.get(`/stories/${username}/${id}`)
            .then((res) => {
                const list = res.allStory || [];
                const start = list.findIndex((s) => String(s._id) === String(id));

                setStories(list);
                setIndex(start >= 0 ? start : 0);
            })
            .catch(() => setStories([]));
    }, [username, id]);

    const current = stories?.[index] || null;

    // Adres cubugu goruntulenen hikayeyi yansitsin (yeniden istek atmadan).
    useEffect(() => {
        if (!current) return;
        navigate(`/stories/${current.username}/${current._id}`, { replace: true });
    }, [current, navigate]);

    // Görüntüleme kaydı + beğeni durumu, gösterilen hikaye değiştikçe tazelenir.
    useEffect(() => {
        if (!current) return;
        setLiked(false);
        setShowViewers(false);
        setShowMenu(false);

        api.post(`/stories/${current._id}/view`).catch(() => {});

        if (current.username === feed?.userName) {
            api.get(`/stories/${current._id}/viewers`)
                .then((res) => setLiked(!!res.viewers?.find((v) => v.username === feed.userName && v.liked)))
                .catch(() => {});
        }
    }, [current, feed]);

    // Komsu gorseller onceden indirilir; gecis beklemesiz olur.
    useEffect(() => {
        if (!stories) return;

        for (const i of [index + 1, index - 1]) {
            const s = stories[i];
            if (s) {
                const img = new Image();
                img.src = profileImage(s.storie);
            }
        }
    }, [index, stories]);

    const goPrev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
    const goNext = useCallback(
        () => setIndex((i) => Math.min((stories?.length || 1) - 1, i + 1)),
        [stories]
    );

    const isLast = !!stories && index >= stories.length - 1;

    // 15 saniye dolunca otomatik sıradaki hikayeye geç; son hikayedeysek çık.
    function handleTimerEnd() {
        if (isLast) navigate("/");
        else goNext();
    }

    useEffect(() => {
        function onKey(e) {
            if (e.key === "ArrowLeft") goPrev();
            else if (e.key === "ArrowRight") goNext();
            else if (e.key === "Escape") navigate("/");
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [goPrev, goNext, navigate]);

    async function handleDelete() {
        if (!current) return;
        setShowMenu(false);

        await api.delete(`/stories/${current._id}`, { storyId: current._id });

        const remaining = stories.filter((s) => s._id !== current._id);
        if (remaining.length === 0) {
            navigate("/");
            return;
        }

        setStories(remaining);
        setIndex(Math.min(index, remaining.length - 1));
    }

    async function handleAddToHighlight() {
        setShowMenu(false);
        const title = window.prompt("Öne çıkan adı (yeni ya da mevcut bir isim yaz):");
        if (!title || !title.trim()) return;

        try {
            await api.post("/highlights", { title, storyId: current._id });
            window.alert(`"${title.trim()}" öne çıkanına eklendi.`);
        } catch (err) {
            window.alert(err.data?.error || "Eklenemedi");
        }
    }

    async function toggleLike() {
        const next = !liked;
        setLiked(next);
        try {
            if (next) await api.post(`/stories/${current._id}/like`);
            else await api.delete(`/stories/${current._id}/like`);
        } catch {
            setLiked(!next);
        }
    }

    if (!stories) return <div className="story-page"><Spinner /></div>;
    if (!current) return null;

    const isOwn = current.username === feed?.userName;
    const paused = showViewers || showMenu;

    // Ust cubuk, o an goruntulenen kullanicinin hikaye sayisini gosterir.
    const sameUser = stories.filter((s) => s.username === current.username);
    const sameUserIndex = sameUser.findIndex((s) => s._id === current._id);

    const prevStory = stories[index - 1];
    const nextStory = stories[index + 1];

    return (
        <div className="story-page">
            <div className="story-viewer">
                {prevStory && (
                    <img
                        className="story-peek left"
                        src={profileImage(prevStory.storie)}
                        alt=""
                        onClick={goPrev}
                    />
                )}

                <div className="story-progress">
                    {sameUser.map((s, i) => (
                        <span className="story-progress-track" key={s._id}>
                            {i < sameUserIndex && <span className="story-progress-fill full" />}
                            {i === sameUserIndex && (
                                <span
                                    className={paused ? "story-progress-fill playing paused" : "story-progress-fill playing"}
                                    style={{ animationDuration: `${STORY_DURATION_MS}ms` }}
                                    onAnimationEnd={handleTimerEnd}
                                />
                            )}
                        </span>
                    ))}
                </div>

                <div className="story-top-actions">
                    {isOwn && (
                        <button className="story-menu-btn" onClick={() => setShowMenu((v) => !v)} aria-label="Daha fazla">⋮</button>
                    )}
                    <button className="story-close" onClick={() => navigate("/")}>✕</button>

                    {showMenu && (
                        <>
                            <div className="story-menu-backdrop" onClick={() => setShowMenu(false)} />
                            <div className="story-menu-dropdown">
                                <button onClick={handleAddToHighlight}>Öne Çıkar</button>
                                <button onClick={handleDelete}>Sil</button>
                            </div>
                        </>
                    )}
                </div>

                <header className="story-viewer-header">
                    <img src={profileImage(current.profilePicture)} alt="" />
                    <Link to={`/${current.username}`} className="story-viewer-username">{current.username}</Link>
                </header>

                <img
                    className="story-viewer-image"
                    src={profileImage(current.storie)}
                    alt=""
                    // Aynı <img> yeniden kullanilinca eski kare kisa sure gorunuyordu.
                    key={current._id}
                />

                {current.text && <div className="story-viewer-text">{current.text}</div>}

                {index > 0 && (
                    <button className="story-nav prev" onClick={goPrev} aria-label="Önceki">‹</button>
                )}
                {index < stories.length - 1 && (
                    <button className="story-nav next" onClick={goNext} aria-label="Sonraki">›</button>
                )}

                <div className="story-footer">
                    {!isOwn && (
                        <button className="story-like-btn" onClick={toggleLike} title="Beğen">
                            <img src={`${API_BASE}/Icons/${liked ? "redHeart.png" : "heart.png"}`} alt="beğen" />
                        </button>
                    )}

                    {isOwn && (
                        <button className="story-viewers-btn" onClick={() => setShowViewers(true)}>
                            Görüntüleyenler
                        </button>
                    )}
                </div>

                {nextStory && (
                    <img
                        className="story-peek right"
                        src={profileImage(nextStory.storie)}
                        alt=""
                        onClick={goNext}
                    />
                )}
            </div>

            {showViewers && (
                <StoryViewersModal storyId={current._id} onClose={() => setShowViewers(false)} />
            )}
        </div>
    );
}

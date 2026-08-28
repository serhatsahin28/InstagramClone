import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, profileImage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import "./Story.css";

export default function Story() {
    const { username, id } = useParams();
    const navigate = useNavigate();
    const { feed } = useAuth();

    const [stories, setStories] = useState(null);
    const [index, setIndex] = useState(0);

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

        await api.delete(`/stories/${current._id}`, { storyId: current._id });

        const remaining = stories.filter((s) => s._id !== current._id);
        if (remaining.length === 0) {
            navigate("/");
            return;
        }

        setStories(remaining);
        setIndex(Math.min(index, remaining.length - 1));
    }

    if (!stories) return <div className="story-page" />;
    if (!current) return null;

    const isOwn = current.username === feed?.userName;

    // Ust cubuk, o an goruntulenen kullanicinin hikaye sayisini gosterir.
    const sameUser = stories.filter((s) => s.username === current.username);
    const sameUserIndex = sameUser.findIndex((s) => s._id === current._id);

    return (
        <div className="story-page">
            <div className="story-viewer">
                <div className="story-progress">
                    {sameUser.map((s, i) => (
                        <span key={s._id} className={i <= sameUserIndex ? "seen" : undefined} />
                    ))}
                </div>

                <button className="story-close" onClick={() => navigate("/")}>✕</button>

                <header className="story-viewer-header">
                    <img src={profileImage(current.profilePicture)} alt="" />
                    <span>{current.username}</span>
                </header>

                <img
                    className="story-viewer-image"
                    src={profileImage(current.storie)}
                    alt=""
                    // Aynı <img> yeniden kullanilinca eski kare kisa sure gorunuyordu.
                    key={current._id}
                />

                {index > 0 && (
                    <button className="story-nav prev" onClick={goPrev} aria-label="Önceki">‹</button>
                )}
                {index < stories.length - 1 && (
                    <button className="story-nav next" onClick={goNext} aria-label="Sonraki">›</button>
                )}

                {isOwn && (
                    <button className="story-delete" onClick={handleDelete}>Hikayeyi Sil</button>
                )}
            </div>
        </div>
    );
}

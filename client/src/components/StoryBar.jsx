import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { profileImage } from "../api/client";
import StoryUploadModal from "./StoryUploadModal";
import "./StoryBar.css";

function groupByUser(stories) {
    const map = new Map();
    for (const story of stories) {
        if (!map.has(story.username)) map.set(story.username, story);
    }
    return Array.from(map.values());
}

export default function StoryBar({ stories, sessionUserStories, sessionUserName, sessionProfilePicture }) {
    const others = groupByUser(stories || []);
    const trackRef = useRef(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);
    const [showUpload, setShowUpload] = useState(false);

    const updateArrows = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        setCanPrev(el.scrollLeft > 4);
        setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, []);

    useEffect(() => {
        updateArrows();
        window.addEventListener("resize", updateArrows);
        return () => window.removeEventListener("resize", updateArrows);
    }, [updateArrows, others.length]);

    function scrollBy(direction) {
        const el = trackRef.current;
        if (!el) return;

        // Tam hikaye genişliği (daire + boşluk) katları kadar kaydır ki yarım daire kalmasın.
        const item = el.querySelector(".story-item");
        const step = item ? item.offsetWidth + 16 : 86;
        const perPage = Math.max(1, Math.floor(el.clientWidth / step));

        el.scrollBy({ left: direction * perPage * step, behavior: "smooth" });
    }

    return (
        <div className="story-bar">
            {canPrev && (
                <button className="story-nav-btn prev" onClick={() => scrollBy(-1)} aria-label="Önceki">
                    ‹
                </button>
            )}

            <div className="story-track" ref={trackRef} onScroll={updateArrows}>
                {sessionUserStories?.length > 0 ? (
                    <div className="story-item">
                        <span className="story-item-avatar-wrap">
                            <Link to={`/stories/${sessionUserName}/${sessionUserStories[0]._id}`}>
                                <img loading="lazy" decoding="async"
                src={profileImage(sessionProfilePicture)} alt="" />
                            </Link>
                            <button
                                className="story-add-btn"
                                onClick={() => setShowUpload(true)}
                                aria-label="Yeni hikaye ekle"
                            >
                                +
                            </button>
                        </span>
                        <span>Hikayen</span>
                    </div>
                ) : (
                    <button className="story-item" onClick={() => setShowUpload(true)}>
                        <span className="story-item-avatar-wrap">
                            <img loading="lazy" decoding="async"
                src={profileImage(sessionProfilePicture)} alt="" />
                            <span className="story-add-btn">+</span>
                        </span>
                        <span>Hikayen</span>
                    </button>
                )}

                {others.map((story) => (
                    <Link key={story._id} to={`/stories/${story.username}/${story._id}`} className="story-item">
                        <img loading="lazy" decoding="async"
                src={profileImage(story.profilePicture)} alt="" />
                        <span>{story.username}</span>
                    </Link>
                ))}
            </div>

            {canNext && (
                <button className="story-nav-btn next" onClick={() => scrollBy(1)} aria-label="Sonraki">
                    ›
                </button>
            )}

            {showUpload && <StoryUploadModal onClose={() => setShowUpload(false)} />}
        </div>
    );
}

import { useState } from "react";
import { api, profileImage } from "../api/client";
import "./HighlightViewer.css";

// Bir "one cikan" icindeki hikayeleri elle ileri/geri gezerek gosteren
// basit bir goruntuleyici. Hikaye izleyicisinden farkli olarak otomatik
// zamanlayicisi yok; kucuk, sinirli bir koleksiyon oldugu icin gerek yok.
export default function HighlightViewer({ highlight, isOwn, onClose, onDeleted }) {
    const [index, setIndex] = useState(0);

    async function handleDelete() {
        if (!window.confirm(`"${highlight.title}" öne çıkanını silmek istediğine emin misin?`)) return;
        await api.delete(`/highlights/${highlight._id}`);
        onDeleted?.();
        onClose();
    }

    const photo = highlight.stories[index];

    return (
        <div className="highlight-viewer-overlay" onClick={onClose}>
            <div className="highlight-viewer" onClick={(e) => e.stopPropagation()}>
                <div className="highlight-viewer-progress">
                    {highlight.stories.map((s, i) => (
                        <span key={i} className={i <= index ? "seen" : undefined} />
                    ))}
                </div>

                <div className="highlight-viewer-header">
                    <span>{highlight.title}</span>
                    <div className="highlight-viewer-header-actions">
                        {isOwn && <button onClick={handleDelete}>Sil</button>}
                        <button onClick={onClose}>✕</button>
                    </div>
                </div>

                <img className="highlight-viewer-image" src={profileImage(photo)} alt="" />

                {index > 0 && (
                    <button className="highlight-nav prev" onClick={() => setIndex((i) => i - 1)}>‹</button>
                )}
                {index < highlight.stories.length - 1 && (
                    <button className="highlight-nav next" onClick={() => setIndex((i) => i + 1)}>›</button>
                )}
            </div>
        </div>
    );
}

import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import "./StoryUploadModal.css";

export default function StoryUploadModal({ onClose }) {
    const { refresh } = useAuth();
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!file) {
            setPreviewUrl("");
            return;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!file) return;
        setSubmitting(true);

        const form = new FormData();
        form.append("photos", file);
        if (text.trim()) form.append("text", text.trim());

        try {
            await api.post("/stories/upload", form);
            await refresh();
            onClose();
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="story-upload-overlay" onClick={onClose}>
            <div className="story-upload-modal" onClick={(e) => e.stopPropagation()}>
                <button className="story-upload-close" onClick={onClose}>✕</button>
                <h3>Yeni Hikaye</h3>

                <form onSubmit={handleSubmit} className="story-upload-form">
                    {previewUrl ? (
                        <div className="story-upload-preview">
                            <img src={previewUrl} alt="" />
                            {text && <div className="story-upload-preview-text">{text}</div>}
                        </div>
                    ) : (
                        <label className="story-upload-picker">
                            Fotoğraf seç
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files[0] || null)}
                            />
                        </label>
                    )}

                    {previewUrl && (
                        <>
                            <textarea
                                placeholder="Fotoğrafın üzerine metin ekle (isteğe bağlı)..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={2}
                            />
                            <div className="story-upload-actions">
                                <button type="button" className="story-upload-change" onClick={() => setFile(null)}>
                                    Fotoğrafı değiştir
                                </button>
                                <button type="submit" disabled={submitting}>
                                    {submitting ? "Paylaşılıyor..." : "Paylaş"}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}

import { useEffect, useState } from "react";
import { api } from "../api/client";
import "./StoryUploadModal.css";

export default function ReelUploadModal({ onClose, onUploaded }) {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

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
        setError("");

        const form = new FormData();
        form.append("video", file);
        if (description.trim()) form.append("description", description.trim());

        try {
            await api.post("/reels/upload", form);
            onUploaded?.();
            onClose();
        } catch (err) {
            setError(err.data?.error || "Yüklenemedi");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="story-upload-overlay" onClick={onClose}>
            <div className="story-upload-modal" onClick={(e) => e.stopPropagation()}>
                <button className="story-upload-close" onClick={onClose}>✕</button>
                <h3>Yeni Reel</h3>

                <form onSubmit={handleSubmit} className="story-upload-form">
                    {previewUrl ? (
                        <div className="story-upload-preview">
                            <video src={previewUrl} controls muted style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </div>
                    ) : (
                        <label className="story-upload-picker">
                            Video seç
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => setFile(e.target.files[0] || null)}
                            />
                        </label>
                    )}

                    {previewUrl && (
                        <>
                            <textarea
                                placeholder="Açıklama yaz..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                            />
                            {error && <p style={{ color: "#ed4956", fontSize: "0.8rem", margin: 0 }}>{error}</p>}
                            <div className="story-upload-actions">
                                <button type="button" className="story-upload-change" onClick={() => setFile(null)}>
                                    Videoyu değiştir
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

import { useState } from "react";
import { api } from "../api/client";
import "./EditCaptionModal.css";

// Kendi gonderinin aciklamasini duzenlemek icin kucuk bir modal.
export default function EditCaptionModal({ post, onClose, onSaved }) {
    const [text, setText] = useState(post.description || "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function handleSave() {
        setSaving(true);
        setError("");
        try {
            const res = await api.put(`/posts/${post._id}`, { description: text });
            onSaved?.(res.post.description);
            onClose();
        } catch (err) {
            setError(err.data?.error || "Güncellenemedi");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="edit-caption-overlay" onClick={onClose}>
            <div className="edit-caption-modal" onClick={(e) => e.stopPropagation()}>
                <h3>Açıklamayı düzenle</h3>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    autoFocus
                />
                {error && <p className="edit-caption-error">{error}</p>}
                <div className="edit-caption-actions">
                    <button className="edit-caption-cancel" onClick={onClose}>Vazgeç</button>
                    <button className="edit-caption-save" onClick={handleSave} disabled={saving}>
                        {saving ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                </div>
            </div>
        </div>
    );
}

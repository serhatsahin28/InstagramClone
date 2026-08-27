import { useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import "./UploadModal.css";

export default function UploadModal({ onClose }) {
    const { refresh } = useAuth();
    const [files, setFiles] = useState([]);
    const [caption, setCaption] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (files.length === 0) return;
        setSubmitting(true);

        const form = new FormData();
        files.slice(0, 4).forEach((file) => form.append("photos", file));
        form.append("textArea", caption);

        try {
            await api.post("/posts/upload", form);
            await refresh();
            onClose();
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="upload-modal-overlay" onClick={onClose}>
            <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
                <button className="upload-modal-close" onClick={onClose}>✕</button>
                <h3>Yeni Gönderi</h3>

                <form onSubmit={handleSubmit} className="upload-form">
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 4))}
                    />
                    <span className="upload-hint">En fazla 4 fotoğraf seçebilirsin.</span>

                    <textarea
                        placeholder="Açıklama yaz..."
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        rows={3}
                    />

                    <button type="submit" disabled={submitting || files.length === 0}>
                        {submitting ? "Paylaşılıyor..." : "Paylaş"}
                    </button>
                </form>
            </div>
        </div>
    );
}

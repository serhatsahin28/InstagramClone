import { useState } from "react";
import { api, API_BASE } from "../api/client";
import "./EditProfileModal.css";

export default function EditProfileModal({ user, onClose, onSaved }) {
    const [bio, setBio] = useState(user.description || "");
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [saving, setSaving] = useState(false);

    function handlePhoto(e) {
        const file = e.target.files[0];
        setPhoto(file || null);
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);

        const form = new FormData();
        form.append("biography", bio);
        if (photo) form.append("photos", photo);

        try {
            await api.post("/posts/profile-photo/settings", form);
            await onSaved?.();
            onClose();
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="edit-profile-overlay" onClick={onClose}>
            <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
                <header className="edit-profile-header">
                    <span />
                    <h3>Profili Düzenle</h3>
                    <button className="edit-profile-close" onClick={onClose}>✕</button>
                </header>

                <form className="edit-profile-form" onSubmit={handleSubmit}>
                    <div className="edit-profile-photo-row">
                        <img
                            className="edit-profile-avatar"
                            src={preview || `${API_BASE}/users_profile/${user.profilePicture}`}
                            alt=""
                        />
                        <div className="edit-profile-photo-text">
                            <span className="username">{user.username}</span>
                            <label className="edit-profile-photo-btn">
                                Fotoğrafı değiştir
                                <input type="file" accept="image/*" onChange={handlePhoto} hidden />
                            </label>
                        </div>
                    </div>

                    <label className="edit-profile-label">
                        Biyografi
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={150} />
                        <span className="edit-profile-counter">{bio.length} / 150</span>
                    </label>

                    <button type="submit" className="edit-profile-submit" disabled={saving}>
                        {saving ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                </form>
            </div>
        </div>
    );
}

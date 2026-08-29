import { useState } from "react";
import { API_BASE, api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import EditCaptionModal from "./EditCaptionModal";
import "./PostMenu.css";

// Gönderi başlığındaki "..." simgesi; kendi gönderinde düzenle/sil,
// başkasının gönderisinde ilgilenmiyorum/engelle menüsü açılır.
export default function PostMenu({ post, className, onDeleted, onEdited, onHidden }) {
    const { feed, refresh } = useAuth();
    const socket = useSocket();
    const [open, setOpen] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const isOwn = post.username === feed?.userName;

    function handleDelete() {
        setOpen(false);
        if (socket) socket.emit("deletePost", { sessionUserName: feed.userName, imgId: post._id });
        onDeleted?.();
    }

    async function handleHide() {
        setOpen(false);
        try {
            await api.post(`/posts/${post._id}/hide`);
        } catch {
            // Sessizce yut; gorsel olarak zaten kaldirilir.
        }
        onHidden?.();
    }

    async function handleBlock() {
        setOpen(false);
        if (!window.confirm(`${post.username} adlı kullanıcıyı engellemek istediğine emin misin?`)) return;
        try {
            await api.post(`/users/${post.username}/block`);
            onHidden?.();
            refresh();
        } catch {
            // Bir sey yapilamiyorsa sessizce gec.
        }
    }

    return (
        <div className="post-menu">
            <button className="post-menu-trigger" onClick={() => setOpen((v) => !v)}>
                <img className={className} src={`${API_BASE}/Icons/dots.png`} alt="" />
            </button>

            {open && (
                <>
                    <div className="post-menu-backdrop" onClick={() => setOpen(false)} />
                    <div className="post-menu-dropdown">
                        {isOwn ? (
                            <>
                                <button onClick={() => { setOpen(false); setShowEdit(true); }}>Düzenle</button>
                                <button onClick={handleDelete}>Sil</button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleHide}>İlgilenmiyorum</button>
                                <button onClick={handleBlock}>Bu kullanıcıyı engelle</button>
                            </>
                        )}
                    </div>
                </>
            )}

            {showEdit && (
                <EditCaptionModal
                    post={post}
                    onClose={() => setShowEdit(false)}
                    onSaved={(description) => onEdited?.(description)}
                />
            )}
        </div>
    );
}

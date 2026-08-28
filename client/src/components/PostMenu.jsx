import { useState } from "react";
import { API_BASE } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import "./PostMenu.css";

// Gönderi başlığındaki "..." simgesi; sadece kendi gönderinde "Sil" seçeneği açılır.
export default function PostMenu({ post, className, onDeleted }) {
    const { feed } = useAuth();
    const socket = useSocket();
    const [open, setOpen] = useState(false);
    const isOwn = post.username === feed?.userName;

    if (!isOwn) {
        return <img className={className} src={`${API_BASE}/Icons/dots.png`} alt="" />;
    }

    function handleDelete() {
        setOpen(false);
        if (socket) socket.emit("deletePost", { sessionUserName: feed.userName, imgId: post._id });
        onDeleted?.();
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
                        <button onClick={handleDelete}>Sil</button>
                    </div>
                </>
            )}
        </div>
    );
}

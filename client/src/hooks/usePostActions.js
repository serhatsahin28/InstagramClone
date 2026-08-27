import { useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

// Beğeni ve kaydetme durumunu tek yerde yönetir; gönderi kartı ve
// gönderi modalı aynı davranışı paylaşsın diye ayrıldı.
export default function usePostActions(post, initialLiked = false, initialSaved = false) {
    const { feed } = useAuth();
    const socket = useSocket();
    const [liked, setLiked] = useState(!!initialLiked);
    const [saved, setSaved] = useState(!!initialSaved);

    function toggleLike() {
        if (!socket || !post) return;
        const payload = { sessionUserName: feed.userName, imgId: post._id };

        socket.emit(liked ? "unlike" : "like", payload);
        setLiked(!liked);
    }

    async function toggleSave() {
        if (!post) return;
        const next = !saved;
        setSaved(next);

        try {
            if (next) {
                await api.post(`/posts/${post._id}/save`);
            } else {
                await api.delete(`/posts/${post._id}/save`);
            }
        } catch {
            setSaved(!next);
        }
    }

    return { liked, toggleLike, saved, toggleSave };
}

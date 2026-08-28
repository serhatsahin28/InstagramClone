import usePostActions from "../hooks/usePostActions";
import CommentModal from "./CommentModal";

// Izgaradan (profil, kaydedilenler, beğenilenler, yorumlar) açılan gönderi.
export default function PostModal({ post, onClose, onDeleted, onEdited, likedByMe, savedByMe }) {
    const { liked, toggleLike, saved, toggleSave } = usePostActions(post, likedByMe, savedByMe);

    if (!post) return null;

    return (
        <CommentModal
            post={post}
            onClose={onClose}
            onDeleted={onDeleted}
            onEdited={onEdited}
            liked={liked}
            onToggleLike={toggleLike}
            saved={saved}
            onToggleSave={toggleSave}
        />
    );
}

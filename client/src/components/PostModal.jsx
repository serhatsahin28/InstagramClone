import PostCard from "./PostCard";
import "./PostModal.css";

// Izgaradan (profil, kaydedilenler, beğenilenler, arama, paylaşılan gönderi)
// açılan gönderi; ana akışta göründüğü gibi tek gönderi kartı gösterilir,
// yorumlar otomatik açılmaz.
export default function PostModal({ post, onClose, onDeleted, onEdited, onHidden, likedByMe, savedByMe }) {
    if (!post) return null;

    return (
        <div className="post-modal-overlay" onClick={onClose}>
            <div className="post-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="post-modal-close" onClick={onClose}>✕</button>
                <PostCard
                    post={post}
                    likedByMe={likedByMe}
                    savedByMe={savedByMe}
                    eager
                    onDeleted={() => { onDeleted?.(); onClose(); }}
                    onEdited={onEdited}
                    onHidden={() => { onHidden?.(); onClose(); }}
                />
            </div>
        </div>
    );
}

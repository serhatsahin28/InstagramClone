import { useEffect, useState } from "react";
import { api, thumbImage } from "../api/client";
import PostModal from "./PostModal";

// Bir sohbet balonunda paylaşılmış gönderinin küçük önizlemesi; tıklanınca
// tam ekran açılır.
export default function SharedPostPreview({ postId }) {
    const [post, setPost] = useState(null);
    const [open, setOpen] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let active = true;
        api.get(`/posts/${postId}`)
            .then((res) => active && setPost(res.post))
            .catch(() => active && setFailed(true));
        return () => { active = false; };
    }, [postId]);

    if (failed) return <span className="shared-post-missing">Gönderi kaldırılmış</span>;
    if (!post) return null;

    return (
        <>
            <button className="shared-post-preview" onClick={() => setOpen(true)}>
                <img src={thumbImage(post.photos?.[0]?.photo1)} alt="" loading="lazy" decoding="async" />
                <span>Gönderiyi gör</span>
            </button>

            {open && <PostModal post={post} onClose={() => setOpen(false)} />}
        </>
    );
}

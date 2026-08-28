import { useState } from "react";
import { postImage } from "../api/client";
import "./PostCarousel.css";

export default function PostCarousel({ photos, eager = false }) {
    const [index, setIndex] = useState(0);
    const validPhotos = photos.filter(Boolean);

    if (validPhotos.length === 0) return null;

    function prev() {
        setIndex((i) => (i === 0 ? validPhotos.length - 1 : i - 1));
    }

    function next() {
        setIndex((i) => (i === validPhotos.length - 1 ? 0 : i + 1));
    }

    return (
        <div className="post-carousel">
            <img
                className="post-carousel-image"
                src={postImage(validPhotos[index])}
                alt=""
                // Ekranda gorunmeyen gonderiler indirilmez; ilk gonderi
                // hemen yuklenir ki sayfa acilir acilmaz dolu gorunsun.
                loading={eager ? "eager" : "lazy"}
                fetchpriority={eager ? "high" : "auto"}
                decoding="async"
            />

            {validPhotos.length > 1 && (
                <>
                    <button className="post-carousel-btn prev" onClick={prev} aria-label="Önceki">‹</button>
                    <button className="post-carousel-btn next" onClick={next} aria-label="Sonraki">›</button>
                    <div className="post-carousel-dots">
                        {validPhotos.map((_, i) => (
                            <span key={i} className={i === index ? "dot active" : "dot"} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

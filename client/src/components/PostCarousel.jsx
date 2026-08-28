import { useState } from "react";
import { postImage } from "../api/client";
import "./PostCarousel.css";

export default function PostCarousel({ photos, eager = false }) {
    const [index, setIndex] = useState(0);
    const validPhotos = photos.filter(Boolean);

    if (validPhotos.length === 0) return null;

    function prev() {
        setIndex((i) => Math.max(0, i - 1));
    }

    function next() {
        setIndex((i) => Math.min(validPhotos.length - 1, i + 1));
    }

    return (
        <div className="post-carousel">
            {/*
                loading niteligi src'den ONCE gelmeli: React nitelikleri JSX
                sirasiyla atiyor, src once atanirsa tarayici indirmeye baslayip
                lazy'yi kacir. Ilk gonderi eager yuklenir ki sayfa dolu acilsin.
            */}
            <img
                className="post-carousel-image"
                loading={eager ? "eager" : "lazy"}
                decoding="async"
                fetchpriority={eager ? "high" : "auto"}
                src={postImage(validPhotos[index])}
                alt=""
            />

            {validPhotos.length > 1 && (
                <>
                    {/* İlk resimde önceki, son resimde sonraki butonu gösterilmez. */}
                    {index > 0 && (
                        <button className="post-carousel-btn prev" onClick={prev} aria-label="Önceki">‹</button>
                    )}
                    {index < validPhotos.length - 1 && (
                        <button className="post-carousel-btn next" onClick={next} aria-label="Sonraki">›</button>
                    )}
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

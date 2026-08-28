import { API_BASE } from "../api/client";

// Kaydedilmemisken orijinal ince cizgili ikon (bookmark.png) gosterilir.
// Kaydedildiginde gercekten dolu gorunmesi icin (PNG'nin kendisi sadece
// ince beyaz cizgilerden olustugu icin maskeleme gorsel bir fark yaratmiyordu)
// ayni seklin dolu bir SVG versiyonu ciziliyor.
export default function SaveIcon({ saved, size = 26 }) {
    if (!saved) {
        return <img src={`${API_BASE}/Icons/bookmark.png`} alt="kaydet" width={size} height={size} />;
    }

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="#fff"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="kaydedildi"
        >
            <path d="M6 2c-.552 0-1 .448-1 1v18l7-5 7 5V3c0-.552-.448-1-1-1H6z" />
        </svg>
    );
}

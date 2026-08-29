// Instagram'daki güncel "gönder" (direct message) ikonuna benzer, tek renkli
// vektör ikon. PNG yerine kullanılır ki tema rengine (currentColor) otomatik
// uysun ve aydınlık/karanlık tema icin ayrı ikon tersine cevirme kurali gerekmesin.
export default function DmIcon({ size = 24 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21.5 2.5L2.5 10l7 2.7m12-10.2L11.7 20l-2.2-7.3m12-10.2L9.5 12.7" />
        </svg>
    );
}

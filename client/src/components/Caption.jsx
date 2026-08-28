import { Link } from "react-router-dom";

// Bir metindeki #hashtag'leri /explore/tags/:tag adresine giden tiklanabilir
// linklere cevirir; geri kalan metin oldugu gibi kalir.
const HASHTAG_RE = /#([\p{L}0-9_]+)/gu;

export default function Caption({ text }) {
    if (!text) return null;

    const parts = [];
    let lastIndex = 0;
    let match;

    HASHTAG_RE.lastIndex = 0;
    while ((match = HASHTAG_RE.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        const tag = match[1];
        parts.push(
            <Link key={match.index} to={`/explore/tags/${tag.toLowerCase()}`} className="hashtag-link" onClick={(e) => e.stopPropagation()}>
                #{tag}
            </Link>
        );
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return <>{parts}</>;
}

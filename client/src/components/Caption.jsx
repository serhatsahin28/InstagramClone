import { Link } from "react-router-dom";

// Bir metindeki #hashtag'leri /explore/tags/:tag adresine, @kullaniciadi
// etiketlerini de /kullaniciadi profiline giden tiklanabilir linklere
// cevirir; geri kalan metin oldugu gibi kalir.
const TOKEN_RE = /(#[\p{L}0-9_]+)|(@[a-zA-Z0-9_.]+)/gu;

export default function Caption({ text }) {
    if (!text) return null;

    const parts = [];
    let lastIndex = 0;
    let match;

    TOKEN_RE.lastIndex = 0;
    while ((match = TOKEN_RE.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        if (match[1]) {
            const tag = match[1].slice(1);
            parts.push(
                <Link key={match.index} to={`/explore/tags/${tag.toLowerCase()}`} className="hashtag-link" onClick={(e) => e.stopPropagation()}>
                    #{tag}
                </Link>
            );
        } else {
            const username = match[2].slice(1);
            parts.push(
                <Link key={match.index} to={`/${username}`} className="mention-link" onClick={(e) => e.stopPropagation()}>
                    @{username}
                </Link>
            );
        }

        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return <>{parts}</>;
}

import { useEffect, useRef, useState } from "react";
import "./EmojiPickerButton.css";

const EMOJIS = [
    "😀", "😁", "😂", "🤣", "😊", "😍", "😘", "😜", "🤔", "😎",
    "😢", "😭", "😡", "😱", "🥳", "😴", "🤗", "🙄", "😇", "🤩",
    "👍", "👎", "👏", "🙌", "🙏", "💪", "🤝", "👋", "✌️", "🤙",
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "💔", "💯", "🔥",
    "🎉", "✨", "⭐", "🌟", "💫", "😅", "😆", "🥰", "😉", "🤤"
];

// Harici kütüphane olmadan hafif bir emoji seçici; input'a emoji eklemek için kullanılır.
export default function EmojiPickerButton({ onSelect }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        function onOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", onOutside);
        return () => document.removeEventListener("mousedown", onOutside);
    }, [open]);

    return (
        <div className="emoji-picker-wrap" ref={ref}>
            <button
                type="button"
                className="emoji-picker-btn"
                onClick={() => setOpen((v) => !v)}
                title="Emoji ekle"
            >
                🙂
            </button>

            {open && (
                <div className="emoji-picker-panel">
                    {EMOJIS.map((e) => (
                        <button
                            type="button"
                            key={e}
                            className="emoji-picker-item"
                            onClick={() => onSelect(e)}
                        >
                            {e}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api, profileImage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useMessages } from "../context/MessagesContext";
import SharedPostPreview from "./SharedPostPreview";
import DmIcon from "./DmIcon";
import EmojiPickerButton from "./EmojiPickerButton";
import "./MessageDock.css";

export default function MessageDock() {
    const { feed } = useAuth();
    const socket = useSocket();
    const location = useLocation();
    const { threads, totalUnread, refresh, markThreadReadLocally } = useMessages();

    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(null);
    const [messages, setMessages] = useState([]);

    const [text, setText] = useState("");

    const listRef = useRef(null);

    // Sohbet listesi artık MessagesProvider tarafından uygulama açılışında
    // önceden çekiliyor; burada tekrar istek atmaya gerek yok, dock anında açılır.

    // Bir sohbet seçilince o konuşmanın mesajlarını getir; bu istek aynı
    // zamanda sunucuda okunmamışları okunmuş işaretler.
    useEffect(() => {
        if (!active) return;

        api.get(`/messages/${active.otherUserId}`)
            .then((res) => {
                setMessages(res.messagesInfo || []);
                markThreadReadLocally(active.otherUsername);
            })
            .catch(() => setMessages([]));
    }, [active, markThreadReadLocally]);

    useEffect(() => {
        if (!socket || !active) return;

        function onIncoming(formData) {
            const other = active.otherUsername;
            const mine = feed.userName;
            const isThisThread =
                (formData.sessionUserName === mine && formData.username === other) ||
                (formData.sessionUserName === other && formData.username === mine);
            if (!isThisThread) return;

            setMessages((prev) => [...prev, {
                senderUser: formData.sessionUserName,
                message: formData.message,
                sharedPostId: formData.sharedPostId
            }]);
        }

        socket.on("submitForm2", onIncoming);
        return () => socket.off("submitForm2", onIncoming);
    }, [socket, active, feed]);

    // Her zaman en alta konumlan (bkz. Messages.jsx'teki ayni not).
    useEffect(() => {
        const el = listRef.current;
        if (!el || messages.length === 0) return;

        el.scrollTop = el.scrollHeight;
    }, [messages]);

    function handleSend(e) {
        e.preventDefault();
        if (!text.trim() || !socket || !active) return;

        socket.emit("submitForm", {
            username: active.otherUsername,
            sessionUserName: feed.userName,
            message: text,
            profilePicture: feed.sessionProfilePicture
        });
        setText("");
    }

    function handleOpen() {
        const next = !open;
        setOpen(next);
        if (next) refresh();
    }

    // Mesajlar sayfasındayken dock gereksiz.
    if (location.pathname.startsWith("/direct")) return null;

    return (
        <div className={open ? "message-dock open" : "message-dock"}>
            <div
                className="message-dock-bar"
                role="button"
                tabIndex={0}
                onClick={handleOpen}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleOpen(); }}
            >
                {active ? (
                    <Link
                        to={`/${active.otherUsername}`}
                        className="message-dock-active-identity"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img loading="lazy" decoding="async" src={profileImage(active.otherUserImage)} alt="" />
                        <span>{active.otherUsername}</span>
                    </Link>
                ) : (
                    <>
                        <span className="message-dock-icon-wrap">
                            <DmIcon size={24} />
                            {totalUnread > 0 && (
                                <span className="message-dock-badge">{totalUnread > 99 ? "99+" : totalUnread}</span>
                            )}
                        </span>
                        <span>Mesajlar</span>
                    </>
                )}
                <span className="message-dock-chevron">{open ? "▾" : "▴"}</span>
            </div>

            {open && (
                <div className="message-dock-body">
                    {!active ? (
                        <div className="message-dock-list">
                            {threads.length === 0 ? (
                                <p className="message-dock-hint">Henüz mesajın yok.</p>
                            ) : (
                                threads.map((t) => (
                                    <div
                                        key={t._id}
                                        className="message-dock-thread"
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setActive(t)}
                                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActive(t); }}
                                    >
                                        <Link to={`/${t.otherUsername}`} onClick={(e) => e.stopPropagation()}>
                                            <img loading="lazy" decoding="async" src={profileImage(t.otherUserImage)} alt="" />
                                        </Link>
                                        <div className="message-dock-thread-text">
                                            <Link
                                                to={`/${t.otherUsername}`}
                                                className="username"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {t.otherUsername}
                                            </Link>
                                            <span className="last">{t.lastFromMe ? "Sen: " : ""}{t.lastMessage}</span>
                                        </div>
                                        {t.unreadCount > 0 && (
                                            <span className="message-dock-badge">{t.unreadCount > 99 ? "99+" : t.unreadCount}</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <>
                            <button className="message-dock-back" onClick={() => setActive(null)}>
                                ‹ Tüm sohbetler
                            </button>

                            <div className="message-dock-messages" ref={listRef}>
                                {messages.map((m, i) => (
                                    <div
                                        key={m._id || i}
                                        className={m.senderUser === feed.userName ? "dock-bubble mine" : "dock-bubble"}
                                    >
                                        {m.sharedPostId ? <SharedPostPreview postId={m.sharedPostId} /> : m.message}
                                    </div>
                                ))}
                            </div>

                            <form className="message-dock-form" onSubmit={handleSend}>
                                <EmojiPickerButton onSelect={(emoji) => setText((t) => t + emoji)} />
                                <input
                                    type="text"
                                    placeholder="Bir şey yaz..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                />
                                <button type="submit">Gönder</button>
                            </form>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

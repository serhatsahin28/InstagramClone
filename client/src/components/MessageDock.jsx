import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { API_BASE, api, profileImage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useMessages } from "../context/MessagesContext";
import SharedPostPreview from "./SharedPostPreview";
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
    const didInitialScroll = useRef(false);

    // Sohbet listesi artık MessagesProvider tarafından uygulama açılışında
    // önceden çekiliyor; burada tekrar istek atmaya gerek yok, dock anında açılır.

    // Bir sohbet seçilince o konuşmanın mesajlarını getir; bu istek aynı
    // zamanda sunucuda okunmamışları okunmuş işaretler.
    useEffect(() => {
        if (!active) return;
        didInitialScroll.current = false;

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

    useEffect(() => {
        const el = listRef.current;
        if (!el || messages.length === 0) return;

        if (!didInitialScroll.current) {
            el.scrollTop = el.scrollHeight;
            didInitialScroll.current = true;
        } else {
            el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
        }
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
            <button className="message-dock-bar" onClick={handleOpen}>
                {active ? (
                    <>
                        <img loading="lazy" decoding="async" src={profileImage(active.otherUserImage)} alt="" />
                        <span>{active.otherUsername}</span>
                    </>
                ) : (
                    <>
                        <span className="message-dock-icon-wrap">
                            <img loading="lazy" decoding="async" src={`${API_BASE}/Icons/icon_chat.png`} alt="" />
                            {totalUnread > 0 && (
                                <span className="message-dock-badge">{totalUnread > 99 ? "99+" : totalUnread}</span>
                            )}
                        </span>
                        <span>Mesajlar</span>
                    </>
                )}
                <span className="message-dock-chevron">{open ? "▾" : "▴"}</span>
            </button>

            {open && (
                <div className="message-dock-body">
                    {!active ? (
                        <div className="message-dock-list">
                            {threads.length === 0 ? (
                                <p className="message-dock-hint">Henüz mesajın yok.</p>
                            ) : (
                                threads.map((t) => (
                                    <button key={t._id} className="message-dock-thread" onClick={() => setActive(t)}>
                                        <img loading="lazy" decoding="async" src={profileImage(t.otherUserImage)} alt="" />
                                        <div className="message-dock-thread-text">
                                            <span className="username">{t.otherUsername}</span>
                                            <span className="last">{t.lastFromMe ? "Sen: " : ""}{t.lastMessage}</span>
                                        </div>
                                        {t.unreadCount > 0 && (
                                            <span className="message-dock-badge">{t.unreadCount > 99 ? "99+" : t.unreadCount}</span>
                                        )}
                                    </button>
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

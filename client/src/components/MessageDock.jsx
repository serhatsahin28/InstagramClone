import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { API_BASE, api, profileImage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import "./MessageDock.css";

export default function MessageDock() {
    const { feed } = useAuth();
    const socket = useSocket();
    const location = useLocation();

    const [open, setOpen] = useState(false);
    const [threads, setThreads] = useState([]);
    const [active, setActive] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    const listRef = useRef(null);
    const didInitialScroll = useRef(false);

    const loadInbox = useCallback(() => {
        api.get("/messages/inbox")
            .then((res) => setThreads(res.newDirectInbox || []))
            .catch(() => setThreads([]));
    }, []);

    useEffect(() => {
        if (open) loadInbox();
    }, [open, loadInbox]);

    // Bir sohbet seçilince o konuşmanın mesajlarını getir.
    useEffect(() => {
        if (!active) return;
        didInitialScroll.current = false;

        api.get(`/messages/${active.otherUserId}`)
            .then((res) => setMessages(res.messagesInfo || []))
            .catch(() => setMessages([]));
    }, [active]);

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
                message: formData.message
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

    // Mesajlar sayfasındayken dock gereksiz.
    if (location.pathname.startsWith("/direct")) return null;

    return (
        <div className={open ? "message-dock open" : "message-dock"}>
            <button className="message-dock-bar" onClick={() => setOpen(!open)}>
                {active ? (
                    <>
                        <img src={profileImage(active.otherUserImage)} alt="" loading="lazy" decoding="async" />
                        <span>{active.otherUsername}</span>
                    </>
                ) : (
                    <>
                        <img src={`${API_BASE}/Icons/chat.png`} alt="" loading="lazy" decoding="async" />
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
                                        <img src={profileImage(t.otherUserImage)} alt="" loading="lazy" decoding="async" />
                                        <div className="message-dock-thread-text">
                                            <span className="username">{t.otherUsername}</span>
                                            <span className="last">{t.lastFromMe ? "Sen: " : ""}{t.lastMessage}</span>
                                        </div>
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
                                        {m.message}
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

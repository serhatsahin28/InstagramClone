import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API_BASE, api, profileImage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useMessages } from "../context/MessagesContext";
import Sidebar from "../components/Sidebar";
import NewMessageModal from "../components/NewMessageModal";
import SharedPostPreview from "../components/SharedPostPreview";
import EmojiPickerButton from "../components/EmojiPickerButton";
import "./Messages.css";

export default function Messages() {
    const { id } = useParams();
    const { feed } = useAuth();
    const socket = useSocket();
    const navigate = useNavigate();
    const { refresh: refreshUnread, markThreadReadLocally } = useMessages();

    const [data, setData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [tab, setTab] = useState("messages");
    const [showNewMessage, setShowNewMessage] = useState(false);

    const listRef = useRef(null);

    const load = useCallback(() => {
        const path = id ? `/messages/${id}` : "/messages/inbox";
        return api.get(path).then((res) => {
            setData(res);
            setMessages(res.messagesInfo || []);
            // Bir sohbet açıldıysa sunucuda okunmuş işaretlendi; rozetleri eşitle.
            if (res.otherUser) markThreadReadLocally(res.otherUser.otherUsername);
            else refreshUnread();
        });
    }, [id, markThreadReadLocally, refreshUnread]);

    useEffect(() => {
        load();
    }, [load]);

    // Mobilde klavye acildiginda "100dvh" her tarayicida gercek gorunur
    // yuksekligi kucultmuyor; sabit konumlu sohbet ekrani klavyenin
    // arkasinda kalip son mesaj/gonder butonu yarim gorunebiliyordu.
    // visualViewport klavye dahil gercek yuksekligi verir.
    useEffect(() => {
        if (!window.visualViewport) return;

        function updateHeight() {
            document.documentElement.style.setProperty("--dm-vh", `${window.visualViewport.height}px`);
        }

        updateHeight();
        window.visualViewport.addEventListener("resize", updateHeight);
        window.visualViewport.addEventListener("scroll", updateHeight);
        return () => {
            window.visualViewport.removeEventListener("resize", updateHeight);
            window.visualViewport.removeEventListener("scroll", updateHeight);
            document.documentElement.style.removeProperty("--dm-vh");
        };
    }, []);

    useEffect(() => {
        if (!socket || !data?.otherUser) return;
        function onIncoming(formData) {
            const otherUsername = data.otherUser.otherUsername;
            const isThisThread =
                (formData.sessionUserName === feed.userName && formData.username === otherUsername) ||
                (formData.sessionUserName === otherUsername && formData.username === feed.userName);
            if (!isThisThread) return;

            setMessages((prev) => [...prev, {
                senderUser: formData.sessionUserName,
                message: formData.message,
                sharedPostId: formData.sharedPostId
            }]);
        }
        socket.on("submitForm2", onIncoming);
        return () => socket.off("submitForm2", onIncoming);
    }, [socket, data, feed]);

    // Her zaman en alta (en son mesaja) konumlan; requestAnimationFrame'e
    // bagli "smooth" kaydirma, sekme arka plandayken veya art arda hizli
    // mesaj gelince tamamlanmayabiliyordu, bu yuzden dogrudan atlanir.
    useEffect(() => {
        const el = listRef.current;
        if (!el || messages.length === 0) return;

        el.scrollTop = el.scrollHeight;
    }, [messages]);

    function handleSend(e) {
        e.preventDefault();
        if (!text.trim() || !socket || !data?.otherUser) return;

        socket.emit("submitForm", {
            username: data.otherUser.otherUsername,
            sessionUserName: feed.userName,
            message: text,
            profilePicture: feed.sessionProfilePicture
        });
        setText("");
    }

    async function handleAcceptRequest(username) {
        await api.post(`/messages/requests/${username}/accept`);
        await load();
        setTab("messages");
    }

    async function handleDeleteRequest(username, otherUserId) {
        await api.delete(`/messages/requests/${username}`);
        if (id === otherUserId) {
            navigate("/direct/inbox");
        } else {
            await load();
        }
    }

    if (!data) return null;

    const threads = tab === "messages" ? data.newDirectInbox : data.requests;

    return (
        <div className="home-layout">
            <Sidebar />
            <main className={data.otherUser ? "messages-page chat-open" : "messages-page"}>
                <aside className="messages-inbox">
                    <div className="messages-inbox-header">
                        <h3>{feed?.userName}</h3>
                        <button className="messages-new-btn" onClick={() => setShowNewMessage(true)} title="Yeni mesaj">
                            <img loading="lazy" decoding="async"
                src={`${API_BASE}/Icons/createChat.png`} alt="Yeni mesaj" />
                        </button>
                    </div>

                    <div className="messages-inbox-tabs">
                        <button
                            className={tab === "messages" ? "active" : undefined}
                            onClick={() => setTab("messages")}
                        >
                            Mesajlar
                        </button>
                        <button
                            className={tab === "requests" ? "active" : undefined}
                            onClick={() => setTab("requests")}
                        >
                            İstekler{data.requests?.length > 0 && ` (${data.requests.length})`}
                        </button>
                    </div>

                    {threads?.length === 0 && (
                        <p className="messages-inbox-empty">
                            {tab === "messages" ? "Henüz mesajın yok." : "Mesaj isteğin yok."}
                        </p>
                    )}

                    {threads?.map((item) => (
                        <div key={item._id} className="messages-inbox-entry">
                            <div
                                className={id === item.otherUserId ? "messages-inbox-item active" : "messages-inbox-item"}
                                onClick={() => navigate(`/direct/${item.otherUserId}`)}
                            >
                                <Link
                                    to={`/${item.otherUsername}`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <img loading="lazy" decoding="async"
                src={profileImage(item.otherUserImage)} alt="" />
                                </Link>
                                <div className="messages-inbox-item-text">
                                    <Link
                                        to={`/${item.otherUsername}`}
                                        className={item.unreadCount > 0 ? "username unread" : "username"}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {item.otherUsername}
                                    </Link>
                                    <span className={item.unreadCount > 0 ? "last-message unread" : "last-message"}>
                                        {item.lastFromMe ? "Sen: " : ""}{item.lastMessage}
                                    </span>
                                </div>
                                {item.unreadCount > 0 && <span className="messages-inbox-unread-dot" />}
                            </div>

                            {tab === "requests" && (
                                <div className="messages-request-actions">
                                    <button className="accept" onClick={() => handleAcceptRequest(item.otherUsername)}>
                                        Kabul et
                                    </button>
                                    <button className="reject" onClick={() => handleDeleteRequest(item.otherUsername, item.otherUserId)}>
                                        Sil
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </aside>

                {data.otherUser ? (
                    <section className="messages-thread">
                        <header className="messages-thread-header">
                            <button
                                type="button"
                                className="messages-thread-back"
                                onClick={() => navigate("/direct/inbox")}
                                aria-label="Sohbet listesine dön"
                            >
                                ‹
                            </button>
                            <Link to={`/${data.otherUser.otherUsername}`} className="messages-thread-identity">
                                <img className="messages-thread-avatar" loading="lazy" decoding="async"
                src={profileImage(data.otherUser.otherUserImage)} alt="" />
                                <span>{data.otherUser.otherUsername}</span>
                            </Link>
                            <div className="messages-thread-header-icons">
                                <img loading="lazy" decoding="async"
                src={`${API_BASE}/Icons/phoneCall.png`} alt="" />
                                <img loading="lazy" decoding="async"
                src={`${API_BASE}/Icons/camRecorder.png`} alt="" />
                                <img loading="lazy" decoding="async"
                src={`${API_BASE}/Icons/info.png`} alt="" />
                            </div>
                        </header>

                        <div className="messages-list" ref={listRef}>
                            {messages.map((m, i) => (
                                <div
                                    key={m._id || i}
                                    className={m.senderUser === feed.userName ? "message-bubble mine" : "message-bubble"}
                                >
                                    {m.sharedPostId ? <SharedPostPreview postId={m.sharedPostId} /> : m.message}
                                </div>
                            ))}
                        </div>

                        <form className="messages-input-row" onSubmit={handleSend}>
                            <EmojiPickerButton onSelect={(emoji) => setText((t) => t + emoji)} />
                            <input
                                type="text"
                                placeholder="Bir şey yaz..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                            <button type="submit">Gönder</button>
                        </form>
                    </section>
                ) : (
                    <section className="messages-thread messages-empty">
                        <p>Bir sohbet seç</p>
                    </section>
                )}
            </main>

            {showNewMessage && <NewMessageModal onClose={() => setShowNewMessage(false)} />}
        </div>
    );
}

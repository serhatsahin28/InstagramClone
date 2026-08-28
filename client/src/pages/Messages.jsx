import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API_BASE, api, profileImage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Sidebar from "../components/Sidebar";
import NewMessageModal from "../components/NewMessageModal";
import "./Messages.css";

export default function Messages() {
    const { id } = useParams();
    const { feed } = useAuth();
    const socket = useSocket();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [tab, setTab] = useState("messages");
    const [showNewMessage, setShowNewMessage] = useState(false);

    const listRef = useRef(null);
    const didInitialScroll = useRef(false);

    const load = useCallback(() => {
        const path = id ? `/messages/${id}` : "/messages/inbox";
        return api.get(path).then((res) => {
            setData(res);
            setMessages(res.messagesInfo || []);
        });
    }, [id]);

    useEffect(() => {
        didInitialScroll.current = false;
        load();
    }, [load]);

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
                message: formData.message
            }]);
        }
        socket.on("submitForm2", onIncoming);
        return () => socket.off("submitForm2", onIncoming);
    }, [socket, data, feed]);

    // Sohbet ilk açıldığında animasyonsuz doğrudan en alta konumlan;
    // sonraki yeni mesajlarda yumuşak kaydır.
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
            <main className="messages-page">
                <aside className="messages-inbox">
                    <div className="messages-inbox-header">
                        <h3>{feed?.userName}</h3>
                        <button className="messages-new-btn" onClick={() => setShowNewMessage(true)} title="Yeni mesaj">
                            <img src={`${API_BASE}/Icons/createChat.png`} alt="Yeni mesaj" />
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
                            <Link
                                to={`/direct/${item.otherUserId}`}
                                className={id === item.otherUserId ? "messages-inbox-item active" : "messages-inbox-item"}
                            >
                                <img src={profileImage(item.otherUserImage)} alt="" />
                                <div className="messages-inbox-item-text">
                                    <span className="username">{item.otherUsername}</span>
                                    <span className="last-message">
                                        {item.lastFromMe ? "Sen: " : ""}{item.lastMessage}
                                    </span>
                                </div>
                            </Link>

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
                            <img className="messages-thread-avatar" src={profileImage(data.otherUser.otherUserImage)} alt="" />
                            <span>{data.otherUser.otherUsername}</span>
                            <div className="messages-thread-header-icons">
                                <img src={`${API_BASE}/Icons/phoneCall.png`} alt="" />
                                <img src={`${API_BASE}/Icons/camRecorder.png`} alt="" />
                                <img src={`${API_BASE}/Icons/info.png`} alt="" />
                            </div>
                        </header>

                        <div className="messages-list" ref={listRef}>
                            {messages.map((m, i) => (
                                <div
                                    key={m._id || i}
                                    className={m.senderUser === feed.userName ? "message-bubble mine" : "message-bubble"}
                                >
                                    {m.message}
                                </div>
                            ))}
                        </div>

                        <form className="messages-input-row" onSubmit={handleSend}>
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

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, profileImage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import SlidePanel from "./SlidePanel";
import "./NotificationsPanel.css";

function describe(item) {
    switch (item.type) {
        case "follower":
            return "seni takip etmeye başladı";
        case "like":
            return "gönderini beğendi";
        case "comment":
            return `gönderine yorum yaptı: ${item.comment}`;
        default:
            return "";
    }
}

export default function NotificationsPanel({ open, onClose }) {
    const { feed, refresh } = useAuth();
    const socket = useSocket();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [requestsOpen, setRequestsOpen] = useState(false);

    const load = useCallback(() => {
        setLoading(true);
        api.get("/notifications")
            .then((res) => setItems(res.items || []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (open) {
            load();
        } else {
            setRequestsOpen(false);
        }
    }, [open, load]);

    function handleAccept(username) {
        if (!socket) return;
        socket.emit("acceptFollow", { userName: feed.userName, profileName: username });
        setTimeout(() => { load(); refresh(); }, 300);
    }

    function handleReject(username) {
        if (!socket) return;
        socket.emit("deleteFollow", { userName: feed.userName, profileName: username });
        setTimeout(() => { load(); refresh(); }, 300);
    }

    const requests = items.filter((i) => i.type === "follow_request");
    const others = items.filter((i) => i.type !== "follow_request");

    function renderRequestRow(item) {
        return (
            <div key={item.id} className="slide-panel-row notification-row">
                <img src={profileImage(item.profilePicture)} alt="" loading="lazy" decoding="async" />
                <div className="slide-panel-row-text">
                    <span className="notification-text">
                        <Link to={`/${item.username}`} onClick={onClose} className="notification-user">
                            {item.username}
                        </Link>{" "}
                        sana takip isteği gönderdi
                    </span>
                </div>
                <div className="notification-actions">
                    <button className="accept" onClick={() => handleAccept(item.username)}>Onayla</button>
                    <button className="reject" onClick={() => handleReject(item.username)}>Sil</button>
                </div>
            </div>
        );
    }

    return (
        <SlidePanel open={open} title="Bildirimler" onClose={onClose} replaceNav>
            <div className="slide-panel-list">
                {loading ? (
                    <p className="slide-panel-hint">Yükleniyor...</p>
                ) : items.length === 0 ? (
                    <p className="slide-panel-hint">Henüz bildirimin yok.</p>
                ) : (
                    <>
                        {requests.length === 1 && renderRequestRow(requests[0])}

                        {requests.length > 1 && (
                            <div className="notification-requests-group">
                                <button
                                    className="slide-panel-row requests-summary"
                                    onClick={() => setRequestsOpen(!requestsOpen)}
                                >
                                    <div className="requests-avatars">
                                        {requests.slice(0, 3).map((r, i) => (
                                            <img
                                                key={r.id}
                                                src={profileImage(r.profilePicture)}
                                                alt=""
                                                style={{ zIndex: 3 - i, marginLeft: i === 0 ? 0 : "-16px" }} loading="lazy" decoding="async" />
                                        ))}
                                    </div>

                                    <div className="slide-panel-row-text">
                                        <span className="username">Takip istekleri</span>
                                        <span className="muted">{requests.length} kişi seni takip etmek istiyor</span>
                                    </div>

                                    <span className={requestsOpen ? "requests-chevron open" : "requests-chevron"}>›</span>
                                </button>

                                {requestsOpen && (
                                    <div className="requests-expanded">
                                        {requests.map(renderRequestRow)}
                                    </div>
                                )}
                            </div>
                        )}

                        {requests.length > 0 && others.length > 0 && (
                            <div className="notification-divider" />
                        )}

                        {others.map((item) => (
                            <div key={item.id} className="slide-panel-row notification-row">
                                <img src={profileImage(item.profilePicture)} alt="" loading="lazy" decoding="async" />
                                <div className="slide-panel-row-text">
                                    <span className="notification-text">
                                        <Link to={`/${item.username}`} onClick={onClose} className="notification-user">
                                            {item.username}
                                        </Link>{" "}
                                        {describe(item)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </SlidePanel>
    );
}

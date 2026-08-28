import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { profileImage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import SearchPanel from "./SearchPanel";
import NotificationsPanel from "./NotificationsPanel";
import NotificationToasts from "./NotificationToasts";
import MessageDock from "./MessageDock";
import UploadModal from "./UploadModal";
import "./Sidebar.css";

export default function Sidebar() {
    const { feed, logout } = useAuth();
    const socket = useSocket();
    const navigate = useNavigate();
    const [showUpload, setShowUpload] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const [panel, setPanel] = useState(null); // "search" | "notifications" | null

    // Panel kapalıyken gelen bildirimler ikon üzerinde rozet olarak birikir.
    const [unseen, setUnseen] = useState({ follow: 0, like: 0, comment: 0 });

    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    function togglePanel(name) {
        setPanel((current) => (current === name ? null : name));
    }

    function closePanel() {
        setPanel(null);
    }

    const linkClass = ({ isActive }) => (isActive ? "active" : undefined);

    // Bildirimler paneli sol navigasyonun yerini alır; nav içeriği gizlenir.
    const navHidden = panel === "notifications";

    useEffect(() => {
        if (!socket) return;

        function onNotify(payload) {
            const group =
                payload.type === "like" ? "like" :
                payload.type === "comment" ? "comment" : "follow";

            setUnseen((prev) => ({ ...prev, [group]: prev[group] + 1 }));
        }

        socket.on("notify", onNotify);
        return () => socket.off("notify", onNotify);
    }, [socket]);

    // Bildirimler açıldığında rozetler sıfırlanır.
    useEffect(() => {
        if (navHidden) setUnseen({ follow: 0, like: 0, comment: 0 });
    }, [navHidden]);

    const unseenTotal = unseen.follow + unseen.like + unseen.comment;

    return (
        <nav className={navHidden ? "sidebar nav-hidden" : "sidebar"}>
            <Link to="/" className="sidebar-brand-link" onClick={closePanel}>
                <img className="sidebar-brand" src={`${API_BASE}/black_Instagram_title.png`} alt="Instagram" />
            </Link>

            <ul className="sidebar-links">
                <li>
                    <NavLink to="/" end className={linkClass} onClick={closePanel}>
                        <img className="icon" src={`${API_BASE}/Icons/home.png`} alt="" />
                        <span>Anasayfa</span>
                    </NavLink>
                </li>
                <li>
                    <button
                        className={panel === "search" ? "sidebar-btn active" : "sidebar-btn"}
                        onClick={() => togglePanel("search")}
                    >
                        <img className="icon" src={`${API_BASE}/Icons/search.png`} alt="" />
                        <span>Ara</span>
                    </button>
                </li>
                <li>
                    <NavLink to="/explore" className={linkClass} onClick={closePanel}>
                        <img className="icon" src={`${API_BASE}/Icons/discovery.png`} alt="" />
                        <span>Keşfet</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/reels" className={linkClass} onClick={closePanel}>
                        <img className="icon" src={`${API_BASE}/Icons/reels.png`} alt="" />
                        <span>Reels</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/direct/inbox" className={linkClass} onClick={closePanel}>
                        <img className="icon" src={`${API_BASE}/Icons/chat.png`} alt="" />
                        <span>Mesajlar</span>
                    </NavLink>
                </li>
                <li>
                    <button
                        className={panel === "notifications" ? "sidebar-btn active" : "sidebar-btn"}
                        onClick={() => togglePanel("notifications")}
                    >
                        <span className="icon-wrap">
                            <img className="icon" src={`${API_BASE}/Icons/heart.png`} alt="" />
                            {unseenTotal > 0 && (
                                <span className="nav-badge">{unseenTotal > 9 ? "9+" : unseenTotal}</span>
                            )}
                        </span>
                        <span>Bildirimler</span>

                        {unseenTotal > 0 && (
                            <span className="nav-symbols">
                                {unseen.follow > 0 && <span title="Takip">👤</span>}
                                {unseen.like > 0 && <span title="Beğeni">❤️</span>}
                                {unseen.comment > 0 && <span title="Yorum">💬</span>}
                            </span>
                        )}
                    </button>
                </li>
                <li>
                    <button className="sidebar-btn" onClick={() => { closePanel(); setShowUpload(true); }}>
                        <img className="icon" src={`${API_BASE}/Icons/instagramPost.png`} alt="" />
                        <span>Oluştur</span>
                    </button>
                </li>
                <li>
                    <NavLink to={`/${feed?.userName || ""}`} className={linkClass} onClick={closePanel}>
                        <img className="icon profile-icon" src={profileImage(feed?.sessionProfilePicture)} alt="" />
                        <span>Profil</span>
                    </NavLink>
                </li>
                <li className="sidebar-more">
                    <button className="sidebar-btn" onClick={() => setShowMore(!showMore)}>
                        <img className="icon" src={`${API_BASE}/Icons/menu.png`} alt="" />
                        <span>Daha fazla</span>
                    </button>
                    {showMore && (
                        <div className="sidebar-more-popover">
                            <NavLink to="/accounts/edit" onClick={() => setShowMore(false)}>Ayarlar</NavLink>
                            <button onClick={handleLogout}>Çıkış Yap</button>
                        </div>
                    )}
                </li>
            </ul>

            {panel === "search" && <div className="sidebar-backdrop" onClick={closePanel} />}
            <SearchPanel open={panel === "search"} onClose={closePanel} />
            <NotificationsPanel open={navHidden} onClose={closePanel} />

            {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}

            <NotificationToasts suppressed={navHidden} />
            <MessageDock />
        </nav>
    );
}

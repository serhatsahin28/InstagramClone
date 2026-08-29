import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { profileImage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import SlidePanel from "./SlidePanel";
import "./SearchPanel.css";

export default function SearchPanel({ open, onClose }) {
    const { feed } = useAuth();
    const socket = useSocket();
    const [term, setTerm] = useState("");
    const [results, setResults] = useState([]);
    const inputRef = useRef(null);

    useEffect(() => {
        if (!socket) return;
        function onResults(users) {
            setResults(users);
        }
        socket.on("searchUser2", onResults);
        return () => socket.off("searchUser2", onResults);
    }, [socket]);

    useEffect(() => {
        if (open) {
            inputRef.current?.focus();
        } else {
            setTerm("");
            setResults([]);
        }
    }, [open]);

    function handleChange(e) {
        const value = e.target.value;
        setTerm(value);
        if (!socket) return;
        if (!value.trim()) {
            setResults([]);
            return;
        }
        socket.emit("searchUser", { formUser: value, sessionUserName: feed.userName });
    }

    return (
        <SlidePanel open={open} title="Ara" onClose={onClose}>
            <div className="search-panel-input-wrap">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ara"
                    value={term}
                    onChange={handleChange}
                />
                {term && (
                    <button className="search-panel-clear" onClick={() => { setTerm(""); setResults([]); }}>
                        ✕
                    </button>
                )}
            </div>

            <div className="slide-panel-list">
                {term.trim() === "" ? (
                    <p className="slide-panel-hint">Aramak istediğin kişinin adını yaz.</p>
                ) : results.length === 0 ? (
                    <p className="slide-panel-hint">Sonuç bulunamadı.</p>
                ) : (
                    results.map((user) => (
                        <Link
                            key={user._id}
                            to={`/${user.username}`}
                            className="slide-panel-row"
                            onClick={onClose}
                        >
                            <img loading="lazy" decoding="async"
                src={profileImage(user.profilePicture)} alt="" />
                            <div className="slide-panel-row-text">
                                <span className="username">{user.username}</span>
                                <span className="muted">{user.profileName}</span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </SlidePanel>
    );
}

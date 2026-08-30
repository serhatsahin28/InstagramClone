import { useEffect, useState } from "react";
import { api } from "../api/client";
import Sidebar from "../components/Sidebar";
import ReelCard from "../components/ReelCard";
import ReelUploadModal from "../components/ReelUploadModal";
import Spinner from "../components/Spinner";
import "./Reels.css";

export default function Reels() {
    const [reels, setReels] = useState(null);
    const [showUpload, setShowUpload] = useState(false);

    function load() {
        api.get("/reels").then((res) => setReels(res.reels || [])).catch(() => setReels([]));
    }

    useEffect(load, []);

    return (
        <div className="home-layout">
            <Sidebar />
            <main className="reels-page">
                <button className="reels-upload-btn" onClick={() => setShowUpload(true)}>
                    + Reel Ekle
                </button>

                {reels === null ? <Spinner /> : reels.length === 0 ? (
                    <p className="reels-empty">Henüz reel yok. İlk paylaşan sen ol!</p>
                ) : (
                    <div className="reels-feed">
                        {reels.map((r) => (
                            <ReelCard key={r._id} reel={r} onDeleted={load} />
                        ))}
                    </div>
                )}
            </main>

            {showUpload && <ReelUploadModal onClose={() => setShowUpload(false)} onUploaded={load} />}
        </div>
    );
}

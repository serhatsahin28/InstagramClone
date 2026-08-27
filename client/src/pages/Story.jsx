import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, API_BASE } from "../api/client";
import { useAuth } from "../context/AuthContext";
import "./Story.css";

export default function Story() {
    const { username, id } = useParams();
    const navigate = useNavigate();
    const { feed } = useAuth();
    const [data, setData] = useState(null);

    const load = useCallback(() => {
        api.get(`/stories/${username}/${id}`).then(setData);
    }, [username, id]);

    useEffect(() => {
        load();
    }, [load]);

    async function handleDelete() {
        if (!data) return;
        await api.delete(`/stories/${data.storySelected[0]._id}`, { storyId: data.storySelected[0]._id });
        navigate("/");
    }

    if (!data) return null;

    const story = data.storySelected[0];
    const isOwn = story.username === feed?.userName;

    return (
        <div className="story-page">
            <div className="story-viewer">
                <button className="story-close" onClick={() => navigate("/")}>✕</button>

                <header className="story-viewer-header">
                    <img src={`${API_BASE}/users_profile/${story.profilePicture}`} alt="" />
                    <span>{story.username}</span>
                </header>

                <img className="story-viewer-image" src={`${API_BASE}/users_profile/${story.storie}`} alt="" />

                {data.prevResult && (
                    <Link className="story-nav prev" to={`/stories/${data.prevResult.username}/${data.prevResult._id}`}>‹</Link>
                )}
                {data.nextResult && (
                    <Link className="story-nav next" to={`/stories/${data.nextResult.username}/${data.nextResult._id}`}>›</Link>
                )}

                {isOwn && (
                    <button className="story-delete" onClick={handleDelete}>Hikayeyi Sil</button>
                )}
            </div>
        </div>
    );
}

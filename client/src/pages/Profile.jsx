import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { api, API_BASE } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Sidebar from "../components/Sidebar";
import EditProfileModal from "../components/EditProfileModal";
import UserListModal from "../components/UserListModal";
import PostModal from "../components/PostModal";
import "./Profile.css";

export default function Profile() {
    const { username } = useParams();
    const { feed: sessionFeed, refresh } = useAuth();
    const socket = useSocket();
    const [data, setData] = useState(null);
    // "none" | "pending" (gizli hesaba gönderilmiş istek) | "following"
    const [relation, setRelation] = useState("none");
    const [showEdit, setShowEdit] = useState(false);
    const [userList, setUserList] = useState(null); // "followers" | "following"
    const [openPost, setOpenPost] = useState(null);

    const load = useCallback(() => {
        return api.get(`/users/${username}`).then((res) => {
            setData(res);
            if (!res.followData) {
                setRelation("none");
            } else {
                setRelation(res.followData.Isfollowed ? "following" : "pending");
            }
        });
    }, [username]);

    useEffect(() => {
        // Başka bir profile geçerken eski veriyi temizle; aynı profilde
        // yapılan tazelemeler (load çağrısı) ekranı boşaltmaz.
        setData(null);
        load();
    }, [load]);

    useEffect(() => {
        if (!socket) return;

        // Kendi tıklamamızın sonucu zaten yerel state'e yansıdı; sadece sessizce tazele.
        const onUnfollow = () => load();

        socket.on("unFollow", onUnfollow);
        return () => socket.off("unFollow", onUnfollow);
    }, [socket, load]);

    function handleFollow() {
        if (!socket || !data) return;
        const target = data.result[0];

        const payload = {
            userSessionName: sessionFeed.userName,
            userSessionProfile: sessionFeed.userName,
            sessionProfileName: sessionFeed.result?.[0]?.profileName,
            userSessionPicture: sessionFeed.sessionProfilePicture,
            username: target.username,
            _id: target._id,
            profileName: target.profileName,
            profilePicture: target.profilePicture
        };

        if (target.isPrivate) {
            socket.emit("sentFollow", payload);
            setRelation("pending");
        } else {
            socket.emit("messageFromClient", payload);
            setRelation("following");
        }
    }

    // Takipten çıkma ve bekleyen isteği geri çekme aynı kaydı siler.
    function handleUnfollow() {
        if (!socket || !data) return;
        const target = data.result[0];
        socket.emit("unfollow", {
            userSessionName: sessionFeed.userName,
            profileName: target.username
        });
        setRelation("none");
    }

    // Sadece ilk yüklemede boş ekran; sonraki tazelemelerde içerik korunur.
    if (!data) return null;

    const target = data.result[0];
    const isOwn = data.view === "profile";
    const isPrivateLocked = data.view === "privateOtherProfile";

    const likedPostIds = new Set((sessionFeed?.userLikePostUser || []).map((l) => String(l.post_id)));
    const savedPostIds = new Set(sessionFeed?.savedPostIds || []);

    return (
        <div className="home-layout">
            <Sidebar />
            <main className="profile-page">
                <header className="profile-header">
                    <img className="profile-avatar" src={`${API_BASE}/users_profile/${target.profilePicture}`} alt="" />
                    <div className="profile-info">
                        <div className="profile-title-row">
                            <h2>{target.username}</h2>
                            {isOwn && (
                                <button className="profile-edit-btn" onClick={() => setShowEdit(true)}>
                                    Profili Düzenle
                                </button>
                            )}

                            {!isOwn && relation === "following" && (
                                <button className="profile-follow-btn following" onClick={handleUnfollow}>Takiptesin</button>
                            )}
                            {!isOwn && relation === "pending" && (
                                <button className="profile-follow-btn following" onClick={handleUnfollow}>İstek Gönderildi</button>
                            )}
                            {!isOwn && relation === "none" && (
                                <button className="profile-follow-btn" onClick={handleFollow}>
                                    {target.isPrivate ? "Takip İsteği Gönder" : "Takip Et"}
                                </button>
                            )}
                        </div>
                        <div className="profile-stats">
                            <span><strong>{data.findProfilePosts}</strong> gönderi</span>
                            <button className="profile-stat-btn" onClick={() => setUserList("followers")}>
                                <strong>{data.followedProfile}</strong> takipçi
                            </button>
                            <button className="profile-stat-btn" onClick={() => setUserList("following")}>
                                <strong>{data.followersProfile}</strong> takip
                            </button>
                        </div>
                        <p className="profile-name">{target.profileName}</p>
                        {target.description && <p className="profile-bio">{target.description}</p>}
                    </div>
                </header>

                {isPrivateLocked ? (
                    <p className="profile-private-note">Bu hesap gizli. Gönderileri görmek için takip etmelisin.</p>
                ) : data.posts?.length ? (
                    <div className="profile-grid">
                        {data.posts.map((post) => (
                            <button
                                key={post._id}
                                className="profile-grid-item"
                                onClick={() => setOpenPost(post)}
                            >
                                <img src={`${API_BASE}/posts/${post.photos[0].photo1}`} alt="" />
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="profile-empty-note">Henüz gönderi yok.</p>
                )}
            </main>

            {showEdit && (
                <EditProfileModal
                    user={target}
                    onClose={() => setShowEdit(false)}
                    onSaved={async () => { await load(); await refresh(); }}
                />
            )}

            {userList && (
                <UserListModal username={target.username} kind={userList} onClose={() => setUserList(null)} />
            )}

            {openPost && (
                <PostModal
                    post={openPost}
                    onClose={() => setOpenPost(null)}
                    likedByMe={likedPostIds.has(String(openPost._id))}
                    savedByMe={savedPostIds.has(String(openPost._id))}
                />
            )}
        </div>
    );
}

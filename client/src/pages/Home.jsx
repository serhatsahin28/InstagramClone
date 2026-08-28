import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import StoryBar from "../components/StoryBar";
import PostCard from "../components/PostCard";
import "./Home.css";

export default function Home() {
    const { feed } = useAuth();

    if (!feed) return null;

    const likedPostIds = new Set((feed.userLikePostUser || []).map((like) => String(like.post_id)));
    const savedPostIds = new Set(feed.savedPostIds || []);

    return (
        <div className="home-layout">
            <Sidebar />
            <main className="home-feed">
                <StoryBar
                    stories={feed.stories}
                    sessionUserStories={feed.sessionUserStories}
                    sessionUserName={feed.userName}
                    sessionProfilePicture={feed.sessionProfilePicture}
                />

                <div className="post-list">
                    {feed.post?.length ? (
                        feed.post.map((post, i) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                likedByMe={likedPostIds.has(String(post._id))}
                                savedByMe={savedPostIds.has(String(post._id))}
                                eager={i === 0}
                            />
                        ))
                    ) : (
                        <p className="empty-feed">Henüz gönderi yok.</p>
                    )}
                </div>
            </main>
        </div>
    );
}

const savedPost = require("../Model/table/savedPost");
const likePost = require("../Model/table/likePost");
const commentPost = require("../Model/table/commentPost");
const Post = require("../Model/table/postUser");

async function postsByIds(ids) {
    if (ids.length === 0) return [];
    return Post.find({ _id: { $in: ids } });
}

class libraryController {

    async saved(req, res) {
        try {
            const me = req.session.user.username;
            const docs = await savedPost.find({ username: me }).sort({ _id: -1 });
            const posts = await postsByIds(docs.map((d) => d.post_id));

            res.json({ posts });
        } catch (err) {
            console.log("libraryController saved: " + err);
            res.status(500).json({ error: "Kaydedilenler alınamadı" });
        }
    }

    async liked(req, res) {
        try {
            const me = req.session.user.username;
            const docs = await likePost.find({ "userWhoLike.username": me }).sort({ _id: -1 });
            const posts = await postsByIds(docs.map((d) => d.post_id));

            res.json({ posts });
        } catch (err) {
            console.log("libraryController liked: " + err);
            res.status(500).json({ error: "Beğenilenler alınamadı" });
        }
    }

    async comments(req, res) {
        try {
            const me = req.session.user.username;
            const docs = await commentPost.find({ "userWhoComment.username": me }).sort({ _id: -1 });

            const items = [];
            for (const doc of docs) {
                for (const c of doc.userWhoComment) {
                    if (c.username !== me) continue;
                    items.push({
                        id: String(doc._id),
                        post_id: doc.post_id,
                        postOwnerUsername: doc.postOwnerUsername,
                        comment: c.userComment
                    });
                }
            }

            const posts = await postsByIds(items.map((i) => i.post_id));
            const byId = new Map(posts.map((p) => [String(p._id), p]));

            res.json({
                items: items.map((i) => ({ ...i, post: byId.get(String(i.post_id)) || null }))
            });
        } catch (err) {
            console.log("libraryController comments: " + err);
            res.status(500).json({ error: "Yorumlar alınamadı" });
        }
    }

    async toggleSave(req, res, postId, save) {
        try {
            const me = req.session.user.username;

            if (save) {
                const existing = await savedPost.findOne({ username: me, post_id: postId });
                if (!existing) await savedPost.create({ username: me, post_id: postId });
            } else {
                await savedPost.deleteOne({ username: me, post_id: postId });
            }

            res.json({ saved: !!save });
        } catch (err) {
            console.log("libraryController toggleSave: " + err);
            res.status(500).json({ error: "Kaydetme işlemi başarısız" });
        }
    }
}

module.exports = libraryController;

const highlight = require("../Model/table/highlight");
const story = require("../Model/table/storyTable");

class highlightController {
    // Bir profildeki tum one cikanlari listeler.
    async list(req, res, username) {
        try {
            const items = await highlight.find({ username }).sort({ createdAt: 1 });
            res.json({ highlights: items });
        } catch (err) {
            console.log("highlightController list: " + err);
            res.status(500).json({ error: "Öne çıkanlar alınamadı" });
        }
    }

    // Bir hikayeyi mevcut (basligi eslesen) ya da yeni bir one cikana ekler.
    // Sadece kendi hikayeni ekleyebilirsin.
    async addStory(req, res, sessionUserName, title, storyId) {
        if (typeof title !== "string" || title.trim() === "" || !storyId) {
            return res.status(400).json({ error: "Başlık ve hikaye gerekli" });
        }

        try {
            const target = await story.findById(storyId);
            if (!target || target.username !== sessionUserName) {
                return res.status(403).json({ error: "Bu hikayeyi ekleyemezsin" });
            }

            const doc = await highlight.findOneAndUpdate(
                { username: sessionUserName, title: title.trim() },
                { $addToSet: { stories: target.storie } },
                { upsert: true, new: true }
            );

            res.json({ highlight: doc });
        } catch (err) {
            console.log("highlightController addStory: " + err);
            res.status(500).json({ error: "Öne çıkana eklenemedi" });
        }
    }

    async remove(req, res, sessionUserName, highlightId) {
        try {
            const target = await highlight.findById(highlightId);
            if (!target || target.username !== sessionUserName) {
                return res.status(403).json({ error: "Bu öne çıkanı silemezsin" });
            }

            await highlight.deleteOne({ _id: highlightId });
            res.json({ message: "Öne çıkan silindi" });
        } catch (err) {
            console.log("highlightController remove: " + err);
            res.status(500).json({ error: "Silinemedi" });
        }
    }
}

module.exports = highlightController;

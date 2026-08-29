const blockedUser = require("./table/blockedUser");
const follow = require("./table/follow");
const User = require("./table/dbUsers");

class blockModel {

    // Engelleme karsilikli takibi de kaldirir (gercek Instagram davranisina benzer).
    static async blockUser(blockerUsername, blockedUsername) {
        const target = await User.findOne({ username: blockedUsername });
        if (!target) return { ok: false, error: "Kullanıcı bulunamadı" };
        if (blockerUsername === blockedUsername) return { ok: false, error: "Kendini engelleyemezsin" };

        await blockedUser.updateOne(
            { blockerUsername, blockedUsername },
            { $setOnInsert: { blockerUsername, blockedUsername, blockedUserId: String(target._id) } },
            { upsert: true }
        );

        await Promise.all([
            follow.updateOne({ userName: blockerUsername }, { $pull: { followed: { username: blockedUsername } } }),
            follow.updateOne({ userName: blockedUsername }, { $pull: { followed: { username: blockerUsername } } })
        ]);

        return { ok: true };
    }

    static async unblockUser(blockerUsername, blockedUsername) {
        await blockedUser.deleteOne({ blockerUsername, blockedUsername });
        return { ok: true };
    }

    // Ben mi engelledim?
    static async didIBlock(blockerUsername, otherUsername) {
        const doc = await blockedUser.findOne({ blockerUsername, blockedUsername: otherUsername });
        return !!doc;
    }

    // Iki taraftan biri digerini engellemis mi (profil/mesaj erisimini kapatmak icin)?
    static async isBlockedEitherWay(userA, userB) {
        const doc = await blockedUser.findOne({
            $or: [
                { blockerUsername: userA, blockedUsername: userB },
                { blockerUsername: userB, blockedUsername: userA }
            ]
        });
        return !!doc;
    }

    // Akistan (anasayfa/kesfet) filtrelemek icin: karsilikli engellenen tum kullanici adlari.
    static async blockedEitherWayUsernames(userName) {
        const docs = await blockedUser.find({
            $or: [{ blockerUsername: userName }, { blockedUsername: userName }]
        });
        return docs.map((d) => (d.blockerUsername === userName ? d.blockedUsername : d.blockerUsername));
    }

}

module.exports = blockModel;

const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

function makeStorage(destination) {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, destination);
        },
        filename: function (req, file, cb) {
            const uniqueName = crypto.randomUUID() + path.extname(file.originalname);
            cb(null, uniqueName);
        }
    });
}

const uploadPost = multer({ storage: makeStorage("images/posts") });
const uploadProfile = multer({ storage: makeStorage("images/users_profile") });

module.exports = { uploadPost, uploadProfile };

const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary bilgileri tanimliysa gorseller buluta yuklenir. Tanimli degilse
// (yerel gelistirme) eskisi gibi images/ klasorune yazilir.
const useCloudinary = Boolean(
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET)
);

if (useCloudinary) {
    // CLOUDINARY_URL verilmisse kutuphane onu kendisi okur.
    if (!process.env.CLOUDINARY_URL) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
    }
    console.log("Gorseller Cloudinary'ye yuklenecek");
} else {
    console.log("Cloudinary ayarli degil; gorseller yerel diske yazilacak");
}

function makeDiskStorage(destination) {
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

function makeCloudStorage(folder) {
    return new CloudinaryStorage({
        cloudinary,
        params: {
            folder: `instagram-clone/${folder}`,
            resource_type: "image",
            public_id: () => crypto.randomUUID()
        }
    });
}

function makeStorage(diskDestination, cloudFolder) {
    return useCloudinary ? makeCloudStorage(cloudFolder) : makeDiskStorage(diskDestination);
}

const uploadPost = multer({ storage: makeStorage("images/posts", "posts") });
const uploadProfile = multer({ storage: makeStorage("images/users_profile", "users_profile") });

// Cloudinary'de file.path tam URL, diskte ise sadece dosya adi doner.
// Veritabanina her iki durumda da dogru deger yazilsin diye tek yerden okunur.
function storedFileName(file) {
    if (!file) return "";
    return useCloudinary ? file.path : file.filename;
}

module.exports = { uploadPost, uploadProfile, storedFileName, useCloudinary };

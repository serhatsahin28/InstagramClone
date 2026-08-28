const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

// Panele yapistirilirken deger sik sik "CLOUDINARY_URL=..." veya tirnakli
// gelebiliyor. Cloudinary kutuphanesi bozuk degeri gorunce require anininda
// exception atip tum servisi dusurdugu icin once temizliyoruz.
function normalizeCloudinaryUrl(raw) {
    if (!raw) return "";

    return raw
        .trim()
        .replace(/^CLOUDINARY_URL\s*=\s*/i, "")
        .replace(/^["']|["']$/g, "")
        .trim();
}

const cloudinaryUrl = normalizeCloudinaryUrl(process.env.CLOUDINARY_URL);
const hasValidUrl = cloudinaryUrl.startsWith("cloudinary://");

if (process.env.CLOUDINARY_URL && !hasValidUrl) {
    console.warn(
        "CLOUDINARY_URL gecersiz ('cloudinary://' ile baslamali). " +
        "Gorseller yerel diske yazilacak."
    );
}

// Temizlenmis degeri geri yaziyoruz; kutuphane require aninda burayi okuyor.
if (hasValidUrl) {
    process.env.CLOUDINARY_URL = cloudinaryUrl;
} else {
    delete process.env.CLOUDINARY_URL;
}

const hasKeyPair = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

const useCloudinary = hasValidUrl || hasKeyPair;

let cloudinary = null;
let CloudinaryStorage = null;

if (useCloudinary) {
    ({ v2: cloudinary } = require("cloudinary"));
    ({ CloudinaryStorage } = require("multer-storage-cloudinary"));

    // CLOUDINARY_URL verilmisse kutuphane onu kendisi okur.
    if (!hasValidUrl) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
    }
    console.log(`Gorseller Cloudinary'ye yuklenecek (klasor: ${process.env.CLOUDINARY_FOLDER || "instagram-clone"})`);
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

// Ayni Cloudinary hesabinda baska projeler olabilir; yuklemeler kendi
// klasorunde tutulur. CLOUDINARY_FOLDER ile bu ad degistirilebilir.
const CLOUD_FOLDER = (process.env.CLOUDINARY_FOLDER || "instagram-clone").replace(/^\/+|\/+$/g, "");

function makeCloudStorage(folder, resourceType) {
    return new CloudinaryStorage({
        cloudinary,
        params: {
            folder: `${CLOUD_FOLDER}/${folder}`,
            resource_type: resourceType,
            public_id: () => crypto.randomUUID()
        }
    });
}

function makeStorage(diskDestination, cloudFolder, resourceType = "image") {
    return useCloudinary ? makeCloudStorage(cloudFolder, resourceType) : makeDiskStorage(diskDestination);
}

const uploadPost = multer({ storage: makeStorage("images/posts", "posts") });
const uploadProfile = multer({ storage: makeStorage("images/users_profile", "users_profile") });

// Reels: video dosyasi kabul eder. Cloudinary'de resource_type "video"
// olarak yuklenir; yerel diskte diger yuklemelerle ayni sekilde saklanir.
const uploadReel = multer({
    storage: makeStorage("images/reels", "reels", "video"),
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("video/")) {
            return cb(new Error("Sadece video dosyası yüklenebilir"));
        }
        cb(null, true);
    }
});

// Cloudinary'de file.path tam URL, diskte ise sadece dosya adi doner.
// Veritabanina her iki durumda da dogru deger yazilsin diye tek yerden okunur.
function storedFileName(file) {
    if (!file) return "";
    return useCloudinary ? file.path : file.filename;
}

module.exports = { uploadPost, uploadProfile, uploadReel, storedFileName, useCloudinary };

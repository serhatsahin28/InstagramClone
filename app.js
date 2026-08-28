const express = require("express");
const app = express();
const http = require("http");
const PORT = process.env.PORT || 3000;
const session = require("express-session");
// connect-mongo v6 ESM uyumlu paketlendiği için CommonJS'te .default gerekir.
const MongoStore = require("connect-mongo").default;
const cors = require("cors");
const socketio = require("socket.io");
const server = http.createServer(app);

require("dotenv").config();
require("./Model/db");

const isProduction = process.env.NODE_ENV === "production";

// Tarayıcı Origin başlığını sondaki "/" olmadan gönderir. Panele yanlışlıkla
// "/" ile yazılan adres CORS'u sessizce bozduğu için burada normalize ediyoruz.
// Virgülle ayırarak birden fazla adres de verilebilir.
const CLIENT_ORIGIN = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);

// Render gibi ters vekil arkasında güvenli çerez üretebilmek için gerekli.
if (isProduction) app.set("trust proxy", 1);

const corsOptions = {
    origin: CLIENT_ORIGIN,
    credentials: true
};

const io = socketio(server, { cors: corsOptions });

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("images"));
app.use(express.static("scss"));

app.use(session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,

    // Oturumlar MongoDB'de tutulur; sunucu yeniden başlayınca kaybolmaz.
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: "sessions"
    }),

    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,

        // Frontend (Vercel) ile backend (Render) farklı alan adlarında olduğu
        // için çerezin siteler arası gönderilmesi gerekir.
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction
    }
}));

require("./socket")(io);

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/stories", require("./routes/stories"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/follow", require("./routes/follow"));

app.get("/health", (req, res) => res.json({ ok: true }));

// Burasi yalnizca API sunucusu; arayuz ayri bir adreste yayinlanir.
app.get("/", (req, res) => {
    res.json({
        service: "Instagram Clone API",
        status: "calisiyor",
        note: "Arayuz icin frontend adresini kullanin."
    });
});

server.listen(PORT, () => {
    console.log("port dinleniyor: " + PORT);
});

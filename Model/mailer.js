const nodemailer = require("nodemailer");

// SMTP bilgileri ortam degiskenlerinden gelir (SMTP_HOST, SMTP_PORT, SMTP_USER,
// SMTP_PASS, EMAIL_FROM). Tanimli degilse (yerel gelistirme gibi) kod postaya
// gonderilmek yerine konsola yazilir; boylece e-posta hesabi olmadan da
// akis test edilebilir.
const isConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;
if (isConfigured) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
} else {
    console.log("SMTP ayarlanmadi; sifre sifirlama kodlari sadece konsola yazilacak.");
}

async function sendResetCodeEmail(toEmail, code) {
    if (!isConfigured) {
        console.log(`[E-POSTA GONDERILMEDI - SMTP YOK] ${toEmail} icin sifirlama kodu: ${code}`);
        return;
    }

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: toEmail,
        subject: "Şifre sıfırlama kodun",
        text: `Şifreni sıfırlamak için kodun: ${code}\n\nBu kod 15 dakika içinde geçerliliğini yitirir. Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin.`,
        html: `<p>Şifreni sıfırlamak için kodun:</p><h2 style="letter-spacing:4px">${code}</h2><p>Bu kod 15 dakika içinde geçerliliğini yitirir. Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin.</p>`
    });
}

module.exports = { sendResetCodeEmail, isConfigured };

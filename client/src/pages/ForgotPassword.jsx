import { useState } from "react";
import { Link } from "react-router-dom";
import { api, API_BASE } from "../api/client";
import "./Login.css";

// 2 adimli akis: (1) kullanici adiyla e-postaya kod isteme, (2) kod + yeni
// sifreyle sifirlama. E-posta gonderimi gercekten yapiliyor (bkz. Model/mailer.js);
// SMTP ayarlanmamissa sunucu konsoluna yazilir (yerel gelistirme icin).
export default function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [userName, setUserName] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [info, setInfo] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    async function handleRequestCode(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const res = await api.post("/auth/forgot-password", { userName });
            setInfo(res.message);
            setStep(2);
        } catch (err) {
            setError(err.data?.error || "İstek gönderilemedi");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleResetPassword(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await api.post("/auth/reset-password", { userName, code, newPassword });
            setSuccess(true);
        } catch (err) {
            setError(err.data?.error || "Şifre sıfırlanamadı");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="login-page">
            <div className="login-illustration">
                <img className="login-img login-img-1" src={`${API_BASE}/login2.png`} alt="" />
                <img className="login-img login-img-2" src={`${API_BASE}/login.png`} alt="" />
            </div>

            <div className="login-card-wrapper">
                <div className="login-card">
                    <img className="login-title" src={`${API_BASE}/Instagram_title.png`} alt="Instagram" />

                    {success ? (
                        <p style={{ textAlign: "center", margin: "1rem 0" }}>
                            Şifren güncellendi. Şimdi giriş yapabilirsin.
                        </p>
                    ) : step === 1 ? (
                        <form className="login-form" onSubmit={handleRequestCode}>
                            <p style={{ textAlign: "center", color: "#8e8e8e", fontSize: "0.85rem", margin: 0 }}>
                                Kullanıcı adını gir, kayıtlı e-postana bir kod gönderelim.
                            </p>
                            <input
                                type="text"
                                placeholder="Kullanıcı adı"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                            />
                            {error && <p className="login-error">{error}</p>}
                            <button type="submit" disabled={submitting}>
                                {submitting ? "Gönderiliyor..." : "Kod gönder"}
                            </button>
                        </form>
                    ) : (
                        <form className="login-form" onSubmit={handleResetPassword}>
                            <p style={{ textAlign: "center", color: "#8e8e8e", fontSize: "0.85rem", margin: 0 }}>
                                {info}
                            </p>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="6 haneli kod"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Yeni şifre"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            {error && <p className="login-error">{error}</p>}
                            <button type="submit" disabled={submitting}>
                                {submitting ? "Gönderiliyor..." : "Şifreyi sıfırla"}
                            </button>
                        </form>
                    )}

                    <Link to="/login" className="login-forgot-link">Girişe dön</Link>
                </div>
            </div>
        </div>
    );
}

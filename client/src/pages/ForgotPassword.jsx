import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, API_BASE } from "../api/client";
import "./Login.css";

export default function ForgotPassword() {
    const [userName, setUserName] = useState("");
    const [securityAnswer, setSecurityAnswer] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await api.post("/auth/reset-password", { userName, securityAnswer, newPassword });
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
                        <>
                            <p style={{ textAlign: "center", margin: "1rem 0" }}>
                                Şifren güncellendi. Şimdi giriş yapabilirsin.
                            </p>
                            <Link to="/login" className="login-forgot-link">Girişe dön</Link>
                        </>
                    ) : (
                        <form className="login-form" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Kullanıcı adı"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                            />
                            <label className="register-security-label" style={{ color: "#fff" }}>
                                Güvenlik sorusu: Annenizin kızlık soyadı nedir?
                            </label>
                            <input
                                type="text"
                                placeholder="Cevabın"
                                value={securityAnswer}
                                onChange={(e) => setSecurityAnswer(e.target.value)}
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

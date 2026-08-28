import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../api/client";
import "./Login.css";

export default function Login() {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await login(userName, password);
            navigate("/");
        } catch (err) {
            setError(err.data?.error || "Giriş başarısız oldu");
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

                    <form className="login-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Kullanıcı adı"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Şifre"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && <p className="login-error">{error}</p>}
                        <button type="submit" disabled={submitting}>
                            {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
                        </button>
                    </form>

                    <Link to="/forgot-password" className="login-forgot-link">Şifreni mi unuttun?</Link>

                    <div className="login-divider">
                        <hr /><span>YA DA</span><hr />
                    </div>
                </div>

                <div className="login-register-box">
                    <p>Hesabın yok mu?</p>
                    <Link to="/register">Kaydol</Link>
                </div>
            </div>
        </div>
    );
}

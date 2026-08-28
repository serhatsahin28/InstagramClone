import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, api } from "../api/client";
import "./Register.css";

export default function Register() {
    const [form, setForm] = useState({ email: "", userName: "", profileName: "", password: "" });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await api.post("/auth/register", form);
            navigate("/login");
        } catch (err) {
            setError(err.data?.error || "Kayıt başarısız oldu");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="register-page">
            <div className="register-card">
                <img className="register-title" src={`${API_BASE}/Instagram_title.png`} alt="Instagram" />
                <p className="register-subtitle">Arkadaşlarının fotoğraf ve videolarını görmek için kaydol.</p>

                <form className="register-form" onSubmit={handleSubmit}>
                    <input type="email" name="email" placeholder="email" value={form.email} onChange={handleChange} required />
                    <input type="text" name="userName" placeholder="username" value={form.userName} onChange={handleChange} required />
                    <input type="text" name="profileName" placeholder="Ad-soyad" value={form.profileName} onChange={handleChange} required />
                    <input type="password" name="password" placeholder="password" value={form.password} onChange={handleChange} required />
                    {error && <p className="register-error">{error}</p>}
                    <button type="submit" disabled={submitting}>
                        {submitting ? "Kaydolunuyor..." : "Kaydol"}
                    </button>
                </form>
            </div>
        </div>
    );
}

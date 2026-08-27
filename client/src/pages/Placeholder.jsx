import Sidebar from "../components/Sidebar";
import "./Placeholder.css";

export default function Placeholder({ title }) {
    return (
        <div className="home-layout">
            <Sidebar />
            <main className="placeholder-page">
                <h2>{title}</h2>
                <p>Bu bölüm yakında burada olacak.</p>
            </main>
        </div>
    );
}

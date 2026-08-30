import "./Spinner.css";

// Veri gelene kadar sayfa icinde gosterilen kucuk, yeniden kullanilabilir
// yukleniyor gostergesi (bos/beyaz ekran yerine).
export default function Spinner({ label }) {
    return (
        <div className="spinner-wrap">
            <div className="spinner" />
            {label && <p className="spinner-label">{label}</p>}
        </div>
    );
}

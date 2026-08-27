import "./SlidePanel.css";

export default function SlidePanel({ open, title, children, onClose, replaceNav = false }) {
    const classes = ["slide-panel"];
    if (open) classes.push("open");
    if (replaceNav) classes.push("replace-nav");

    return (
        <aside className={classes.join(" ")}>
            <div className="slide-panel-inner">
                <header className="slide-panel-header">
                    <h2>{title}</h2>
                    {onClose && (
                        <button className="slide-panel-close" onClick={onClose} aria-label="Kapat">✕</button>
                    )}
                </header>
                {children}
            </div>
        </aside>
    );
}

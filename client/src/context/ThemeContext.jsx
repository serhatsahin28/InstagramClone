import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

function readInitialTheme() {
    try {
        return localStorage.getItem("theme") === "light" ? "light" : "dark";
    } catch {
        return "dark";
    }
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(readInitialTheme);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        try {
            localStorage.setItem("theme", theme);
        } catch {
            // localStorage kapaliysa (gizli sekme vb.) sessizce yoksay.
        }
    }, [theme]);

    function toggleTheme() {
        setTheme((t) => (t === "dark" ? "light" : "dark"));
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
}

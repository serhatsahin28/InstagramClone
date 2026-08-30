import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "./LoadingScreen";

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <LoadingScreen />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return children;
}

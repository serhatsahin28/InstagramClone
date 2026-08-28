import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { MessagesProvider } from "./context/MessagesContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Story from "./pages/Story";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Explore from "./pages/Explore";
import Placeholder from "./pages/Placeholder";

function withAuth(element) {
    return <ProtectedRoute>{element}</ProtectedRoute>;
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <SocketProvider>
                    <MessagesProvider>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/" element={withAuth(<Home />)} />
                            <Route path="/explore" element={withAuth(<Explore />)} />
                            <Route path="/reels" element={withAuth(<Placeholder title="Reels" />)} />
                            <Route path="/direct/inbox" element={withAuth(<Messages />)} />
                            <Route path="/direct/:id" element={withAuth(<Messages />)} />
                            <Route path="/stories/:username/:id" element={withAuth(<Story />)} />
                            <Route path="/accounts/edit" element={withAuth(<Settings />)} />
                            <Route path="/:username" element={withAuth(<Profile />)} />
                        </Routes>
                    </MessagesProvider>
                </SocketProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

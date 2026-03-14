import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LayoutDetailsPage from "./pages/LayoutDetailsPage";
import AuthPage from "./pages/AuthPage";
import AgentDashboard from "./pages/AgentDashboard";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./styles.css";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <div className="app-container">
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/layouts/:id" element={<LayoutDetailsPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/agent/dashboard" element={<AgentDashboard />} />
                </Routes>
              </main>
            </div>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";

function Navbar() {
  const { user, logout, isLoggedIn } = useAuth();
  const toast = useToast();
  const { isDark, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const handleLogout = () => {
    logout();
    toast.info("Signed out successfully");
    navigate("/");
    setMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/?keyword=${encodeURIComponent(searchVal.trim())}`);
    }
    setSearchOpen(false);
    setSearchVal("");
  };

  return (
    <>
      <header className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">PND</span>
            <span>PND Developers</span>
          </Link>

          <nav className="nav-links">
            <NavLink to="/" end>Browse Layouts</NavLink>
            {isLoggedIn && <NavLink to="/agent/dashboard">Admin Dashboard</NavLink>}
          </nav>

          <div className="nav-auth">
            <button
              className="icon-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Quick Search"
            >
              🔍
            </button>

            <button
              className="icon-btn theme-toggle"
              onClick={toggleTheme}
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            {isLoggedIn ? (
              <div className="user-menu-wrap">
                <button className="user-avatar-btn" onClick={() => setMenuOpen((o) => !o)}>
                  <span className="user-initials">{user?.name?.[0]?.toUpperCase()}</span>
                  <span className="user-name-short">{user?.name?.split(" ")[0]}</span>
                  <span className="chevron">▾</span>
                </button>
                {menuOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-user-info">
                      <strong>{user?.name}</strong>
                      <span>{user?.email}</span>
                      <span className="role-chip">Staff</span>
                    </div>
                    <hr className="dropdown-divider" />
                    <NavLink to="/agent/dashboard" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      📊 Dashboard
                    </NavLink>
                    <button className="dropdown-item danger" onClick={handleLogout}>
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" className="btn btn-primary btn-sm">Staff Login</Link>
            )}
          </div>
        </div>
      </header>

      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-overlay-box" onClick={(e) => e.stopPropagation()}>
            <p className="eyebrow" style={{ textAlign: "center", marginBottom: "1rem" }}>Find Layouts</p>
            <form className="search-form" onSubmit={handleSearch}>
              <input
                autoFocus
                className="search-input"
                placeholder="Search by location, layout name..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">Search →</button>
            </form>
            <button className="search-close" onClick={() => setSearchOpen(false)}>✕ Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;

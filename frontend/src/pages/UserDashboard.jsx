import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { fetchMyBookings } from "../api/client";
import { formatCurrency, formatLocation } from "../utils";

const STATUS_COLORS = {
  Pending: "status-pending",
  Confirmed: "status-confirmed",
  Completed: "status-completed",
  Cancelled: "status-cancelled",
};

function UserDashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMyBookings();
        setBookings(data);
      } catch {
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
  };

  return (
    <div className="page">
      <section className="dashboard-hero glass">
        <div className="dashboard-hero-inner">
          <div className="dashboard-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <p className="eyebrow">Your Account</p>
            <h1>{user?.name}</h1>
            <p className="text-muted">{user?.email} · {user?.phone}</p>
            <span className="role-badge">{user?.role || "Buyer"}</span>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button className="btn btn-secondary" onClick={handleLogout}>Sign Out</button>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>My Bookings</h2>
          <Link to="/" className="btn btn-primary">Browse Properties</Link>
        </div>

        {loading ? (
          <div className="skeleton-list">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton skeleton-row" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-state glass">
            <div className="empty-icon">📅</div>
            <h3>No bookings yet</h3>
            <p>Browse properties and book a site visit to get started.</p>
            <Link to="/" className="btn btn-primary">Explore Properties</Link>
          </div>
        ) : (
          <div className="booking-list">
            {bookings.map((booking) => (
              <div className="booking-card glass" key={booking._id}>
                <div className="booking-image">
                  <img
                    src={booking.property_id?.images?.[0] || "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=400"}
                    alt={booking.property_id?.title}
                  />
                </div>
                <div className="booking-info">
                  <h3>{booking.property_id?.title || "Property"}</h3>
                  <p className="text-muted">{formatLocation(booking.property_id?.location)}</p>
                  <p className="booking-price">{formatCurrency(booking.property_id?.price)}</p>
                  <div className="booking-meta">
                    <span>📅 {new Date(booking.visit_date).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                    <span>🕐 {booking.visit_time}</span>
                    <span className={`status-chip ${STATUS_COLORS[booking.status]}`}>{booking.status}</span>
                  </div>
                </div>
                <Link to={`/properties/${booking.property_id?._id}`} className="btn btn-secondary btn-sm">View</Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default UserDashboard;

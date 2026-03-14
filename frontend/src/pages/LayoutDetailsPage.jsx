import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchLayoutById, createVisit } from "../api/client";
import { useToast } from "../context/ToastContext";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1524813686514-627c24479e12?w=1200";

const PlotStatusColors = {
  Available: "var(--success)",
  Reserved: "var(--warning)",
  Sold: "var(--danger)"
};

function LayoutDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [layout, setLayout] = useState(null);
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [bookingForm, setBookingForm] = useState({ name: "", phone: "", email: "", date: "" });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchLayoutById(id);
        setLayout(data.layout);
        setPlots(data.plots);
      } catch (err) {
        toast.error("Failed to load layout details");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate, toast]);

  const handleBookVisit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      await createVisit({
        layoutId: layout._id,
        plotId: selectedPlot._id,
        customerName: bookingForm.name,
        phone: bookingForm.phone,
        email: bookingForm.email,
        visitDate: bookingForm.date
      });
      toast.success("Site visit requested successfully! Our team will contact you.");
      setSelectedPlot(null); // close modal
      setBookingForm({ name: "", phone: "", email: "", date: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to book visit");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div className="page"><div className="container" style={{ padding: "4rem" }}><div className="skeleton" style={{ height: "60vh", borderRadius: "1rem" }} /></div></div>;
  }

  return (
    <div className="page bg-blur">
      <div className="container">
        <div style={{ padding: "2rem 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{layout.name}</h1>
            <p className="text-muted" style={{ fontSize: "1.2rem" }}>📍 {layout.location} • {layout.totalPlots} Total Plots</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: "3rem", position: "relative" }}>
          <div style={{ position: "relative", width: "100%", height: "400px" }}>
            <img src={layout.layoutImage || FALLBACK_IMG} alt={layout.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            
            {/* Map Markers Overlay */}
            {plots.map(plot => (
              <div 
                key={plot._id}
                onClick={() => setSelectedPlot(plot)}
                style={{
                  position: "absolute",
                  left: `${plot.positionX}%`,
                  top: `${plot.positionY}%`,
                  width: "24px",
                  height: "24px",
                  background: PlotStatusColors[plot.status],
                  border: "2px solid white",
                  borderRadius: "50%",
                  transform: "translate(-50%, -50%)",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  zIndex: 2
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.3)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.5)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
                }}
                title={`Plot ${plot.plotNumber} (${plot.status})`}
              />
            ))}
          </div>

          <div style={{ padding: "2rem" }}>
            <h3>About the Layout</h3>
            <p className="text-muted" style={{ marginTop: "1rem", lineHeight: "1.6" }}>{layout.description || "A premium plot layout developed by PND Developers."}</p>
          </div>
        </div>

        <div style={{ marginBottom: "5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <h2>Interactive Plot Map</h2>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ width: "12px", height: "12px", borderRadius: "50%", background: PlotStatusColors.Available }}/> Available</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ width: "12px", height: "12px", borderRadius: "50%", background: PlotStatusColors.Reserved }}/> Reserved</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ width: "12px", height: "12px", borderRadius: "50%", background: PlotStatusColors.Sold }}/> Sold</span>
            </div>
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", 
            gap: "1rem",
            padding: "2rem",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)"
          }}>
            {plots.map(plot => (
              <div 
                key={plot._id}
                onClick={() => setSelectedPlot(plot)}
                style={{
                  padding: "1rem",
                  border: `2px solid ${PlotStatusColors[plot.status]}`,
                  borderRadius: "var(--radius-md)",
                  background: `color-mix(in srgb, ${PlotStatusColors[plot.status]} 15%, transparent)`,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "transform 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <h3 style={{ fontSize: "1.2rem", margin: "0.5rem 0" }}>{plot.plotNumber}</h3>
                <span className="chip" style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}>{plot.status}</span>
              </div>
            ))}
            {plots.length === 0 && <p style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--text-muted)" }}>No plots added yet.</p>}
          </div>
        </div>
      </div>

      {selectedPlot && (
        <div className="search-overlay" onClick={() => setSelectedPlot(null)}>
          <div className="search-overlay-box glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px", padding: "2rem" }}>
            <h2>Plot {selectedPlot.plotNumber}</h2>
            <div style={{ margin: "1.5rem 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", background: "rgba(0,0,0,0.2)", padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
              <div>
                <p className="text-muted" style={{ fontSize: "0.8rem" }}>Size</p>
                <p style={{ fontWeight: "700" }}>{selectedPlot.size} sq.ft</p>
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: "0.8rem" }}>Dimensions</p>
                <p style={{ fontWeight: "700" }}>{selectedPlot.dimensions}</p>
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: "0.8rem" }}>Facing</p>
                <p style={{ fontWeight: "700" }}>{selectedPlot.facing}</p>
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: "0.8rem" }}>Price</p>
                <p style={{ fontWeight: "700", color: "var(--accent)" }}>₹{selectedPlot.price.toLocaleString()}</p>
              </div>
            </div>

            {selectedPlot.status === "Available" ? (
              <form onSubmit={handleBookVisit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h4 style={{ marginBottom: "0.5rem" }}>Book a Site Visit</h4>
                <input required placeholder="Your Full Name" value={bookingForm.name} onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })} style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)" }} />
                <input required placeholder="Phone Number" value={bookingForm.phone} onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })} style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)" }} />
                <input type="email" placeholder="Email (Optional)" value={bookingForm.email} onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })} style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)" }} />
                <input required type="date" value={bookingForm.date} onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })} style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)" }} />
                
                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <button className="btn btn-primary" type="submit" disabled={bookingLoading} style={{ flex: 1, justifyContent: "center" }}>
                    {bookingLoading ? "Submitting..." : "Submit Request"}
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={() => setSelectedPlot(null)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem", background: "var(--bg-card)", borderRadius: "var(--radius-md)" }}>
                <h3 style={{ color: selectedPlot.status === "Sold" ? "var(--danger)" : "var(--warning)" }}>This plot is {selectedPlot.status.toLowerCase()}.</h3>
                <p className="text-muted" style={{ marginTop: "0.5rem" }}>No longer accepting site visits.</p>
                <button className="btn btn-secondary" style={{ marginTop: "1.5rem" }} onClick={() => setSelectedPlot(null)}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LayoutDetailsPage;

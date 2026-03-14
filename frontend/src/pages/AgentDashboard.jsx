import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  fetchLayouts, fetchPlotsByLayout, createLayout, updateLayout, deleteLayout,
  createPlot, updatePlot, deletePlot,
  fetchVisits, updateVisitStatus
} from "../api/client";

function AgentDashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState("layouts"); // 'layouts' | 'visits'
  const [layouts, setLayouts] = useState([]);
  const [visits, setVisits] = useState([]);
  
  // Layout Management State
  const [showLayoutForm, setShowLayoutForm] = useState(false);
  const [layoutForm, setLayoutForm] = useState({ name: "", location: "", totalPlots: "", layoutImage: "", description: "", _id: null });
  
  // Plot Management State
  const [selectedLayoutId, setSelectedLayoutId] = useState(null); // When not null, we are managing plots for this layout
  const [plots, setPlots] = useState([]);
  const [plotForm, setPlotForm] = useState({ plotNumber: "", size: "", dimensions: "", facing: "North", price: "", status: "Available", positionX: 0, positionY: 0, _id: null });

  // Initial Data Load
  useEffect(() => {
    loadLayouts();
    loadVisits();
  }, []);

  const loadLayouts = async () => {
    try {
      const data = await fetchLayouts();
      setLayouts(data.layouts || []);
    } catch {
      toast.error("Failed to load layouts");
    }
  };

  const loadVisits = async () => {
    try {
      const data = await fetchVisits();
      setVisits(data || []);
    } catch {
      toast.error("Failed to load visits");
    }
  };

  // --- Layout Handlers ---
  const handleSaveLayout = async (e) => {
    e.preventDefault();
    try {
      if (layoutForm._id) {
        await updateLayout(layoutForm._id, layoutForm);
        toast.success("Layout updated!");
      } else {
        await createLayout(layoutForm);
        toast.success("Layout created!");
      }
      setShowLayoutForm(false);
      setLayoutForm({ name: "", location: "", totalPlots: "", layoutImage: "", description: "", _id: null });
      loadLayouts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving layout");
    }
  };

  const handleDeleteLayout = async (id) => {
    if(!confirm("Are you sure? This deletes the layout AND all its plots.")) return;
    try {
      await deleteLayout(id);
      loadLayouts();
      toast.success("Layout deleted");
    } catch {
      toast.error("Failed to delete layout");
    }
  };

  // --- Plot Handlers ---
  const managePlots = async (layoutId) => {
    setSelectedLayoutId(layoutId);
    try {
      const plotData = await fetchPlotsByLayout(layoutId);
      setPlots(plotData || []);
    } catch {
      toast.error("Failed to load plots");
    }
  };

  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPlotForm(prev => ({ ...prev, positionX: x.toFixed(2), positionY: y.toFixed(2) }));
  };

  const handleSavePlot = async (e) => {
    e.preventDefault();
    try {
      if (plotForm._id) {
        await updatePlot(plotForm._id, plotForm);
        toast.success("Plot updated!");
      } else {
        await createPlot({ ...plotForm, layoutId: selectedLayoutId });
        toast.success("Plot created!");
      }
      setPlotForm({ plotNumber: "", size: "", dimensions: "", facing: "North", price: "", status: "Available", positionX: 0, positionY: 0, _id: null });
      managePlots(selectedLayoutId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving plot");
    }
  };

  const handleDeletePlot = async (id) => {
    if(!confirm("Delete this plot?")) return;
    try {
      await deletePlot(id);
      managePlots(selectedLayoutId);
      toast.success("Plot deleted");
    } catch {
      toast.error("Failed to delete plot");
    }
  };

  // --- Visit Handlers ---
  const handleUpdateVisit = async (id, status) => {
    try {
      await updateVisitStatus(id, status);
      toast.success(`Visit marked as ${status}`);
      loadVisits();
    } catch {
      toast.error("Failed to update visit");
    }
  };

  return (
    <div className="page bg-blur">
      <div className="container" style={{ paddingTop: "2rem" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", background: "var(--bg-card)", padding: "2rem", borderRadius: "1rem" }}>
          <div>
            <h1>Staff Dashboard</h1>
            <p className="text-muted">Welcome back, {user?.name}</p>
          </div>
          <button className="btn btn-secondary danger" onClick={logout}>Sign Out</button>
        </div>

        {/* Tabs */}
        {!selectedLayoutId && (
          <div className="dashboard-tabs" style={{ marginBottom: "2rem" }}>
            <button className={`dashboard-tab ${activeTab === 'layouts' ? 'active' : ''}`} onClick={() => setActiveTab('layouts')}>
              Layouts ({layouts.length})
            </button>
            <button className={`dashboard-tab ${activeTab === 'visits' ? 'active' : ''}`} onClick={() => setActiveTab('visits')}>
              Visit Requests ({visits.filter(v => v.status === 'Pending').length} Pending)
            </button>
          </div>
        )}

        {/* View Switcher */}
        {selectedLayoutId ? (
          // --- PLOT MANAGER VIEW ---
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
              <h2>Manage Plots for "{layouts.find(l => l._id === selectedLayoutId)?.name}"</h2>
              <button className="btn btn-secondary" onClick={() => setSelectedLayoutId(null)}>← Back to Layouts</button>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <p style={{ marginBottom: "0.5rem" }}><strong>Interactive Plot Map</strong> (Click anywhere on the image to set the plot coordinates for the form below)</p>
              <div 
                style={{ position: "relative", width: "100%", height: "400px", background: "#ddd", borderRadius: "1rem", overflow: "hidden", cursor: "crosshair" }}
                onClick={handleMapClick}
              >
                <img 
                  src={layouts.find(l => l._id === selectedLayoutId)?.layoutImage || "https://images.unsplash.com/photo-1524813686514-627c24479e12?w=800"} 
                  alt="Layout Map" 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
                
                {/* Render existing plots */}
                {plots.map(p => (
                  <div key={p._id} style={{
                    position: "absolute",
                    left: `${p.positionX}%`,
                    top: `${p.positionY}%`,
                    width: "20px", height: "20px",
                    background: p.status === "Sold" ? "var(--danger)" : (p.status === "Reserved" ? "var(--warning)" : "var(--success)"),
                    border: "2px solid white", borderRadius: "50%", transform: "translate(-50%, -50%)"
                  }} title={`Plot ${p.plotNumber}`} />
                ))}

                {/* Render new plot coordinate point */}
                {plotForm.positionX !== 0 && (
                  <div style={{
                    position: "absolute",
                    left: `${plotForm.positionX}%`, top: `${plotForm.positionY}%`,
                    width: "24px", height: "24px", background: "blue",
                    border: "2px solid white", borderRadius: "50%", transform: "translate(-50%, -50%)", animation: "marker-pulse 1.5s infinite"
                  }} title="New Plot Position" />
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
              
              {/* Plot Form */}
              <div className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-md)", alignSelf: "start" }}>
                <h3>{plotForm._id ? "Edit Plot" : "Add New Plot"}</h3>
                <form onSubmit={handleSavePlot} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                  <input required placeholder="Plot Number (e.g., P1)" value={plotForm.plotNumber} onChange={e => setPlotForm({...plotForm, plotNumber: e.target.value})} />
                  <input required type="number" placeholder="Size (sq.ft)" value={plotForm.size} onChange={e => setPlotForm({...plotForm, size: e.target.value})} />
                  <input required placeholder="Dimensions (e.g., 30x40)" value={plotForm.dimensions} onChange={e => setPlotForm({...plotForm, dimensions: e.target.value})} />
                  <select value={plotForm.facing} onChange={e => setPlotForm({...plotForm, facing: e.target.value})}>
                    <option>North</option><option>South</option><option>East</option><option>West</option>
                    <option>North-East</option><option>North-West</option><option>South-East</option><option>South-West</option>
                  </select>
                  <input required type="number" placeholder="Price (₹)" value={plotForm.price} onChange={e => setPlotForm({...plotForm, price: e.target.value})} />
                  <select value={plotForm.status} onChange={e => setPlotForm({...plotForm, status: e.target.value})}>
                    <option>Available</option><option>Reserved</option><option>Sold</option>
                  </select>

                  <div style={{ display: "flex", gap: "1rem" }}>
                    <input disabled placeholder="X %" value={plotForm.positionX} style={{ flex: 1, opacity: 0.7 }} title="Map X Coordinate (Click Map to set)" />
                    <input disabled placeholder="Y %" value={plotForm.positionY} style={{ flex: 1, opacity: 0.7 }} title="Map Y Coordinate (Click Map to set)" />
                  </div>
                  
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{plotForm._id ? "Update" : "Add Plot"}</button>
                    {plotForm._id && <button type="button" className="btn btn-secondary" onClick={() => setPlotForm({ plotNumber: "", size: "", dimensions: "", facing: "North", price: "", status: "Available", positionX: 0, positionY: 0, _id: null })}>Cancel</button>}
                  </div>
                </form>
              </div>

              {/* Plot List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {plots.length === 0 ? <div className="glass" style={{ padding: "2rem", textAlign: "center" }}>No plots added yet.</div> : null}
                {plots.map(p => (
                  <div key={p._id} className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ fontSize: "1.2rem" }}>Plot {p.plotNumber} <span className="chip" style={{ fontSize: "0.8rem", marginLeft: "0.5rem" }}>{p.status}</span></h4>
                      <p className="text-muted" style={{ fontSize: "0.9rem", marginTop: "0.2rem" }}>
                        {p.size} sq.ft • {p.dimensions} • Facing {p.facing} • ₹{p.price.toLocaleString()}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setPlotForm({ ...p })}>Edit</button>
                      <button className="btn btn-secondary btn-sm danger" onClick={() => handleDeletePlot(p._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        ) : activeTab === "layouts" ? (
          // --- LAYOUTS VIEW ---
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2>Manage Layouts</h2>
              <button className="btn btn-primary" onClick={() => { setShowLayoutForm(true); setLayoutForm({ name: "", location: "", totalPlots: "", layoutImage: "", description: "", _id: null }); }}>+ New Layout</button>
            </div>

            {showLayoutForm && (
              <div className="glass" style={{ padding: "2rem", marginBottom: "2rem", borderRadius: "1rem" }}>
                <h3>{layoutForm._id ? "Edit Layout" : "Create New Layout"}</h3>
                <form onSubmit={handleSaveLayout} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                  <input required placeholder="Layout Name" value={layoutForm.name} onChange={e => setLayoutForm({ ...layoutForm, name: e.target.value })} />
                  <input required placeholder="Location" value={layoutForm.location} onChange={e => setLayoutForm({ ...layoutForm, location: e.target.value })} />
                  <input required type="number" placeholder="Total Plots" value={layoutForm.totalPlots} onChange={e => setLayoutForm({ ...layoutForm, totalPlots: e.target.value })} />
                  <input required placeholder="Layout Image Map URL" value={layoutForm.layoutImage} onChange={e => setLayoutForm({ ...layoutForm, layoutImage: e.target.value })} />
                  <textarea placeholder="Description" value={layoutForm.description} onChange={e => setLayoutForm({ ...layoutForm, description: e.target.value })} style={{ gridColumn: "1/-1" }} rows="3" />
                  <div style={{ gridColumn: "1/-1", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowLayoutForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Layout</button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
              {layouts.map(layout => (
                <div key={layout._id} className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-lg)" }}>
                  <h3>{layout.name}</h3>
                  <p className="text-muted">📍 {layout.location}</p>
                  <p style={{ marginTop: "1rem" }}><strong>{layout.totalPlots}</strong> Plots Planned</p>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => managePlots(layout._id)}>Manage Plots Maps</button>
                    <button className="btn btn-secondary" onClick={() => { setShowLayoutForm(true); setLayoutForm({ ...layout }); }}>Edit</button>
                    <button className="btn btn-secondary danger" onClick={() => handleDeleteLayout(layout._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // --- VISITS VIEW ---
          <div>
            <h2>Site Visit Requests</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
              {visits.map(v => (
                <div key={v._id} className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4>{v.customerName} <span className="text-muted" style={{ fontWeight: 400 }}>requested to view Plot</span> {v.plotId?.plotNumber} <span className="text-muted" style={{ fontWeight: 400 }}>in</span> {v.layoutId?.name}</h4>
                    <p style={{ marginTop: "0.5rem" }}>📞 {v.phone} {v.email ? `• ✉️ ${v.email}` : ''} • 🕐 {new Date(v.visitDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <select 
                      value={v.status} 
                      onChange={(e) => handleUpdateVisit(v._id, e.target.value)}
                      style={{ padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)" }}
                    >
                      <option>Pending</option>
                      <option>Approved</option>
                      <option>Rejected</option>
                    </select>
                  </div>
                </div>
              ))}
              {visits.length === 0 && <p className="text-muted">No visit requests found.</p>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AgentDashboard;

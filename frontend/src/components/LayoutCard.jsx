import { Link } from "react-router-dom";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1524813686514-627c24479e12?w=800";

function LayoutCard({ layout }) {
  return (
    <div className="property-card glass fade-in-up">
      <div className="card-image-wrap">
        <img
          src={layout.layoutImage || FALLBACK_IMG}
          alt={layout.name}
          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
        />
        <span className="card-badge badge-sale">Premium Layout</span>
      </div>
      
      <div className="card-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h3>{layout.name}</h3>
            <p className="card-location">📍 {layout.location}</p>
          </div>
        </div>
        
        <p className="card-price large">
          {layout.totalPlots} <span style={{fontSize: "0.9rem", color: "var(--text-muted)"}}>plots available</span>
        </p>

        <div className="card-footer">
          <Link to={`/layouts/${layout._id}`} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            View Layout & Plots
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LayoutCard;

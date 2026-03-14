import { useState } from "react";
import { Link } from "react-router-dom";
import { useCompare } from "../context/CompareContext";
import { formatCurrency } from "../utils";

function CompareBar() {
  const { items, remove, clear } = useCompare();
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      {/* Sticky bottom bar */}
      <div className="compare-bar">
        <div className="compare-bar-inner">
          <div className="compare-slots">
            {items.map((p) => (
              <div className="compare-slot" key={p._id}>
                <img
                  src={p.images?.[0] || "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=200"}
                  alt={p.title}
                />
                <span>{p.title}</span>
                <button className="compare-remove" onClick={() => remove(p._id)}>×</button>
              </div>
            ))}
            {Array.from({ length: 3 - items.length }).map((_, i) => (
              <div className="compare-slot empty" key={`empty-${i}`}>
                <span className="compare-placeholder">+ Add property</span>
              </div>
            ))}
          </div>
          <div className="compare-actions">
            <span className="compare-count">{items.length} / 3 selected</span>
            {items.length >= 2 && (
              <button className="btn btn-primary" onClick={() => setOpen(true)}>
                Compare Now →
              </button>
            )}
            <button className="btn btn-ghost" onClick={clear}>Clear</button>
          </div>
        </div>
      </div>

      {/* Comparison Modal */}
      {open && (
        <div className="compare-modal-overlay" onClick={() => setOpen(false)}>
          <div className="compare-modal" onClick={(e) => e.stopPropagation()}>
            <div className="compare-modal-header">
              <h2>Property Comparison</h2>
              <button className="modal-close" onClick={() => setOpen(false)}>×</button>
            </div>
            <div className="compare-table-wrap">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    {items.map((p) => (
                      <th key={p._id}>
                        <img src={p.images?.[0] || "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=200"} alt={p.title} className="compare-th-img" />
                        <br />{p.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Price", (p) => formatCurrency(p.price, p.currency)],
                    ["Type", (p) => p.propertyType],
                    ["Listing", (p) => p.listingType],
                    ["Status", (p) => p.status],
                    ["Location", (p) => [p.location?.area, p.location?.city].filter(Boolean).join(", ")],
                    ["Plot Size", (p) => p.landDetails?.plotSize ? `${p.landDetails.plotSize} ${p.landDetails.plotSizeUnit}` : "—"],
                    ["BHK", (p) => p.bedrooms ? `${p.bedrooms} BHK` : "—"],
                    ["Bathrooms", (p) => p.bathrooms || "—"],
                    ["Built-up Area", (p) => p.builtUpArea ? `${p.builtUpArea} sqft` : "—"],
                    ["Road Access", (p) => p.landDetails?.roadAccess !== undefined ? (p.landDetails.roadAccess ? "✅ Yes" : "❌ No") : "—"],
                    ["Facing", (p) => p.landDetails?.facing || "—"],
                    ["Zoning", (p) => p.landDetails?.zoningType || "—"],
                    ["Water", (p) => p.landDetails?.utilities?.water !== undefined ? (p.landDetails.utilities.water ? "✅" : "❌") : "—"],
                    ["Electricity", (p) => p.landDetails?.utilities?.electricity !== undefined ? (p.landDetails.utilities.electricity ? "✅" : "❌") : "—"],
                  ].map(([label, fn]) => (
                    <tr key={label}>
                      <td className="compare-label">{label}</td>
                      {items.map((p) => <td key={p._id}>{fn(p)}</td>)}
                    </tr>
                  ))}
                  <tr>
                    <td className="compare-label">View</td>
                    {items.map((p) => (
                      <td key={p._id}>
                        <Link to={`/properties/${p._id}`} className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
                          Details →
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CompareBar;

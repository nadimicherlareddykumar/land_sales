import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { createInquiry, createVisit } from "../api/client";
import { fetchPropertyById } from "../api/client";
import ImageGallery from "../components/ImageGallery";
import MapPreview from "../components/MapPreview";
import ReviewsSection from "../components/ReviewsSection";
import { useToast } from "../context/ToastContext";
import { formatCurrency, formatLocation } from "../utils";

const INITIAL_INQUIRY = { name: "", email: "", phone: "", message: "", inquiryType: "General", preferredVisitDate: "" };
const INITIAL_VISIT = { name: "", email: "", phone: "", visitDate: "", notes: "" };

const handleShare = async (title, toast) => {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title, text: `Check out this property: ${title}`, url });
    } catch {}
  } else {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  }
};

function PropertyDetailsPage() {
  const { id } = useParams();
  const toast = useToast();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [inquiryForm, setInquiryForm] = useState(INITIAL_INQUIRY);
  const [visitForm, setVisitForm] = useState(INITIAL_VISIT);
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [submittingVisit, setSubmittingVisit] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchPropertyById(id);
        setProperty(data.property);
      } catch (e) {
        setError(e.response?.data?.message || "Property not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setSubmittingInquiry(true);
    try {
      await createInquiry({ ...inquiryForm, property: id, preferredVisitDate: inquiryForm.preferredVisitDate || undefined });
      toast.success("Enquiry sent successfully!");
      setInquiryForm(INITIAL_INQUIRY);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send enquiry");
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    setSubmittingVisit(true);
    try {
      await createVisit({ ...visitForm, property: id });
      toast.success("Site visit requested successfully!");
      setVisitForm(INITIAL_VISIT);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request visit");
    } finally {
      setSubmittingVisit(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton-detail">
          <div className="skeleton skeleton-gallery" />
          <div className="skeleton skeleton-detail-text" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="page page-center">
        <div className="empty-state glass">
          <div className="empty-icon">🔍</div>
          <h2>Property Not Found</h2>
          <p>{error || "This property is unavailable."}</p>
          <Link to="/" className="btn btn-primary">Back to Browse</Link>
        </div>
      </div>
    );
  }

  const isUnavailable = property.status === "Sold" || property.status === "Rented";

  return (
    <div className="page">
      <section className="details-layout">
        {/* LEFT COLUMN */}
        <div className="details-left">
          <ImageGallery images={property.images} title={property.title} />

          <div className="detail-card">
            <div className="detail-card-header">
              <p className="eyebrow">{property.propertyType}</p>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span className={`status-label ${isUnavailable ? "status-unavail" : "status-avail"}`}>
                  {property.status}
                </span>
                <button
                  className="btn btn-secondary btn-sm share-btn"
                  onClick={() => handleShare(property.title, toast)}
                  title="Share this property"
                >
                  🔗 Share
                </button>
              </div>
            </div>
            <h1>{property.title}</h1>
            <p className="property-price large">{formatCurrency(property.price, property.currency)}</p>
            <p className="text-muted">📍 {formatLocation(property.location)}</p>
            <p style={{ marginTop: "0.75rem" }}>{property.description}</p>

            <div className="chip-row">
              <span className="chip">{property.listingType}</span>
              {property.landDetails?.facing && <span className="chip">Facing: {property.landDetails.facing}</span>}
              {property.landDetails?.zoningType && <span className="chip">Zone: {property.landDetails.zoningType}</span>}
              {property.bedrooms ? <span className="chip">{property.bedrooms} BHK</span> : null}
              {property.bathrooms ? <span className="chip">{property.bathrooms} Bath</span> : null}
              {property.builtUpArea ? <span className="chip">{property.builtUpArea} sqft</span> : null}
              {property.parking ? <span className="chip">{property.parking} Parking</span> : null}
            </div>

            {property.amenities?.length > 0 && (
              <div className="amenities-row">
                <p className="detail-label">Amenities</p>
                <div className="chip-row">
                  {property.amenities.map((a) => <span key={a} className="chip chip-green">{a}</span>)}
                </div>
              </div>
            )}

            {property.ownerContact && (
              <div className="owner-contact">
                <p className="detail-label">Sales Representative</p>
                <div className="owner-details">
                  <span>👤 {property.ownerContact.name}</span>
                  <a href={`tel:${property.ownerContact.phone}`} className="contact-btn">
                    📞 {property.ownerContact.phone}
                  </a>
                  {property.ownerContact.email && (
                    <a href={`mailto:${property.ownerContact.email}`} className="contact-btn">
                      ✉️ {property.ownerContact.email}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {property.landDetails?.plotSize && (
            <div className="detail-card">
              <h2>Plot & Land Details</h2>
              <div className="land-grid">
                <div className="land-item"><span className="land-label">Plot Size</span><span>{property.landDetails.plotSize} {property.landDetails.plotSizeUnit}</span></div>
                <div className="land-item"><span className="land-label">Dimensions</span><span>{property.landDetails.dimensions?.length || "—"} × {property.landDetails.dimensions?.width || "—"} {property.landDetails.dimensions?.unit || "ft"}</span></div>
                <div className="land-item"><span className="land-label">Road Access</span><span>{property.landDetails.roadAccess ? "✅ Yes" : "❌ No"}</span></div>
                <div className="land-item"><span className="land-label">Facing</span><span>{property.landDetails.facing}</span></div>
                <div className="land-item"><span className="land-label">Zoning</span><span>{property.landDetails.zoningType}</span></div>
                <div className="land-item"><span className="land-label">Water</span><span>{property.landDetails.utilities?.water ? "✅" : "❌"}</span></div>
                <div className="land-item"><span className="land-label">Electricity</span><span>{property.landDetails.utilities?.electricity ? "✅" : "❌"}</span></div>
                <div className="land-item"><span className="land-label">Sewage</span><span>{property.landDetails.utilities?.sewage ? "✅" : "❌"}</span></div>
              </div>
            </div>
          )}

          <div className="detail-card">
            <h2>Map Location</h2>
            <MapPreview latitude={property.location?.latitude} longitude={property.location?.longitude} label={`${property.title} map`} />
          </div>

          <ReviewsSection propertyId={id} />
        </div>

        {/* RIGHT COLUMN */}
        <aside className="details-right details-sticky">
          {isUnavailable ? (
            <div className="detail-card unavailable-notice">
              <div className="unavail-icon">🚫</div>
              <h3>No Longer Available</h3>
              <p>This property is currently <strong>{property.status}</strong> and cannot accept new enquiries.</p>
              <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>Browse Other Listings</Link>
            </div>
          ) : (
            <>
              <form className="card-form" onSubmit={handleInquirySubmit}>
                <h2>Send Enquiry</h2>
                <input placeholder="Your Name" value={inquiryForm.name} onChange={(e) => setInquiryForm(p => ({ ...p, name: e.target.value }))} required />
                <input placeholder="Email" type="email" value={inquiryForm.email} onChange={(e) => setInquiryForm(p => ({ ...p, email: e.target.value }))} required />
                <input placeholder="Phone" value={inquiryForm.phone} onChange={(e) => setInquiryForm(p => ({ ...p, phone: e.target.value }))} required />
                <select value={inquiryForm.inquiryType} onChange={(e) => setInquiryForm(p => ({ ...p, inquiryType: e.target.value }))}>
                  <option value="General">General</option>
                  <option value="Site Visit">Site Visit</option>
                  <option value="Callback">Callback</option>
                </select>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", gap: "0.3rem" }}>
                  Preferred Visit Date
                  <input type="date" value={inquiryForm.preferredVisitDate} onChange={(e) => setInquiryForm(p => ({ ...p, preferredVisitDate: e.target.value }))} />
                </label>
                <textarea placeholder="Your message..." rows={4} value={inquiryForm.message} onChange={(e) => setInquiryForm(p => ({ ...p, message: e.target.value }))} required />
                <button className="btn btn-primary btn-full" type="submit" disabled={submittingInquiry}>
                  {submittingInquiry ? "Sending..." : "Send Enquiry"}
                </button>
              </form>

              <form className="card-form" onSubmit={handleVisitSubmit}>
                <h2>Book Site Visit</h2>
                <input placeholder="Your Name" value={visitForm.name} onChange={(e) => setVisitForm(p => ({ ...p, name: e.target.value }))} required />
                <input placeholder="Email" type="email" value={visitForm.email} onChange={(e) => setVisitForm(p => ({ ...p, email: e.target.value }))} required />
                <input placeholder="Phone" value={visitForm.phone} onChange={(e) => setVisitForm(p => ({ ...p, phone: e.target.value }))} required />
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", gap: "0.3rem" }}>
                  Visit Date & Time
                  <input type="datetime-local" value={visitForm.visitDate} onChange={(e) => setVisitForm(p => ({ ...p, visitDate: e.target.value }))} required />
                </label>
                <textarea rows={3} placeholder="Any notes for the owner?" value={visitForm.notes} onChange={(e) => setVisitForm(p => ({ ...p, notes: e.target.value }))} />
                <button className="btn btn-primary btn-full" type="submit" disabled={submittingVisit}>
                  {submittingVisit ? "Requesting..." : "Request Visit"}
                </button>
              </form>
            </>
          )}
        </aside>
      </section>
    </div>
  );
}

export default PropertyDetailsPage;

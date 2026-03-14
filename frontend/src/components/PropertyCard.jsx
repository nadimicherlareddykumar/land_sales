import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { useCompare } from "../context/CompareContext";
import { formatCurrency, formatLocation, isNewListing, calcPricePerSqft } from "../utils";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1448630360428-65456885c650?w=800";

const STATUS_BADGE = {
  Available: { label: "Available", cls: "badge-available" },
  Booked: { label: "Booked", cls: "badge-booked" },
  Sold: { label: "Sold", cls: "badge-sold" },
  Rented: { label: "Rented", cls: "badge-rented" },
};

const LAND_TYPES = ["Residential Plot", "Agricultural Land", "Commercial Land", "Industrial Land"];

function PropertyCard({ property }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toggle: toggleCompare, isComparing } = useCompare();
  const favorite = isFavorite(property._id);
  const comparing = isComparing(property._id);
  const status = STATUS_BADGE[property.status] || STATUS_BADGE.Available;
  const isNew = isNewListing(property.createdAt);
  const isLand = LAND_TYPES.includes(property.propertyType);

  const pricePerSqft = isLand
    ? calcPricePerSqft(property.price, property.landDetails?.plotSize, property.landDetails?.plotSizeUnit)
    : null;

  return (
    <article className={`property-card ${comparing ? "card-comparing" : ""}`}>
      <div className="property-media">
        <img
          src={property.images?.[0] || FALLBACK_IMG}
          alt={property.title}
          loading="lazy"
          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
        />

        {/* Overlay on hover */}
        <div className="card-hover-overlay">
          <p className="overlay-price">{formatCurrency(property.price, property.currency)}</p>
          <p className="overlay-location">📍 {formatLocation(property.location)}</p>
        </div>

        {/* Badges */}
        <span className="badge">{property.propertyType}</span>
        <span className={`status-badge ${status.cls}`}>{status.label}</span>

        {isNew && <span className="new-badge"><span className="new-pulse" />NEW</span>}
        {property.isFeatured && <span className="featured-badge">⭐ Featured</span>}

        {/* Heart button */}
        <button
          className={`heart-btn ${favorite ? "hearted" : ""}`}
          type="button"
          onClick={() => toggleFavorite(property)}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="property-content">
        <h3>{property.title}</h3>
        <p className="property-location">
          <span>📍</span> {formatLocation(property.location)}
        </p>

        <div className="price-row">
          <p className="property-price">{formatCurrency(property.price, property.currency)}</p>
          {pricePerSqft && (
            <span className="price-sqft">₹{pricePerSqft.toLocaleString("en-IN")}/sqft</span>
          )}
        </div>

        <div className="property-meta">
          <span>{property.listingType}</span>
          {property.landDetails?.plotSize && (
            <span>{property.landDetails.plotSize} {property.landDetails.plotSizeUnit}</span>
          )}
          {property.bedrooms ? <span>{property.bedrooms} BHK</span> : null}
          {property.bathrooms ? <span>{property.bathrooms} Bath</span> : null}
          {property.builtUpArea ? <span>{property.builtUpArea} sqft</span> : null}
        </div>

        <div className="property-actions">
          <Link className="btn btn-primary" to={`/properties/${property._id}`}>
            View Details
          </Link>
          <button
            className={`btn ${comparing ? "btn-compare-active" : "btn-secondary"} btn-sm`}
            type="button"
            onClick={() => toggleCompare(property)}
            title={comparing ? "Remove from compare" : "Add to compare"}
          >
            {comparing ? "✓ Comparing" : "Compare"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default PropertyCard;

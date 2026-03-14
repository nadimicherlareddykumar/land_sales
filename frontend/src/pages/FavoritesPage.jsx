import PropertyCard from "../components/PropertyCard";
import { useFavorites } from "../context/FavoritesContext";

function FavoritesPage() {
  const { favorites, clearFavorites } = useFavorites();

  return (
    <div className="page">
      <section className="page-header compact">
        <p className="eyebrow">Saved Listings</p>
        <h1>Favorites</h1>
        <p>Keep your shortlisted plots, apartments, and commercial spaces here.</p>
      </section>

      {favorites.length > 0 ? (
        <div className="toolbar-row">
          <button className="btn btn-secondary" type="button" onClick={clearFavorites}>
            Clear Favorites
          </button>
        </div>
      ) : null}

      <section className="property-grid">
        {favorites.map((property) => (
          <PropertyCard key={property._id} property={property} />
        ))}
      </section>

      {favorites.length === 0 ? (
        <p className="status-text">No favorites yet. Save properties from the browse page.</p>
      ) : null}
    </div>
  );
}

export default FavoritesPage;

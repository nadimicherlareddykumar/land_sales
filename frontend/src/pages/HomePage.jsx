import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchLayouts } from "../api/client";
import { useToast } from "../context/ToastContext";
import LayoutCard from "../components/LayoutCard";

function HomePage() {
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState("");
  const [params] = useSearchParams();
  const toast = useToast();
  const gridRef = useRef(null);

  useEffect(() => {
    const keyword = params.get("keyword");
    if (keyword) setHeroSearch(keyword);
    loadLayouts(keyword);
  }, [params]);

  const loadLayouts = async (keyword) => {
    setLoading(true);
    try {
      const data = await fetchLayouts(keyword ? { keyword } : {});
      setLayouts(data.layouts || []);
    } catch (err) {
      toast.error("Failed to load layouts");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      window.history.pushState({}, "", `/?keyword=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      window.history.pushState({}, "", `/`);
    }
    loadLayouts(heroSearch.trim());
    gridRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">PND Developers</p>
          <h1>Premium Layouts &<br />Plots for Your Future</h1>
          <p className="hero-sub">
            Discover our exclusive layouts handpicked for your lifestyle and business needs. Explore interactive plot maps directly from the developer.
          </p>

          <form className="hero-search-bar" onSubmit={handleSearch}>
            <span className="hero-search-icon">🔍</span>
            <input
              className="hero-search-input"
              placeholder="Search by city, layout name..."
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">Search Layouts</button>
          </form>

          <div className="hero-stats">
            <div className="stat-box">
              <span className="stat-num">{layouts.length}+</span>
              <span className="stat-label">Layouts</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">5k+</span>
              <span className="stat-label">Happy Owners</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: "4rem 1rem" }} ref={gridRef}>
        <div className="section-header" style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2>Our Active Layouts</h2>
          <p className="text-muted">Select a layout to view available plots and interactive maps</p>
        </div>

        {loading ? (
          <div className="property-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: "400px", borderRadius: "1rem" }} />
            ))}
          </div>
        ) : layouts.length === 0 ? (
          <div className="empty-state glass">
            <h3>No layouts found</h3>
            <p>We couldn't find any layouts matching your search.</p>
            <button className="btn btn-secondary" onClick={() => { setHeroSearch(""); loadLayouts(""); }}>
              Clear Search
            </button>
          </div>
        ) : (
          <div className="property-grid">
            {layouts.map((layout) => (
              <LayoutCard key={layout._id} layout={layout} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;

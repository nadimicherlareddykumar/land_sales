import { useState } from "react";
import {
  FACING_DIRECTIONS,
  LISTING_TYPES,
  PROPERTY_TYPES,
  ZONING_TYPES
} from "../constants";

const PRIMARY_FILTER_KEYS = ["keyword", "location", "propertyType", "listingType"];

function ActiveChips({ filters, onChange, onApply }) {
  const DEFAULT = { keyword: "", location: "", propertyType: "", listingType: "", minPrice: "", maxPrice: "", minPlotSize: "", maxPlotSize: "", facing: "", zoningType: "", roadAccess: "" };
  const active = Object.entries(filters).filter(([k, v]) => v !== "" && v !== undefined);
  if (active.length === 0) return null;

  const removeFilter = (key) => {
    onChange(key, DEFAULT[key] ?? "");
    // auto-apply when chip removed
    setTimeout(onApply, 0);
  };

  const LABELS = {
    keyword: "Keyword", location: "Location", propertyType: "Type", listingType: "Listing",
    minPrice: "Min Price", maxPrice: "Max Price", minPlotSize: "Min Plot", maxPlotSize: "Max Plot",
    facing: "Facing", zoningType: "Zoning", roadAccess: "Road Access"
  };

  return (
    <div className="active-chips">
      {active.map(([key, val]) => (
        <span className="active-chip" key={key}>
          {LABELS[key] || key}: <strong>{val}</strong>
          <button onClick={() => removeFilter(key)} aria-label={`Remove ${key} filter`}>×</button>
        </span>
      ))}
    </div>
  );
}

function FiltersPanel({ filters, onChange, onApply, onReset }) {
  const [advanced, setAdvanced] = useState(false);
  const handleInput = (event) => onChange(event.target.name, event.target.value);

  const advancedActive = ["minPrice", "maxPrice", "minPlotSize", "maxPlotSize", "facing", "zoningType", "roadAccess"]
    .filter((k) => filters[k] !== "").length;

  return (
    <section className="filters-panel">
      {/* Primary Filters */}
      <div className="filter-grid primary-grid">
        <label>
          Keyword
          <input name="keyword" value={filters.keyword} onChange={handleInput} placeholder="Plot, villa, commercial..." />
        </label>

        <label>
          Location
          <input name="location" value={filters.location} onChange={handleInput} placeholder="City, area, state" />
        </label>

        <label>
          Property Type
          <select name="propertyType" value={filters.propertyType} onChange={handleInput}>
            <option value="">All Types</option>
            {PROPERTY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>

        <label>
          Listing Type
          <select name="listingType" value={filters.listingType} onChange={handleInput}>
            <option value="">Any</option>
            {LISTING_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
      </div>

      {/* Advanced Filters Toggle */}
      <button
        className="advanced-toggle"
        type="button"
        onClick={() => setAdvanced((v) => !v)}
      >
        {advanced ? "▲ Hide" : "▼ Advanced"} Filters
        {advancedActive > 0 && <span className="adv-badge">{advancedActive}</span>}
      </button>

      {/* Advanced Filters Panel */}
      {advanced && (
        <div className="filter-grid advanced-grid">
          <label>
            Min Price
            <input name="minPrice" value={filters.minPrice} onChange={handleInput} type="number" min="0" placeholder="500000" />
          </label>
          <label>
            Max Price
            <input name="maxPrice" value={filters.maxPrice} onChange={handleInput} type="number" min="0" placeholder="5000000" />
          </label>
          <label>
            Min Plot Size
            <input name="minPlotSize" value={filters.minPlotSize} onChange={handleInput} type="number" min="0" placeholder="1200" />
          </label>
          <label>
            Max Plot Size
            <input name="maxPlotSize" value={filters.maxPlotSize} onChange={handleInput} type="number" min="0" placeholder="3000" />
          </label>
          <label>
            Facing
            <select name="facing" value={filters.facing} onChange={handleInput}>
              <option value="">Any Facing</option>
              {FACING_DIRECTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Zoning
            <select name="zoningType" value={filters.zoningType} onChange={handleInput}>
              <option value="">Any Zoning</option>
              {ZONING_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Road Access
            <select name="roadAccess" value={filters.roadAccess} onChange={handleInput}>
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
        </div>
      )}

      <div className="filter-actions">
        <button className="btn btn-primary" type="button" onClick={onApply}>Apply Filters</button>
        <button className="btn btn-secondary" type="button" onClick={onReset}>Reset All</button>
      </div>

      <ActiveChips filters={filters} onChange={onChange} onApply={onApply} />
    </section>
  );
}

export default FiltersPanel;

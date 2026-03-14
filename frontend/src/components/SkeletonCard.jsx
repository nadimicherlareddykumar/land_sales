function SkeletonCard() {
  return (
    <div className="property-card skeleton-card">
      <div className="skeleton skeleton-media" />
      <div className="property-content">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-price" />
        <div className="skeleton-chips">
          <div className="skeleton skeleton-chip" />
          <div className="skeleton skeleton-chip" />
        </div>
        <div className="skeleton skeleton-btn" />
      </div>
    </div>
  );
}

export default SkeletonCard;

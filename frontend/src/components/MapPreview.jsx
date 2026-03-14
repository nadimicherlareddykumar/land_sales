function MapPreview({ latitude, longitude, label }) {
  if (latitude === undefined || longitude === undefined) {
    return <p className="map-fallback">Map coordinates not available for this property.</p>;
  }

  const delta = 0.01;
  const bbox = `${longitude - delta}%2C${latitude - delta}%2C${longitude + delta}%2C${latitude + delta}`;
  const marker = `${latitude}%2C${longitude}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;

  return (
    <div className="map-wrap">
      <iframe
        title={label || "Property location map"}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a
        className="map-link"
        href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
        target="_blank"
        rel="noreferrer"
      >
        Open in Google Maps
      </a>
    </div>
  );
}

export default MapPreview;

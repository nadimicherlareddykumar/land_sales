import { useState } from "react";

function ImageGallery({ images, title }) {
  const [current, setCurrent] = useState(0);
  const fallback = "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=1200";
  const list = images && images.length > 0 ? images : [fallback];

  const prev = () => setCurrent((c) => (c - 1 + list.length) % list.length);
  const next = () => setCurrent((c) => (c + 1) % list.length);

  return (
    <div className="gallery">
      <div className="gallery-main">
        <img src={list[current]} alt={`${title} - image ${current + 1}`} className="gallery-img" />
        {list.length > 1 && (
          <>
            <button className="gallery-arrow gallery-prev" onClick={prev} aria-label="Previous">‹</button>
            <button className="gallery-arrow gallery-next" onClick={next} aria-label="Next">›</button>
            <div className="gallery-counter">{current + 1} / {list.length}</div>
          </>
        )}
      </div>
      {list.length > 1 && (
        <div className="gallery-thumbs">
          {list.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`thumb ${i + 1}`}
              className={`gallery-thumb ${i === current ? "active" : ""}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageGallery;

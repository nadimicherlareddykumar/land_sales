import { useEffect, useState } from "react";
import { fetchReviews, addReview } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (hover || value) ? "active" : ""}`}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ReviewsSection({ propertyId }) {
  const { isLoggedIn } = useAuth();
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await fetchReviews(propertyId);
      setReviews(data.reviews || []);
      setAvgRating(data.avgRating || 0);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReviews(); }, [propertyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { toast.error("Please select a rating"); return; }
    setSubmitting(true);
    try {
      await addReview({ property_id: propertyId, rating, comment });
      toast.success("Review submitted!");
      setRating(0);
      setComment("");
      loadReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reviews-section detail-card">
      <div className="reviews-header">
        <h2>Reviews</h2>
        {reviews.length > 0 && (
          <div className="avg-rating">
            <StarRating value={Math.round(avgRating)} />
            <span>{avgRating} / 5 ({reviews.length} reviews)</span>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-muted">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-muted">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="review-list">
          {reviews.map((r) => (
            <div key={r._id} className="review-item">
              <div className="review-top">
                <div className="review-avatar">{r.user_id?.name?.[0]?.toUpperCase()}</div>
                <div>
                  <strong>{r.user_id?.name || "Anonymous"}</strong>
                  <StarRating value={r.rating} />
                </div>
                <span className="review-date">{new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
              {r.comment && <p className="review-comment">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {isLoggedIn && (
        <form className="review-form" onSubmit={handleSubmit}>
          <h3>Write a Review</h3>
          <div className="review-rating-row">
            <label>Your Rating*</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <textarea
            placeholder="Share your experience with this property (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {!isLoggedIn && (
        <p className="text-muted review-login-hint">
          <a href="/auth">Sign in</a> to leave a review.
        </p>
      )}
    </div>
  );
}

export default ReviewsSection;

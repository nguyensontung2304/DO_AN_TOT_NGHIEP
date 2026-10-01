import { useState } from "react";
import "./ratingStarts.scss";

export function RatingStars({
  rating,
  maxRating = 5,
  size = 20,
  interactive = false,
  onRate,
  readonly = false,
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || rating;

  const handleClick = (value) => {
    if (interactive && !readonly && onRate) {
      onRate(value);
    }
  };

  const handleKeyDown = (e, value) => {
    if (interactive && !readonly && onRate) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onRate(value);
      } else if (e.key === "ArrowRight" && value < maxRating) {
        e.preventDefault();
        setHoverRating(value + 1);
      } else if (e.key === "ArrowLeft" && value > 1) {
        e.preventDefault();
        setHoverRating(value - 1);
      }
    }
  };

  return (
    <div
      className="rating-stars"
      role={interactive && !readonly ? "radiogroup" : "img"}
      aria-label={`Đánh giá ${rating} trên ${maxRating} sao`}
    >
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${star <= displayRating ? "filled" : ""} ${star === hoverRating ? "hovered" : ""}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => interactive && !readonly && setHoverRating(star)}
          onMouseLeave={() => interactive && !readonly && setHoverRating(0)}
          onKeyDown={(e) => handleKeyDown(e, star)}
          disabled={!interactive || readonly}
          aria-label={`${star} sao`}
          aria-checked={star <= rating}
        >
          <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
      {rating > 0 && !interactive && (
        <span className="rating-value">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}

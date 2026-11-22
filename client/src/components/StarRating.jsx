import { useState } from 'react';
import './StarRating.css';

const MAX_STARS = 5;

// Clickable 5 star picker
function StarRating({ value, onChange, disabled = false, readOnly = false }) {
  const [hover, setHover] = useState(0);
  const shown = (readOnly ? 0 : hover) || value || 0;

  return (
    <div
      className="star-rating"
      role="radiogroup"
      aria-label="Your rating"
      aria-readonly={readOnly}
      onMouseLeave={() => setHover(0)}
    >
      {Array.from({ length: MAX_STARS }, (_, i) => {
        const star = i + 1;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            className={`star-btn${star <= shown ? ' filled' : ''}${readOnly ? ' read-only' : ''}`}
            disabled={disabled || readOnly}
            onMouseEnter={() => setHover(star)}
            onFocus={() => setHover(star)}
            onBlur={() => setHover(0)}
            onClick={() => onChange(star)}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export default StarRating;

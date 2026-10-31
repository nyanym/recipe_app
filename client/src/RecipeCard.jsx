import './RecipeCard.css';

const MAX_STARS = 5;
const formatCount = new Intl.NumberFormat('en', { notation: 'compact' }).format;

function RecipeCard({ title, author, imageUrl, rating, likes }) {
  const filledStars = Math.round(rating);

  return (
    <div className="recipe-card">
      <div className="recipe-card-cover">
        {imageUrl
          ? <img src={imageUrl} alt={title} />
          : <span className="recipe-card-placeholder">🍳</span>}
      </div>

      <p className="recipe-card-title">
        <strong>{title}</strong> by {author}
      </p>

      <div className="recipe-card-meta">
        <span className="recipe-card-stars" aria-label={`${rating} out of ${MAX_STARS} stars`}>
          {Array.from({ length: MAX_STARS }, (_, i) => (
            <span key={i} className={i < filledStars ? 'star filled' : 'star'}>★</span>
          ))}
        </span>
        <span className="recipe-card-likes">👍 {formatCount(likes)}</span>
      </div>
    </div>
  );
}

export default RecipeCard;

import './RecipeCard.css';

const MAX_STARS = 5;
const formatCount = new Intl.NumberFormat('en', { notation: 'compact' }).format;

function RecipeCard({ id, title, author, hasImage, rating, likes, onDelete }) {
  const filledStars = Math.round(rating);

  return (
    <div className="recipe-card">
      <div className="recipe-card-cover">
        {hasImage && (
          <img
            src={`http://localhost:5000/api/posts/${id}/image`}
            alt={title}
            className="recipe-image"
          />
        )}
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

      <button onClick={() => onDelete(id)} className="delete-btn">
        Delete
      </button>
    </div>
  );
}

export default RecipeCard;

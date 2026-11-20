import './RecipeCard.css';

// Added by Satvik
import { Link } from 'react-router-dom';

import Comments from './Comments'

const MAX_STARS = 5;
const formatCount = new Intl.NumberFormat('en', { notation: 'compact' }).format;

function RecipeCard({ id, title, author, hasImage, rating, likes, onDelete, isOwner }) {
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

      {/* Modifyed by Satvik */}
      <p className="recipe-card-title">
        <Link to={`/recipes/${id}`}>
          <strong>{title}</strong>
        </Link>{' '}
        by {author?.username || 'Unknown'}
      </p>

      <div className="recipe-card-meta">
        <span className="recipe-card-stars" aria-label={`${rating} out of ${MAX_STARS} stars`}>
          {Array.from({ length: MAX_STARS }, (_, i) => (
            <span key={i} className={i < filledStars ? 'star filled' : 'star'}>★</span>
          ))}
        </span>
        <span className="recipe-card-likes">👍 {formatCount(likes)}</span>
      </div>

      {isOwner && (<button onClick={() => onDelete(id)} className="delete-btn">
        Delete
      </button>)}

      <Comments postId={id} />
    </div>
  );
}

export default RecipeCard;

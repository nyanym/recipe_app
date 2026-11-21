import { useParams, useNavigate } from 'react-router-dom';
import Comments from '../components/Comments';
import { useAuth } from '../context/AuthContext';

function RecipePage({ posts, loading }) {
    // the id refers to the /recipe/:id
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    if (loading) return <p>Loading recipe...</p>;

    const post = posts.find((p) => p._id === id);
    if (!post) return <p>Recipe not found.</p>;

    const hasIngredients = Array.isArray(post.ingredients) && post.ingredients.length > 0;
    const hasInstructions = Array.isArray(post.instructions) && post.instructions.length > 0;
    // posts made before the ingredient split keep the whole recipe in content
    const isOldFormat = !hasIngredients && !hasInstructions;

    return (
        <div className="recipe-page">
            <button onClick={() => navigate('/')}>Back</button>

            <h2>{post.title}</h2>

            {post.image?.contentType && (
                <img
                    src = {`http://localhost:5000/api/posts/${post._id}/image`}
                    alt={post.title}
                    style={{ maxWidth: '100%'}}
                />
            )}

            {(post.servings || post.minutes) && (
                <p>
                    {post.servings ? `Servings: ${post.servings}` : ''}
                    {post.servings && post.minutes ? ' · ' : ''}
                    {post.minutes ? `Minutes: ${post.minutes}` : ''}
                </p>
            )}

            { /* short description (or the whole recipe text for old posts); keep the whitespace as is */}
            {post.content && (
                <p style = {{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
            )}

            {hasIngredients && (
                <>
                    <h3>Ingredients</h3>
                    <ul>
                        {post.ingredients.map((item, index) => (
                            <li key={index}>
                                {item.quantity} {item.name}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {hasInstructions && (
                <>
                    <h3>Instructions</h3>
                    <ol>
                        {post.instructions.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ol>
                </>
            )}

            {isOldFormat && !post.content && <p>This recipe has no details.</p>}

            <Comments
            key={post._id}
            postId={post._id}
            currentUsername={user?.username}
            />
        </div>
    );
}

export default RecipePage;
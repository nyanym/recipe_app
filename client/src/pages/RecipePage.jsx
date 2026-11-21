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

            { /* keep the whitespace as is */}
            <p style = {{ whiteSpace: 'pre-wrap' }}>{post.content}</p>

            <Comments
            key={post._id}
            postId={post._id}
            currentUsername={user?.username}
            />
        </div>
    );
}

export default RecipePage;


import { useEffect, useState } from 'react';
import './Comments.css';

function Comments({ postId }){
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await fetch(
                    `http://localhost:5000/api/posts/${postId}/comments`
                );

                if (!res.ok) {
                    throw new Error('Failed to fetch comments');
                }

                const data = await res.json();
                setComments(data);

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newComment.trim()) return;

        try {
            setError('');

            const res = await fetch(
                `http://localhost:5000/api/posts/${postId}/comments`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: newComment
                    })
                }
            );

            if (!res.ok) {
                throw new Error('Failed to submit comment');
            }

            const comment = await res.json();

            setComments(prev => [comment, ...prev]);

            setNewComment('');
        } catch (error) {
            setError(error.message);
        }

    }

    return (
        <div className="comments-section">
            <h3>Comments</h3>

            {loading && <p>Loading comments...</p>}

            {error && <p className="error">{error}</p>}

            {!loading && comments.length === 0 && (
                <p>No comments yet.</p>
            )}

            {comments.map(comment => (
                <div key={comment._id} className="comment">
                    <strong>{comment.username}</strong>
                    <p>{comment.text}</p>
                </div>
            ))}

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                />

                <button type="submit">
                    Post
                </button>
            </form>
        </div>
    );
}

export default Comments;
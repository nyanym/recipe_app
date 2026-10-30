import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreatePostPage.css';

const MAX_TITLE_WORDS = 20; //total title word count

// split by spaces
const countWords = (text) => {
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
};

function CreatePostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const titleWordCount = countWords(title);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (titleWordCount === 0) {
      setError('Title must have at least 1 word.');
      return;
    }
    if (titleWordCount >= MAX_TITLE_WORDS) {
      setError(`Title must be fewer than ${MAX_TITLE_WORDS} words.`);
      return;
    }
    if (content.trim() === '') {
      setError('Recipe content cannot be empty.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      navigate('/');
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-post-wrapper">
      <div className="create-post-header">
        <h2>Create a New Post</h2>
        <button onClick={() => navigate('/')} className="cancel-btn">
          ✕ Cancel
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="form-group">
          <label className="form-label">
            Post Title ({titleWordCount}/{MAX_TITLE_WORDS - 1} words)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tittttllleeee"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Recipe</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Give me your recipes"
            rows="8"
            required
            className="form-textarea"
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting} className="profile-btn">
            {isSubmitting ? 'Publishing...' : 'Publish Recipe'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePostPage;
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreatePostPage.css';

const MAX_TITLE_WORDS = 21; // title word count limit
const MAX_CONTENT_CHARS = 300; // description char count limit

//split by spaces
const countWords = (text) => {
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
};

function CreatePostPage({ onPostCreated }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // description
  const [ingredients, setIngredients] = useState([
    { id: 0, quantity: '', name: '' },
  ]);
  const [steps, setSteps] = useState([{ id: 1, text: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const nextId = useRef(2); // unique ids for rows
  const pendingFocus = useRef(null); // element id to focus after a row is added

  const titleWordCount = countWords(title);

  // after a new row is added, move the cursor into it
  useEffect(() => {
    if (pendingFocus.current) {
      const el = document.getElementById(pendingFocus.current);
      if (el) el.focus();
      pendingFocus.current = null;
    }
  }, [ingredients, steps]);

  // ---------- ingredients ----------
  const addIngredient = () => {
    const id = nextId.current++;
    setIngredients((prev) => [...prev, { id, quantity: '', name: '' }]);
    pendingFocus.current = `ing-qty-${id}`;
  };

  const updateIngredient = (id, field, value) => {
    setIngredients((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const removeIngredient = (id) => {
    setIngredients((prev) => prev.filter((row) => row.id !== id));
  };

  // Enter in the name box of the last row adds a new row (instead of submitting)
  const handleIngredientKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === ingredients.length - 1) {
        addIngredient();
      }
    }
  };

  // ---------- instructions ----------
  const addStep = () => {
    const id = nextId.current++;
    setSteps((prev) => [...prev, { id, text: '' }]);
    pendingFocus.current = `step-${id}`;
  };

  const updateStep = (id, value) => {
    setSteps((prev) =>
      prev.map((row) => (row.id === id ? { ...row, text: value } : row))
    );
  };

  const removeStep = (id) => {
    setSteps((prev) => prev.filter((row) => row.id !== id));
  };

  // Enter in the last step adds a new step (instead of submitting)
  const handleStepKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === steps.length - 1) {
        addStep();
      }
    }
  };

  // ---------- submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ignore completely blank rows
    const cleanIngredients = ingredients
      .map((row) => ({ quantity: row.quantity.trim(), name: row.name.trim() }))
      .filter((row) => row.quantity !== '' || row.name !== '');
    const cleanSteps = steps
      .map((row) => row.text.trim())
      .filter((text) => text !== '');

    if (titleWordCount === 0) {
      setError('Title must have at least 1 word.');
      return;
    }
    if (titleWordCount >= MAX_TITLE_WORDS) {
      setError(`Title must be fewer than ${MAX_TITLE_WORDS} words.`);
      return;
    }
    if (content.trim().length > MAX_CONTENT_CHARS) {
      setError(`Description must be ${MAX_CONTENT_CHARS} characters or fewer.`);
      return;
    }
    if (cleanIngredients.length === 0) {
      setError('Add at least one ingredient.');
      return;
    }
    if (cleanIngredients.some((row) => row.quantity === '' || row.name === '')) {
      setError('Each ingredient needs both a quantity and a name.');
      return;
    }
    if (cleanSteps.length === 0) {
      setError('Add at least one instruction step.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          ingredients: cleanIngredients,
          instructions: cleanSteps,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create post');
      }

      // update dashboard to display most recept post
      if (onPostCreated) {
        onPostCreated();
      }

      navigate('/');
    } catch (err) {
      console.error('Error creating post:', err);
      setError(
        err.message === 'Failed to fetch'
          ? 'Could not reach the server. Is it running?'
          : err.message || 'Failed to create post. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const rowStyle = {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    marginBottom: '0.5rem',
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
          <label className="form-label">
            Short Description ({content.length}/{MAX_CONTENT_CHARS})
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What is this recipe about?"
            rows="3"
            maxLength={MAX_CONTENT_CHARS}
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Ingredients</label>
          {ingredients.map((row, index) => (
            <div key={row.id} style={rowStyle}>
              <input
                id={`ing-qty-${row.id}`}
                type="text"
                value={row.quantity}
                onChange={(e) =>
                  updateIngredient(row.id, 'quantity', e.target.value)
                }
                placeholder="Quantity (2 cups)"
                className="form-input"
                style={{ flex: 1 }}
              />
              <input
                type="text"
                value={row.name}
                onChange={(e) => updateIngredient(row.id, 'name', e.target.value)}
                onKeyDown={(e) => handleIngredientKeyDown(e, index)}
                placeholder="Ingredient (flour)"
                className="form-input"
                style={{ flex: 2 }}
              />
              <button
                type="button"
                onClick={() => removeIngredient(row.id)}
                disabled={ingredients.length === 1}
                className="cancel-btn"
                aria-label="Remove ingredient"
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" onClick={addIngredient} className="profile-btn">
            + Add ingredient
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Instructions</label>
          {steps.map((row, index) => (
            <div key={row.id} style={rowStyle}>
              <span>{index + 1}.</span>
              <input
                id={`step-${row.id}`}
                type="text"
                value={row.text}
                onChange={(e) => updateStep(row.id, e.target.value)}
                onKeyDown={(e) => handleStepKeyDown(e, index)}
                placeholder="Describe this step"
                className="form-input"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => removeStep(row.id)}
                disabled={steps.length === 1}
                className="cancel-btn"
                aria-label="Remove step"
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" onClick={addStep} className="profile-btn">
            + Add step
          </button>
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
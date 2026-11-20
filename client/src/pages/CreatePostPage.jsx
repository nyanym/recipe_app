import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreatePostPage.css';

const MAX_TITLE_WORDS = 21; //total title word count

// split by spaces
const countWords = (text) => {
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
};

// check if not a positive whole number
const isPosInt = (value) => {
  const n = Number(value);
  return value !== '' && Number.isInteger(n) && n >= 1;
};

{/* This section was added by Satvik */}
const stringifyRecipe = ({ servings, minutes, ingredients, instructions }) => {
  const ingredientsList = ingredients.map((item) => `- ${item}`).join('\n');
  return (
    `Servings: ${servings}\n` +
    `Minutes: ${minutes}\n\n` +
    `Ingredients:\n` +
    `${ingredientsList}\n\n` +
    `Instructions:\n ${instructions}`
  );
};

function CreatePostPage({ onPostCreated }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [image, setImage] = useState(null);


  {/* This section was added by Satvik */}
  const [servings, setServings] = useState('1');
  const [minutes, setMinutes] = useState('10');
  const [ingredients, setIngredients] = useState(['']);

  const updateIngredient = (index, value) => {
    setIngredients((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const addIngredient = (index, value) => {
    setIngredients((prev) => [...prev, '']);
  };

  const removeIngredient = (index, value) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const titleWordCount = countWords(title);

  const handleSubmit = async (e) => {
    console.log('handleSubmit called');
    e.preventDefault();
    setError('');

    {/* This section was added by Satvik */}
    const ingredientsList = ingredients
      .map((item) => item.trim())
      .filter((item) => item !== '');

    if (titleWordCount === 0) {
      setError('Title must have at least 1 word.');
      return;
    }
    if (titleWordCount >= MAX_TITLE_WORDS) {
      setError(`Title must be fewer than ${MAX_TITLE_WORDS} words.`);
      return;
    }

    if (!isPosInt(servings)) {
      setError('Servings must be a whole number of atleast one.')
      return;
    }
    if (!isPosInt(minutes)) {
      setError('Minutes must be a whole number of atleast one.')
      return;
    }
    if (ingredientsList.length === 0) {
      setError('Add atleast one ingredient.')
      return;
    };


    if (instructions.trim() === '') {
      setError('Instructions cannot be empty.');
      return;
    }

    console.log('validation passed');
    setIsSubmitting(true);

    try {
      // This section was added by Satvik
      const content = stringifyRecipe({
        servings: Number(servings),
        minutes: Number(minutes),
        ingredients: ingredientsList,
        instructions: instructions.trim(),
      });

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      if (image) {
        formData.append('image', image); // matches upload.single('image') in posts.js
      }

      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${response.status}`);
      }
      
      // update dashboard to display most recept post
      if (onPostCreated) {
        onPostCreated();
      }

      navigate('/');
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
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

        {/* This section was added by Satvik */}
        <div className = "form-group">
          <label className="form-label">Servings</label>
          <input
            type="number"
            min="1"
            step="1"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            className="form-input"
          />
        </div>

        {/* This section was added by Satvik */}
        <div className = "form-group">
          <label className="form-label">Minutes</label>
          <input
            type="number"
            min="1"
            step="1"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="form-input"
          />
        </div>

        {/* This section was added by Satvik */}
        <div className = "form-group">
          <label className="form-label">Ingredients</label>
          {ingredients.map((item, index) => (
            <div key={index}>
              <input
              type="text"
              value={item}
              onChange={(e) => updateIngredient(index, e.target.value)}
              className="form-input"
              />
              {ingredients.length > 1 && (
                <button type="button" onClick={() => removeIngredient(index)}>
                  x
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addIngredient}>
            + Add ingredient
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Instructions</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Give me your instructions"
            rows="8"
            required
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Recipe Image (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="form-input"
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
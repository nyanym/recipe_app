import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Comments from '../components/Comments';
import { useAuth } from '../context/AuthContext';

function getRecipeFields(post) {
  if (!post) {
    return { servings: 1, minutes: 0, ingredients: [], instructions: '' };
  }

  return {
    servings: Number(post.servings) || 1,
    minutes: Number(post.minutes) || 0,
    ingredients: Array.isArray(post.ingredients) ? post.ingredients : [],
    // legacy posts created before the schema change only have `content`
    instructions: post.instructions || post.content || '',
  };
}

function RecipePage({ posts, loading, currentUser}) {
    // the id refers to the /recipe/:id
    const { id } = useParams();
    const navigate = useNavigate();
    const [isChecklistOpen, setIsChecklistOpen] = useState(false);
    const [checkedIndices, setCheckedIndices] = useState(() => new Set());
    const { user } = useAuth();

    const post = posts.find((p) => p._id === id);
    const postId = post?._id;
    const userId = currentUser?._id || currentUser?.id || currentUser?.username;

  
    useEffect(() => {
        let active = true;
        setCheckedIndices(new Set());
        if (!postId) return;

        (async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/checklists/${postId}`, {
            credentials: 'include',
            });
            if (res.ok) {
            const data = await res.json();
            if (active && Array.isArray(data.checkedIndices)) {
                setCheckedIndices(new Set(data.checkedIndices));
            }
            } else if (res.status === 401) {
            const local = localStorage.getItem(`checklist_guest_${postId}`);
            if (active && local) {
                const parsed = JSON.parse(local);
                if (Array.isArray(parsed)) setCheckedIndices(new Set(parsed));
            }
            }
        } catch (err) {
            console.error('Failed to load checklist:', err);
        }
        })();

        return () => { active = false; };
    }, [postId, userId]);

    if (loading) return <p>Loading recipe...</p>;
    if (!post) return <p>Recipe not found.</p>;

      const recipe = getRecipeFields(post);

    const persistChecked = async (nextSet) => {
        const arr = Array.from(nextSet);
        try {
        const res = await fetch(`http://localhost:5000/api/checklists/${post._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ checkedIndices: arr }),
        });
        if (res.status === 401) {
            localStorage.setItem(`checklist_guest_${post._id}`, JSON.stringify(arr));
        } else if (!res.ok) {
            console.error('Checklist PUT failed:', res.status, await res.text());
        }
        } catch (err) {
        console.error('Network error saving checklist:', err);
        }
    };

    const toggleIngredient = (index) => {
        const next = new Set(checkedIndices);
        next.has(index) ? next.delete(index) : next.add(index);
        setCheckedIndices(next);
        persistChecked(next);
    };
    
    const totalCount = recipe.ingredients.length;
    const checkedCount = recipe.ingredients.filter((_, i) => checkedIndices.has(i)).length;
    const missingCount = totalCount - checkedCount;
    const allChecked = totalCount > 0 && missingCount === 0;

    return (
        <div className="recipe-page">
            <button onClick={() => navigate('/')}>Back</button>

            <h2>{post.title}</h2>
            
            <button
                type="button"
                className="ingredients-btn"
                onClick={() => setIsChecklistOpen(true)}
            >
                Ingredients
                {totalCount > 0 && (
                    <span
                    className={`ingredients-badge ${allChecked ? 'is-complete' : 'is-missing'}`}
                    >
                    {allChecked ? '✓' : missingCount}
                    </span>
                )}
            </button>

            <p className="recipe-meta">
                Servings: {recipe.servings} • Time: {recipe.minutes} min
            </p>

            {post.image?.contentType && (
                <img
                src={`http://localhost:5000/api/posts/${post._id}/image`}
                alt={post.title}
                className="recipe-image"
                />
            )}

            <h3>Instructions</h3>
            <p className="recipe-instructions">{recipe.instructions}</p>

            {isChecklistOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Ingredients Checklist"
                    className="checklist-modal"
                >
                <div className="checklist-header">
                    <h3>
                        Ingredients ({checkedCount}/{totalCount} checked)
                    </h3>
                        <button type="button" onClick={() => setIsChecklistOpen(false)}>
                            Close
                        </button>
                </div>

                <ul className="checklist-list">
                    {recipe.ingredients.map((item, idx) => {
                        const isChecked = checkedIndices.has(idx);
                        const label =
                            typeof item === 'string'
                            ? item
                            : `${item.amount ? `${item.amount} ` : ''}${item.name || item.ingredient || ''}`;

                        return (
                            <li key={idx} className="checklist-item">
                            <button
                                type="button"
                                onClick={() => toggleIngredient(idx)}
                                aria-pressed={isChecked}
                                className={`checklist-toggle ${isChecked ? 'is-checked' : ''}`}
                            >
                                <span>
                                {isChecked ? '☑ ' : '☐ '}
                                {label}
                                </span>
                            </button>
                            </li>
                        );
                    })}
                </ul>
                    
            </div>
        )}

            <Comments
            key={post._id}
            postId={post._id}
            currentUsername={user?.username}
            />
        </div>
    );
}

export default RecipePage;


import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function getRecipeFields(post) {
  if (!post) {
    return { servings: 1, minutes: 0, ingredients: [], instructions: '' };
  }

  // take in ingredients as array
  if (Array.isArray(post.ingredients)) {
    return {
      servings: Number(post.servings) || 1,
      minutes: Number(post.minutes) || 0,
      ingredients: post.ingredients,
      instructions: post.instructions || '',
    };
  }
  return { servings: 1, minutes: 0, ingredients: [], instructions: '' };
}

function RecipePage({ posts, loading, currentUser, loadSavedChecklist, saveChecklistToAccount}) {
    // the id refers to the /recipe/:id
    const { id } = useParams();
    const navigate = useNavigate();
    const [isChecklistOpen, setIsChecklistOpen] = useState(false);
    const [checkedIndices, setCheckedIndices] = useState(() => new Set());

    if (loading) return <p>Loading recipe...</p>;

    const post = posts.find((p) => p._id === id);
    const recipe = getRecipeFields(post);
    const storageKey = `checklist_${currentUser?._id || currentUser?.id || 'guest'}_${post?._id || id}`;

    useEffect(() => {
        let active = true;
        async function hydrate() {
        if (!post?._id) return;

        if ((currentUser?._id || currentUser?.id) && loadSavedChecklist) {
            try {
            const saved = await loadSavedChecklist({
                userId: currentUser._id || currentUser.id,
                postId: post._id,
            });
            if (active && Array.isArray(saved)) {
                setCheckedIndices(new Set(saved));
                return;
            }
            } catch (err) {
            console.error('Failed to load checklist from account:', err);
            }
        }

        try {
            const localData = localStorage.getItem(storageKey);
            if (active && localData) {
            const parsed = JSON.parse(localData);
            if (Array.isArray(parsed)) {
                setCheckedIndices(new Set(parsed));
            }
            }
        } catch (err) {
            console.error('Failed to load local checklist:', err);
        }
        }

        hydrate();
        return () => {
        active = false;
        };
    }, [post?._id, currentUser?._id, currentUser?.id, storageKey, loadSavedChecklist]);

    if (loading) return <p>Loading recipe...</p>;
    if (!post) return <p>Recipe not found.</p>;

    const persistChecked = async (nextSet) => {
    const arr = Array.from(nextSet);
    try {
      localStorage.setItem(storageKey, JSON.stringify(arr));
    } catch (err) {
      console.error('Failed to save checklist locally:', err);
    }

    if ((currentUser?._id || currentUser?.id) && saveChecklistToAccount) {
        try {
            await saveChecklistToAccount({
            userId: currentUser._id || currentUser.id,
            postId: post._id,
            checkedItems: arr,
            });
        } catch (err) {
            console.error('Failed to save checklist to account:', err);
        }
        }
    };

    const toggleIngredient = (index) => {
        const next = new Set(checkedIndices);
        if (next.has(index)) {
            next.delete(index);
        } else {
            next.add(index);
        }
        setCheckedIndices(next);
        persistChecked(next);
    };

    const totalCount = recipe.ingredients.length;
    const checkedCount = recipe.ingredients.reduce(
        (sum, _, idx) => sum + (checkedIndices.has(idx) ? 1 : 0),
        0
    );
    const missingCount = Math.max(0, totalCount - checkedCount);
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
        </div>
    );
}

export default RecipePage;


import './ProfilePage.css';
import RecipeCard from '../components/RecipeCard';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// temp info until we can read actual recipes users made
const sampleRecipes = [
  { id: 1, title: 'Apple', imageUrl: null, rating: 5, likes: 120 },
  { id: 2, title: 'Banana', imageUrl: null, rating: 5, likes: 87 },
  { id: 3, title: 'Orange', imageUrl: null, rating: 3, likes: 45 },
  { id: 4, title: 'Pear', imageUrl: null, rating: 2, likes: 230 },
];

function ProfilePage({ posts = [], loading, onDeletePost, onSavePost }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const recipes = sampleRecipes;

  const savedPosts = posts.filter((post) => post.isSaved);

  return (
    <div className="profile-wrapper">

      <div className="profile-main">
        <div className="profile-avatar">
          {user.profilePicUrl && <img src={user.profilePicUrl} alt={user.username} />}
        </div>

        <h2>{user.displayName || user.username}</h2>
        <p className="profile-username">@{user.username}</p>
        <p>{user.bio}</p>
        <button onClick={() => navigate('/profile/edit')}>Edit Profile</button>

        <h3 className="profile-section-title">Recipes</h3>
        <div className="profile-recipes">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              author={user.username}
              imageUrl={recipe.imageUrl}
              rating={recipe.rating}
              likes={recipe.likes}
            />
          ))}
        </div>
      </div>

      {/* Saved Recipes */}
      <div className="profile-saved">
        <h2>Saved Recipes</h2>
        {loading ? (
          <p>Loading saved recipes...</p>
        ) : savedPosts.length === 0 ? (
          <p>You haven't saved any recipes yet.</p>
        ) : (
          <div className="saved-recipes">
            {savedPosts.map((post) => (
              <RecipeCard
                key={post._id}
                id={post._id}
                title={post.title}
                content={post.content}
                hasImage={Boolean(post.image?.contentType)}
                author={post.author}
                rating={post.rating}
                ratingCount={post.ratingCount}
                likes={post.likes}
                isOwner={post.isOwner}
                isSaved={post.isSaved}
                onDelete={onDeletePost}
                onSaveRecipe={onSavePost}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
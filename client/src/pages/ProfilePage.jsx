import './ProfilePage.css';
import RecipeCard from '../components/RecipeCard';


// temp info until we can read actual recipes users made
const sampleRecipes = [
  { id: 1, title: 'Apple', imageUrl: null, rating: 5, likes: 120 },
  { id: 2, title: 'Banana', imageUrl: null, rating: 5, likes: 87 },
  { id: 3, title: 'Orange', imageUrl: null, rating: 3, likes: 45 },
  { id: 4, title: 'Pear', imageUrl: null, rating: 2, likes: 230 },
];

// temp info until we can read actual user info
const sampleUser = {
  username: 'GordanChefMan',
  displayName: 'TheBigChef',
  bio: 'I like food',
  profilePicUrl: null,
};

function ProfilePage({ posts = [], loading, onDeletePost, onSavePost }) {
  const user = sampleUser;
  const recipes = sampleRecipes;

  const savedPosts = posts.filter((post) => post.isSaved);

  return (
    <div className="profile-wrapper">
      <div className="profile-avatar">
        {user.profilePicUrl && <img src={user.profilePicUrl} alt={user.username} />}
      </div>

      <h2>{user.displayName}</h2>
      <p className="profile-username">@{user.username}</p>
      <p>{user.bio}</p>
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

      {/* Saved Recipes */}
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
  );
}

export default ProfilePage;
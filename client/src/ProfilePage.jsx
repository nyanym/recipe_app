import './ProfilePage.css';
import RecipeCard from './RecipeCard';

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

function ProfilePage() {
  const user = sampleUser;
  const recipes = sampleRecipes;
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
    </div>
  );
}

export default ProfilePage;
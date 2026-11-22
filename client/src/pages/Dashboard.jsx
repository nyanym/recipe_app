import SearchBar from '../components/SearchBar';
import RecipeCard from '../components/RecipeCard';
import './Dashboard.css';


export default function DashboardPage({
  posts,
  loading,
  onSearch,
  onIngredientSearch,
  filtersActive,
  onDeletePost,
  onSavePost,
}) {
  const renderFeed = () => {
    if (loading) return <p>Loading recipes...</p>;
    if (posts.length === 0) {
      return (
        <p>
          {filtersActive
            ? 'No recipes match your search.'
            : 'No recipes found. Create one!'}
        </p>
      );
    }

    return posts.map((post) => (
      <RecipeCard
        key={post._id}
        id={post._id}
        title={post.title}
        content={post.content}
        hasImage={Boolean(post.image?.contentType)}
        onDelete={onDeletePost}
        author={post.author}
        isOwner={post.isOwner}
        isSaved={post.isSaved}
        rating={post.rating}
        ratingCount={post.ratingCount}
        onSaveRecipe={onSavePost}
      />
    ));
  };

  return (
    <>
      <header
        className="dashboard-header"
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}
      >
        <SearchBar onSearch={onSearch} placeholder="Search recipe titles..." />
        <SearchBar onSearch={onIngredientSearch} placeholder="Ingredients (flour, eggs)..." />
      </header>

      <h2>Card Title</h2>
      <div className="feed-card">{renderFeed()}</div>
    </>
  );
}
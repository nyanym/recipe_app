import SearchBar from '../components/SearchBar';
import RecipeCard from '../components/RecipeCard';
import './Dashboard.css';


export default function DashboardPage({ posts, loading, onSearch, onDeletePost }) {
  const renderFeed = () => {
    if (loading) return <p>Loading recipes...</p>;
    if (posts.length === 0) return <p>No recipes found. Create one!</p>;

    return posts.map((post) => (
      <RecipeCard
        key={post._id}
        id={post._id}
        title={post.title}
        content={post.content}
        hasImage={Boolean(post.image?.contentType)}
        onDelete={onDeletePost}
      />
    ));
  };

  return (
    <>
      <header className="dashboard-header">
        <SearchBar onSearch={onSearch} placeholder="Search users, items..." />
      </header>

      <h2>Card Title</h2>
      <div className="feed-card">{renderFeed()}</div>
    </>
  );
}
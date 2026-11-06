import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom';
// import heroImg from './assets/hero.png'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
import './App.css'

import SearchBar from './SearchBar';
import PostButton from './Post-btn';
import CreatePostPage from './CreatePostPage';
import RecipeCard from './RecipeCard';

// placeholder data until the feed fetches posts (posts have no image/author/rating yet)
const sampleRecipes = [
  { id: 1, title: 'Lemon Garlic Pasta', author: 'Alex', imageUrl: null, rating: 4, likes: 10000 },
  { id: 2, title: 'Spicy Tofu Stir-Fry', author: 'Sam', imageUrl: null, rating: 5, likes: 2400 },
  { id: 3, title: 'Banana Bread', author: 'Jordan', imageUrl: null, rating: 3, likes: 870 },
];

function App() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  // grab posts
  const fetchPosts = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/posts')
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching posts:', err);
        setLoading(false);
      });
  };

  // for sidebar
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  // SearchBar
  const handleSearch = (searchTerm) => {
    console.log('Searching for:', searchTerm);
  };

  // Create post
  const handleCreatePost = () => {
    navigate('/create-post');
    console.log('Post button clicked! Open modal or redirect to post creation page.');
  };

  return (
    <>
      <div className="app-container">
        {/* Conditionally apply the .open class based on state */}
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
          <div className="sidebar-content">

            <div className="sidebar-header">
              <div className="website">
                <span className="website-icon">🫨</span>
                <span className="website-name">Website Name</span>
              </div>

                <button onClick={toggleSidebar} className="toggle-btn">
                  {isOpen ? '✕' : '❯'}
                </button>
            </div>

            {/* side buttons */}
            <div className="nav-item" onClick={() => navigate('/')}>
              <span className="icon">📊</span>
              {isOpen && <span className="label">Dashboard</span>}
            </div>
            
            <div className="nav-item">
              <PostButton onClick={handleCreatePost} isCollapsed={!isOpen}/>
            </div>

            <div className="nav-item">
              <span className="icon">⚙️</span>
              {isOpen && <span className="label">Settings</span>}
            </div>
            <div className="nav-item">
              <span className="icon">👤</span>
              {isOpen && <span className="label">Profile</span>}
            </div>

          </div>
        </aside>

        <main className="main-content">
           <Routes>
             <Route
               path="/"
               element={
                 <>


                  <div style={{ padding: '.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <SearchBar onSearch={handleSearch} placeholder="Search users, items..." />
                    <button className="profile-btn">Profile</button>
                  </div>

                  <h2>Card Title</h2>
                  <div className="feed-card">
                    {loading ? (
                      <p>Loading recipes...</p>
                    ) : posts.length === 0 ? (
                      <p>No recipes found. Create one!</p>
                    ) : (
                      posts.map((post) => (
                        <RecipeCard key={post._id} title={post.title} content={post.content} />
                      ))
                    )}
                  </div>

               </>
             }
           />
           <Route 
            path="/create-post" 
            element={<CreatePostPage onPostCreated={fetchPosts} />} 
          />
        </Routes>

        </main>
      </div>
    </>
  )
}

export default App

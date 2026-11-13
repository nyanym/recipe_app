import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css'

import SearchBar from './SearchBar';
import PostButton from './Post-btn';
import CreatePostPage from './CreatePostPage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import RecipeCard from './RecipeCard';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // for logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Unable to log out. Please try again.');
    }
  };

  // for message
  const [posts, setPosts] = useState([]);       // posts
  const [loading, setLoading] = useState(true); // posts
  const [isOpen, setIsOpen] = useState(true);   // sidebar

  // search filters
  const [titleQuery, setTitleQuery] = useState('');           // matches title only
  const [ingredientQuery, setIngredientQuery] = useState(''); // "flour, eggs"
  const [refreshKey, setRefreshKey] = useState(0);            // bump to refetch

  // The search bars start empty, clears filters
  useEffect(() => {
    if (location.pathname === '/') {
      setTitleQuery('');
      setIngredientQuery('');
    }
  }, [location.pathname]);

  // grab posts whenever a filter changes (or a refresh is requested)
  useEffect(() => {
    let cancelled = false;

    const loadPosts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (titleQuery.trim()) params.set('search', titleQuery.trim());
        if (ingredientQuery.trim()) params.set('ingredient', ingredientQuery.trim());
        const queryString = params.toString();

        const res = await fetch(
          `http://localhost:5000/api/posts${queryString ? `?${queryString}` : ''}`
        );
        const data = await res.json();

        if (!cancelled) {
          setPosts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // wait a moment while typing so we don't send a request on every keystroke
    const noFilters = !titleQuery.trim() && !ingredientQuery.trim();
    const timer = setTimeout(loadPosts, noFilters ? 0 : 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [titleQuery, ingredientQuery, refreshKey]);

  // used by CreatePostPage (onPostCreated) to refresh the list
  const fetchPosts = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleDeletePost = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPosts((prevPosts) => prevPosts.filter((post) => post._id !== id));
      } else {
        const errorData = await res.json();
        alert(`Failed to delete: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  // SearchBar (title)
  const handleSearch = (searchTerm) => {
    setTitleQuery(searchTerm);
  };

  // SearchBar (ingredients, comma separated)
  const handleIngredientSearch = (ingredientTerm) => {
    setIngredientQuery(ingredientTerm);
  };

  // Create post
  const handleCreatePost = () => {
    navigate('/create-post');
    console.log('Post button clicked! Open modal or redirect to post creation page.');
  };

  const filtersActive = titleQuery.trim() !== '' || ingredientQuery.trim() !== '';

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
            {user && (
              <div>
                <p>Logged in as: {user.username}</p>
                <button onClick={handleLogout}>
                  Log Out
                </button>
              </div>
            )}

          </div>
        </aside>

        <main className="main-content">
           <Routes>
           
           <Route path="/signup" element={<Signup />} />
           <Route path="/login" element={<Login />} />

           <Route element={<ProtectedRoute />}>
           
               <Route
                path="/"
                element={
                  <>

                    <div style={{ padding: '.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <SearchBar onSearch={handleSearch} placeholder="Search recipe titles..." />
                      <SearchBar onSearch={handleIngredientSearch} placeholder="Ingredients (flour, eggs)..." />
                    </div>

                    <h2>Card Title</h2>
                    <div className="feed-card">
                      {loading ? (
                        <p>Loading recipes...</p>
                      ) : posts.length === 0 ? (
                        <p>
                          {filtersActive
                            ? 'No recipes match your search.'
                            : 'No recipes found. Create one!'}
                        </p>
                      ) : (
                        posts.map((post) => (
                          <RecipeCard 
                            key={post._id} 
                            id={post._id} 
                            title={post.title} 
                            content={post.content} 
                            onDelete={handleDeletePost} 
                          />
                        ))
                      )}
                    </div>
                  </>
                  }
                />
                <Route path="/create-post" element={<CreatePostPage onPostCreated={fetchPosts} />} />
           </Route>
         </Routes>
        </main>
      </div>
    </>
  );
}

export default App
import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css'

import CreatePostPage from './pages/CreatePostPage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';

// Added by Satvik
import RecipePage from './pages/RecipePage';

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

  // grab posts whenever a filter changes, a refresh is requested, or the user changes
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
          `http://localhost:5000/api/posts${queryString ? `?${queryString}` : ''}`,
          { credentials: 'include' }
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
  }, [titleQuery, ingredientQuery, refreshKey, user]);

  // used by CreatePostPage (onPostCreated) to refresh the list
  const fetchPosts = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleDeletePost = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Failed to delete: ${data.error}`);
        return;
      }

      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== id));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  // SearchBar (title)
  const handleSearch = (searchTerm) => {
    setTitleQuery(searchTerm);
  };

  // SearchBar (ingredients, comma separated)
  const handleIngredientSearch = (ingredientTerm) => {
    setIngredientQuery(ingredientTerm);
  };

  // save post
  const handleSavePost = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}/save`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to save post');
        return;
      }

      // flip isSaved in state immediately so the button updates without a reload
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === id ? { ...post, isSaved: data.saved } : post
        )
      );
    } catch (err) {
      console.error('Error saving post:', err);
    }
  }


  // Rate post
  const handleRatingChange = ({ postId, rating, ratingCount, myRating }) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? { ...post, rating, ratingCount, myRating } : post
      )
    );
  };

  // Create post
  const handleCreatePost = () => {
    navigate('/create-post');
    console.log('Post button clicked! Open modal or redirect to post creation page.');
  };

  const filtersActive = titleQuery.trim() !== '' || ingredientQuery.trim() !== '';

  return (
    <Routes>
      {/* Public routes without the sidebar */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* Protected routes with the sidebar layout */}
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <AppLayout
              user={user}
              onLogout={handleLogout}
              onCreatePost={handleCreatePost}
            />
          }
        >
          <Route
            path="/"
            element={
              <Dashboard
                posts={posts}
                loading={loading}
                onSearch={handleSearch}
                onIngredientSearch={handleIngredientSearch}
                filtersActive={filtersActive}
                onDeletePost={handleDeletePost}
                onSavePost={handleSavePost}
              />
            }
          />
          <Route
            path="/create-post"
            element={<CreatePostPage onPostCreated={fetchPosts} />}
          />
          <Route 
            path="/profile" 
            element={
              <ProfilePage 
                posts={posts}
                loading={loading}
                onDeletePost={handleDeletePost}
                onSavePost={handleSavePost}
              />
            }
          />
          <Route 
            path="/profile/edit" 
            element={<EditProfilePage 
            />} 
          />

          { /* Added by Satvik */}
          <Route
            path="/recipes/:id"
            element={<RecipePage 
              posts={posts} 
              loading={loading} 
              currentUser={user}
              onRatingChange={handleRatingChange}
            />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App
import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css'

import CreatePostPage from './pages/CreatePostPage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';

function App() {
  const navigate = useNavigate();
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

  // SearchBar
  const handleSearch = async (searchTerm) => {
    setLoading(true);
      try {
        // if input is empty, all posts
        if (!searchTerm.trim()) {
          fetchPosts();
          return;
        }

        // request posts from server
        const res = await fetch(`http://localhost:5000/api/posts?search=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();
        
        setPosts(data);
      } catch (err) {
        console.error('Error searching posts:', err);
      } finally {
        setLoading(false);
      }
  };

  // Create post
  const handleCreatePost = () => {
    navigate('/create-post');
    console.log('Post button clicked! Open modal or redirect to post creation page.');
  };

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
                onDeletePost={handleDeletePost}
              />
            }
          />
          <Route
            path="/create-post"
            element={<CreatePostPage onPostCreated={fetchPosts} />}
          />
          <Route 
            path="/profile" 
            element={<ProfilePage />} 
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App

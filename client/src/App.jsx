import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom';
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

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
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
                    {/* <div className="feed-card">

                      <div className="column-card">
                        <h3>Card 1</h3>
                        <p>Content for the first column.</p>
                      </div>

                      <div className="column-card">
                        <h3>Card 2</h3>
                        <p>Content for the second column.</p>
                      </div>

                      <div className="column-card">
                        <h3>Card 3</h3>
                        <p>Content for the third column.</p>
                      </div>
                    </div> */}

                  </>
                  }
                />

                <Route path="/create-post" element={<CreatePostPage />} />
           </Route>
         </Routes>
                  <h2>Card Title</h2>
                  <div className="feed-card">
                    {loading ? (
                      <p>Loading recipes...</p>
                    ) : posts.length === 0 ? (
                      <p>No recipes found. Create one!</p>
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

               {/* </>
             }
           />
           <Route 
            path="/create-post" 
            element={<CreatePostPage onPostCreated={fetchPosts} />} 
          />
        </Routes> */}

        </main>
      </div>
    </>
  );
}

export default App

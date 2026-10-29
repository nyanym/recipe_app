import { useEffect, useState } from 'react'
// import heroImg from './assets/hero.png'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
import './App.css'

import SearchBar from './SearchBar';

function App() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState('')
  
  // for message
  useEffect(() => {
    fetch('http://localhost:5000/api/message')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error(err));
  }, []);

  // for sidebar
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  // SearchBar
  const handleSearch = (searchTerm) => {
    console.log('Searching for:', searchTerm);
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
            <div className="nav-item">
              <span className="icon">📊</span>
              <span className="label">Dashboard</span>
            </div>
            <div className="nav-item">
              <span className="icon">⚙️</span>
              <span className="label">Settings</span>
            </div>
            <div className="nav-item">
              <span className="icon">👤</span>
              <span className="label">Profile</span>
            </div>

          </div>
        </aside>

        <main className="main-content">
          <div style={{ padding: '.5rem' }}>
            <SearchBar onSearch={handleSearch} placeholder="Search users, items..." />
          </div>

            <h2>Card Title</h2>
            <div className="feed-card">

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
              
            </div>

        </main>
      </div>
    </>
  )
}

export default App

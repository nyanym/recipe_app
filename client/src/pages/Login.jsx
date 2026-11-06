import { useState } from 'react';
import {Link, useNavigate } from 'react-router-dom';
import { useAuth } from '.../context/AuthContext';
import './Login.css';

function Login(){
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (page) => {
        page.preventDefault();
        setError('');

        try {
            const response = await fetch(
                'http://localhost:5000/api/auth/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'applciation/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({username, password}),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            setUser(data.user);
            navigate('/');
        }
        catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
        <h1>Login</h1>

        <form onSubmit={handleSubmit}>
            <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            />

            <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />

            {error && <p>{error}</p>}

            <button type="submit">
            Login
            </button>
        </form>

        <p>
            Don't have an account? 
            <Link to="/signup"> Sign up</Link>
        </p>
        </div>
    );

}

export default Login;
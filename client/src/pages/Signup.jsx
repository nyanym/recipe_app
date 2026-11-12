import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Signup.css';

function Signup(){
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (page) => {
        page.preventDefault();
        setError('');

        //Password validation on front-end as well
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

        if (!passwordRegex.test(password)){
            alert("Password does not meet requirements");
            return;
        }

        try {
            const response = await fetch(
                'http://localhost:5000/api/auth/signup',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ username, password }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            setUser(data.user);
            navigate('/');
        }
        catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="signup-container">
        <h1>Create Account</h1>

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

            <p>
            Password must have at least 8 characters,
            a letter, a number, and a special character.
            </p>

            <button type="submit">
            Sign Up
            </button>
        </form>

        <p>
            Already have an account?
            <Link to="/login"> Login</Link>
        </p>
        </div>
    );
}

export default Signup
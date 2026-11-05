import { useState } from 'react';
import './Login.css';

function Login(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (page) => {
        page.preventDefault();

        console.log(username, password);
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
            />

            <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">
            Login
            </button>
        </form>

        <p>
            Don't have an account? 
            <a href="/signup"> Sign up</a>
        </p>
        </div>
    );

}

export default Login;
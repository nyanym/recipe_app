import { useState } from 'react';
import './Signup.css';

function Signup(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (page) => {
        page.preventDefault();

        //Password validation on front-end as well
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

        if (!passwordRegex.test(password)){
            alert("Password does not meet requirements");
            return;
        }

        console.log(username, password);
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
            <a href="/login"> Login</a>
        </p>
        </div>
    );
}

export default Signup
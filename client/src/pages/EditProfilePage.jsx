import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function EditProfilePage() {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    const [displayName, setDisplayName] = useState(user.displayName || '');
    const [bio, setBio] = useState(user.bio || '');
    const [profilePicUrl, setProfilePicUrl] = useState(user.profilePicUrl || '');

    const handleSubmit = async (page) => {
        page.preventDefault();
        const response = await fetch('http://localhost:5000/api/auth/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ displayName, bio, profilePicUrl }),
        });

        const data = await response.json();

        setUser(data.user);
        navigate('/profile');
    };

    return (
        <div>
            <h1>Edit Profile</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Display name"
                    value={displayName}
                    onChange={(change) => setDisplayName(change.target.value)}
                />
                <button type="submit">Save</button>
            </form>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Bio"
                    value={bio}
                    onChange={(change) => setBio(change.target.value)}
                />
                <button type="submit">Save</button>
            </form>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Profile URL"
                    value={profilePicUrl}
                    onChange={(change) => setProfilePicUrl(change.target.value)}
                />
                <button type="submit">Save</button>
            </form>
        </div>
    )
}

export default EditProfilePage;
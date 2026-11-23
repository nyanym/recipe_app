import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function EditProfilePage() {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    const [displayName, setDisplayName] = useState(user.displayName || '');
    const [bio, setBio] = useState(user.bio || '');

    const [profilePic, setProfilePic] = useState(null);

    const handleSubmit = async (page) => {
        page.preventDefault();
        try {
            const formData = new FormData();
            formData.append('displayName', displayName.trim());
            formData.append('bio', bio.trim());
            if (profilePic) {
                formData.append('profilePic', profilePic);
            }

            const response = await fetch('http://localhost:5000/api/auth/me', {
                method: 'PUT',
                credentials: 'include',
                body: formData,
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
            throw new Error(data.error || `Server responded with ${response.status}`);
            }

            setUser(data.user || data);
            navigate('/profile');
        } catch (err) {
            console.error('Failed to update profile:', err);
            // setError(err.message);
        }
    };

    return (
        <div>
            <h1>Edit Profile</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        placeholder="Display name"
                        value={displayName}
                        onChange={(change) => setDisplayName(change.target.value)}
                    />
                </div>

                <div>
                    <input
                        type="text"
                        placeholder="Bio"
                        value={bio}
                        onChange={(change) => setBio(change.target.value)}
                    />
                </div>
                <label className="form-label">Profile Picture</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePic(e.target.files[0] || null)}
                    className="form-input"
                />
                <button type="submit">Save</button>
            </form>
        </div>
    )
}

export default EditProfilePage;
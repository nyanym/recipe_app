import './ProfilePage.css';

// temp info until we can read actual user info
const sampleUser = {
  username: 'GordanChefMan',
  displayName: 'TheBigChef',
  bio: 'I like food',
  profilePicUrl: null,
};

function ProfilePage() {
  const user = sampleUser;
  return (
    <div className="profile-wrapper">
      <div className="profile-avatar">
        {user.profilePicUrl && <img src={user.profilePicUrl} alt={user.username} />}
      </div>

      <h2>{user.displayName}</h2>
      <p className="profile-username">@{user.username}</p>
      <p>{user.bio}</p>
    </div>
  );
}

export default ProfilePage;
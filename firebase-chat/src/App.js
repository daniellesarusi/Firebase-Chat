import React, { useState } from 'react';
import ChatRoomList from './components/ChatRoomList';
import ChatRoom from './components/ChatRoom';
import ProfilePictureUpload from './components/ProfilePictureUpload';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showProfileUpload, setShowProfileUpload] = useState(false);
  const [userProfilePicture, setUserProfilePicture] = useState(null);
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Please enter a username.');
    }
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  const handleBackToRooms = () => {
    setSelectedRoom(null);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedRoom(null);
    setUsername('');
    setShowProfileUpload(false);
    setUserProfilePicture(null);
  };

  const handleProfileUpdate = (profilePictureUrl) => {
    setUserProfilePicture(profilePictureUrl);
    // Don't automatically close the profile screen
    // setShowProfileUpload(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>Firebase Chat</h1>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="username-input"
            />
            <div className="input-error" aria-live="polite">{loginError || '\u00A0'}</div>
            <button type="submit" className="login-button">
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {showProfileUpload ? (
        <div className="profile-upload-container">
          <button 
            onClick={() => setShowProfileUpload(false)}
            className="back-to-chat-btn"
          >
            ← Back to Chat
          </button>
          <ProfilePictureUpload 
            username={username}
            onProfileUpdate={handleProfileUpdate}
          />
        </div>
      ) : !selectedRoom ? (
        <ChatRoomList 
          onSelectRoom={handleRoomSelect} 
          username={username}
          onShowProfileUpload={() => setShowProfileUpload(true)}
          onLogout={handleLogout}
        />
      ) : (
        <ChatRoom 
          selectedRoom={selectedRoom}
          username={username}
          onBackToRooms={handleBackToRooms}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App; 
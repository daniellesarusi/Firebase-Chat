import React, { useEffect, useState } from 'react';
import './ChatRoomList.css';
import { ref as dbRef, onValue } from 'firebase/database';
import { database } from '../firebase';

const ChatRoomList = ({ onSelectRoom, username, onShowProfileUpload, onLogout }) => {
  const [profileUrl, setProfileUrl] = useState(null);

  useEffect(() => {
    if (!username) return;
    const userRef = dbRef(database, `users/${username}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setProfileUrl(data && data.profilePicture ? data.profilePicture : null);
    });
    return () => unsubscribe();
  }, [username]);
  // Hardcoded chat rooms
  const chatRooms = [
    {
      id: 'general',
      name: 'General Chat',
      description: 'General discussion and casual conversation',
      memberCount: 15,
      lastMessage: 'Welcome to the general chat room!'
    },
    {
      id: 'tech',
      name: 'Tech Talk',
      description: 'Technology discussions and programming help',
      memberCount: 8,
      lastMessage: 'Anyone working on React projects?'
    },
    {
      id: 'gaming',
      name: 'Gaming Zone',
      description: 'Video games, board games, and gaming news',
      memberCount: 12,
      lastMessage: 'What games are you playing this weekend?'
    },
    {
      id: 'music',
      name: 'Music Lovers',
      description: 'Share your favorite music and discover new artists',
      memberCount: 6,
      lastMessage: 'Check out this new album!'
    },
    {
      id: 'sports',
      name: 'Sports Central',
      description: 'All sports discussions and game updates',
      memberCount: 20,
      lastMessage: 'Great game last night!'
    }
  ];

  const handleRoomSelect = (room) => {
    onSelectRoom(room);
  };

  return (
    <div className="chat-room-list">
      <div className="room-list-header">
        {/* Left corner: profile picture action */}
        <div className="corner-left">
          <div className="profile-caption">To add/change profile picture</div>
          <button
            onClick={onShowProfileUpload}
            className="profile-circle-btn"
            aria-label="Add or change profile picture"
            title="Add/Change profile picture"
          >
            {profileUrl ? (
              <img src={profileUrl} alt="Profile" />
            ) : (
              <span role="img" aria-label="profile">👤</span>
            )}
          </button>
        </div>

        {/* Right corner: logout */}
        <div className="corner-right">
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>

        {/* Centered header */}
        <div className="header-content">
          <h1>Chat Rooms</h1>
          <p>Welcome, {username}! Select a room to join the conversation.</p>
        </div>
      </div>
      
      <div className="rooms-container">
        {chatRooms.map((room) => (
          <div 
            key={room.id} 
            className="room-card"
            onClick={() => handleRoomSelect(room)}
          >
            <div className="room-info">
              <h3 className="room-name">{room.name}</h3>
              <p className="room-description">{room.description}</p>
            </div>
            <div className="room-arrow">
              →
            </div>
          </div>
        ))}
      </div>
      
      <div className="room-list-footer">
        <p>More rooms coming soon!</p>
      </div>
    </div>
  );
};

export default ChatRoomList;

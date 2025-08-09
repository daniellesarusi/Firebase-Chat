import React, { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../firebase';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import './ChatRoom.css';

const ChatRoom = ({ selectedRoom, username, onBackToRooms, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState({});

  useEffect(() => {
    if (!selectedRoom) return;
    
    console.log(`Loading messages for room: ${selectedRoom.name}`);
    console.log('Selected room:', selectedRoom);
    setIsLoading(true);
    
    // Listen for new messages in the selected room
    const messagesRef = ref(database, `rooms/${selectedRoom.id}/messages`);
    console.log('Messages ref:', messagesRef);
    
    onValue(messagesRef, (snapshot) => {
      console.log('Firebase connection successful!');
      const data = snapshot.val();
      console.log('Raw data from Firebase:', data);
      if (data) {
        const messageList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setMessages(messageList);
        console.log('Messages loaded:', messageList.length);
      } else {
        console.log('No messages found');
        setMessages([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error loading messages:', error);
      console.error('Error details:', error.message, error.code);
      console.error('Full error:', error);
      alert('Firebase connection error. Please check your database rules.');
      setIsLoading(false);
    });

    // Cleanup listener on unmount
    return () => {
      off(ref(database, `rooms/${selectedRoom.id}/messages`));
    };
  }, [selectedRoom]);

  // Load user profiles
  useEffect(() => {
    const loadUserProfiles = async () => {
      try {
        const usersRef = ref(database, 'users');
        onValue(usersRef, (snapshot) => {
          const data = snapshot.val();
          console.log('User profiles loaded:', data);
          if (data) {
            setUserProfiles(data);
          }
        });
      } catch (error) {
        console.error('Error loading user profiles:', error);
      }
    };

    loadUserProfiles();
  }, []);

  const handleMessageSent = () => {
    console.log('Message sent callback triggered');
  };

  console.log('ChatRoom render state:', { isLoading, selectedRoom, messages: messages.length });
  
  if (isLoading) {
    console.log('Showing loading state');
    return (
      <div className="chat-room">
        <div className="chat-header">
          <div className="header-left">
            <button onClick={onBackToRooms} className="back-button">
              ← Back to Rooms
            </button>
            <h1>{selectedRoom.name}</h1>
          </div>
          <div className="header-right">
            <p>Welcome, {username}!</p>
            <button onClick={onLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-room">
      <div className="chat-header">
        <div className="header-left">
          <button onClick={onBackToRooms} className="back-button">
            ← Back to Rooms
          </button>
          <h1>{selectedRoom.name}</h1>
        </div>
        <div className="header-right">
          <p>Welcome, {username}!</p>
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
      
      <MessageList 
        messages={messages} 
        userProfiles={userProfiles} 
        username={username} 
      />
      
      <MessageInput 
        selectedRoom={selectedRoom}
        username={username}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
};

export default ChatRoom; 
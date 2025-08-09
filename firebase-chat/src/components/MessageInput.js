import React, { useState } from 'react';
import { ref, set } from 'firebase/database';
import { database } from '../firebase';
import './MessageInput.css';

const MessageInput = ({ selectedRoom, username, onMessageSent }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && username.trim() && selectedRoom) {
      try {
        console.log('Sending message:', { text: newMessage, username, room: selectedRoom.id });
        const now = new Date();
        const pad = (num) => String(num).padStart(2, '0');
        const timestampFormatted = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
        // Build a lexicographically sortable key: YYYY-MM-DD HH:MM:SS username
        const year = now.getFullYear();
        const month = pad(now.getMonth() + 1);
        const day = pad(now.getDate());
        const hours = pad(now.getHours());
        const minutes = pad(now.getMinutes());
        const seconds = pad(now.getSeconds());
        const keySortable = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${username}`;

        // Store only the text per your schema preference
        const payload = { text: newMessage };
        await set(ref(database, `rooms/${selectedRoom.id}/messages/${keySortable}`), payload);
        setNewMessage('');
        console.log('Message sent successfully!');
        if (onMessageSent) {
          onMessageSent();
        }
      } catch (error) {
        console.error('Error sending message:', error);
        console.error('Error details:', error.message, error.code);
        alert('Error sending message. Please check your Firebase configuration.');
      }
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="message-form">
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
        className="message-input"
        disabled={!selectedRoom}
      />
      <button
        type="submit"
        className="send-button"
        disabled={!newMessage.trim() || !selectedRoom}
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;

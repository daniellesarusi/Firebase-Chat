import React, { useEffect } from 'react';
import './MessageList.css';

const MessageList = ({ messages, userProfiles, username }) => {
  const scrollToBottom = () => {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="messages-container">
        <div className="no-messages">
          <p>No messages yet. Be the first to say something!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      {messages.map((message) => {
        // Messages may only contain { text }. Infer username/time from the message id (key)
        // Our key is: YYYY-MM-DD HH:MM:SS username
        const messageId = typeof message.id === 'string' ? message.id : '';
        let inferredUsername = message.username || '';
        let inferredTimeDisplay = message.timestampFormatted || '';
        if (!inferredUsername || !inferredTimeDisplay) {
          const tokens = messageId.split(' ').filter(Boolean);
          // Expect tokens: [YYYY-MM-DD, HH:MM:SS, username...]
          if (tokens.length >= 3) {
            const datePart = tokens[0];
            const timePart = tokens[1];
            inferredUsername = inferredUsername || tokens.slice(2).join(' ');
            // Convert YYYY-MM-DD to DD-MM-YYYY for display
            const [yyyy, MM, dd] = datePart.split('-');
            inferredTimeDisplay = `${timePart} ${dd}-${MM}-${yyyy}`;
          }
        }

        const isOwn = inferredUsername && username ? inferredUsername === username : false;

        const profile = (userProfiles && inferredUsername) ? userProfiles[inferredUsername] : undefined;
        const profilePicture = profile?.profilePicture;

        return (
          <div 
            key={message.id} 
            className={`message ${isOwn ? 'own-message' : ''}`}
          >
            <div className="message-content">
              <div className="message-profile-picture">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt={`${inferredUsername}'s profile`}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="default-avatar">
                    {(inferredUsername || '?').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="message-bubble">
                <div className="message-header">
                  <span className="username">{inferredUsername || 'Unknown'}</span>{' '}
                  {inferredTimeDisplay && (
                    <span className="timestamp">{inferredTimeDisplay}</span>
                  )}
                </div>
                <div className="message-text">{message.text}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;

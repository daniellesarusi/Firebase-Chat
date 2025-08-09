# Firebase Chat Application

A real-time chat application built with React and Firebase Realtime Database + Firebase Storage (for profile pictures).

## Features

- Real-time messaging using Firebase Realtime Database
- Join with a simple username (no auth)
- Profile picture upload via Firebase Storage (shown next to messages)
- Time-first message keys so messages are naturally ordered (oldest → newest)
- Modern, responsive UI design

## Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Realtime Database:
   - Go to "Realtime Database" in the left sidebar
   - Click "Create Database"
   - Choose a location (select the closest to your users)
   - Start in test mode (for development)

### 2. Get Firebase Configuration

1. In your Firebase project, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname
6. Copy the firebaseConfig object

### 3. Update Firebase Configuration

Replace the placeholder values in `src/firebase.js` with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

### 4. Enable Firebase Storage (for profile pictures)

1. In the Firebase Console, open Storage and click "Get Started"
2. For development, you can start in test mode
3. Optional dev storage rules (relax for local testing only):

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // DEV ONLY
    }
  }
}
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Start the Development Server

```bash
npm start
```

The application opens at `http://localhost:3001` (configured in the start script). If 3001 is busy, it will prompt to use the next port.

## Database Rules (DEV)

For development, you can use these test rules in your Firebase Realtime Database:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**Note:** These rules allow anyone to read and write to your database. For production, implement Firebase Authentication and restrictive rules.

## Project Structure

```
firebase-chat/
├── public/
│   └── index.html
├── src/
│   ├── App.js                      # App shell and routing between screens
│   ├── App.css                     # Global styles
│   ├── firebase.js                 # Firebase configuration (Database + Storage)
│   ├── index.js                    # React entry point
│   ├── index.css                   # Global styles
│   └── components/
│       ├── ChatRoom.js/.css        # Room view (message list + input)
│       ├── ChatRoomList.js/.css    # Rooms list screen
│       ├── MessageList.js/.css     # Message rendering
│       ├── MessageInput.js/.css    # Message form
│       └── ProfilePictureUpload.*  # Upload/manage user avatar
├── package.json
└── README.md
```

## How It Works

1. **Join**: Users enter a username to join.
2. **Profile**: Users can upload a profile picture to Firebase Storage; its URL is saved under their username.
3. **Messages**: Messages are written under each room with time-first keys so ordering is natural.
4. **Display**: The chat infers username and time from the key and shows the user’s avatar (if available) next to each message.

### Data Model

- Rooms messages (time-first, lexicographically sortable):

```
rooms/{roomId}/messages/{YYYY-MM-DD HH:MM:SS username} = { text: string }
```

- User profiles (for avatars):

```
users/{username} = {
  profilePicture: string | null, // download URL
  updatedAt?: number
}
```

Notes:
- The UI shows headers as `username HH:MM:SS DD-MM-YYYY` and renders the profile image if present.
- Because the key starts with the timestamp (YYYY-MM-DD HH:MM:SS), the Firebase console lists the oldest first and the newest last naturally.

## Current Configuration

Defaults in this repo:
- Port: `3001` (see `package.json` start script)
- Example Firebase project wired in `src/firebase.js` (replace with your own)

## Customization

- **Styling**: Modify `src/App.css` to change the appearance
- **Database Structure**: Update the database references in `src/App.js` to change how data is stored
- **Features**: Add features like user avatars, typing indicators, or message reactions

## Deployment

To deploy your chat application:

1. Build the project: `npm run build`
2. Deploy to Firebase Hosting:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   firebase deploy
   ```

## Security Considerations

- Implement proper Firebase Authentication for production use
- Set up appropriate database rules
- Consider rate limiting for message sending
- Validate user input on both client and server side

## Troubleshooting

- **Firebase connection issues**: Verify `src/firebase.js` keys and the database URL/storage bucket.
- **Database permission errors**: Ensure dev rules allow read/write; tighten for production.
- **Messages order**: Keys are `YYYY-MM-DD HH:MM:SS username`; lexicographic sort equals chronological order.
- **Avatars not showing**: Confirm `users/{username}/profilePicture` has a valid Storage download URL and Storage rules permit reads.

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm run build`: Builds the app for production
- `npm test`: Launches the test runner
- `npm run eject`: Ejects from Create React App (not recommended)

## License

This project is open source and available under the MIT License.

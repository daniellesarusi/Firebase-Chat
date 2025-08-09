import React, { useState, useRef, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { ref as dbRef, set, onValue } from 'firebase/database';
import { database, storage } from '../firebase';
import './ProfilePictureUpload.css';

const ProfilePictureUpload = ({ username, onProfileUpdate }) => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [existingProfilePicture, setExistingProfilePicture] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Load existing profile picture
  useEffect(() => {
    const loadExistingProfile = async () => {
      try {
        const userProfileRef = dbRef(database, `users/${username}`);
        onValue(userProfileRef, (snapshot) => {
          const data = snapshot.val();
          if (data && data.profilePicture) {
            setExistingProfilePicture(data.profilePicture);
          }
        });
      } catch (error) {
        console.error('Error loading existing profile:', error);
      }
    };

    if (username) {
      loadExistingProfile();
    }
  }, [username]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    console.log('File selected:', file);
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, GIF)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setError('');
      setProfilePicture(file);
      console.log('Profile picture set successfully');
    }
  };

  const handleUpload = async () => {
    if (!profilePicture || !username) {
      console.error('Missing profilePicture or username:', { profilePicture, username });
      return;
    }

    console.log('Starting Firebase Storage upload with:', {
      profilePicture: profilePicture.name,
      username,
      fileSize: profilePicture.size,
      fileType: profilePicture.type
    });

    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      // Use the original file name exactly as provided by the user
      const originalFileName = profilePicture.name;
      
      console.log('Original filename:', originalFileName);
      
      // Create storage reference in a per-user folder to avoid cross-user collisions
      const storageRef = ref(storage, `profile-pictures/${username}/${originalFileName}`);
      console.log('Storage ref created:', storageRef);
      
      setUploadProgress(25);
      
      // Upload to Firebase Storage
      console.log('Starting uploadBytes to Firebase Storage...');
      const snapshot = await uploadBytes(storageRef, profilePicture);
      console.log('Upload completed, snapshot:', snapshot);
      
      setUploadProgress(75);
      
      // Get download URL
      console.log('Getting download URL...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Download URL obtained:', downloadURL);

      // Update user profile in database
      console.log('Creating user profile ref...');
      const userProfileRef = dbRef(database, `users/${username}`);
      console.log('User profile ref created:', userProfileRef);
      
      console.log('Updating database with download URL');
      
      await set(userProfileRef, {
        profilePicture: downloadURL,
        updatedAt: Date.now()
      });
      
      console.log('Database update completed');

      setUploadProgress(100);
      
      // Notify parent component
      if (onProfileUpdate) {
        onProfileUpdate(downloadURL);
      }

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setProfilePicture(null);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Firebase Storage upload error:', error);
      console.error('Error details:', error.message, error.code);
      setError(`Upload failed: ${error.message}`);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemovePicture = async () => {
    try {
      console.log('Removing profile picture for user:', username);
      
      // First, get the current profile picture URL from database
      const userProfileRef = dbRef(database, `users/${username}`);
      
      // Get the current profile picture URL
      const snapshot = await new Promise((resolve, reject) => {
        onValue(userProfileRef, (snapshot) => {
          resolve(snapshot);
        }, { onlyOnce: true });
      });
      
      const userData = snapshot.val();
      const currentProfileUrl = userData?.profilePicture;
      
      console.log('Current profile URL:', currentProfileUrl);
      
      // If there's a profile picture URL, delete it from Firebase Storage
      if (currentProfileUrl && currentProfileUrl.startsWith('https://firebasestorage.googleapis.com/')) {
        try {
          // Extract the file path from the URL
          const urlParts = currentProfileUrl.split('/o/');
          if (urlParts.length > 1) {
            const filePath = decodeURIComponent(urlParts[1].split('?')[0]);
            console.log('File path to delete:', filePath);
            
            // Create a reference to the file in Storage
            const storageRef = ref(storage, filePath);
            
            // Delete the file from Firebase Storage
            await deleteObject(storageRef);
            console.log('File deleted from Firebase Storage');
          }
        } catch (storageError) {
          console.error('Error deleting from Storage:', storageError);
          // Continue with database update even if Storage deletion fails
        }
      }
      
      // Update database to remove profile picture reference
      await set(userProfileRef, {
        profilePicture: null,
        updatedAt: Date.now()
      });
      
      console.log('Database updated - profile picture removed');

      // Update local state
      if (onProfileUpdate) {
        onProfileUpdate(null);
      }

      setExistingProfilePicture(null);
      setProfilePicture(null);
      setError('');
      
      console.log('Profile picture removed successfully');
    } catch (error) {
      console.error('Remove error:', error);
      setError('Failed to remove profile picture.');
    }
  };

  return (
    <div className="profile-picture-upload">
      <h3>Profile Picture</h3>
      <p className="user-name">Welcome, {username}!</p>
      
      <div className="upload-section">
        {/* Show existing profile picture */}
        {existingProfilePicture && !profilePicture && (
          <div className="existing-profile-section">
            <h4>Current Profile Picture</h4>
            <div className="existing-profile-container">
              <img 
                src={existingProfilePicture} 
                alt="Current Profile" 
                className="existing-profile-image"
                onError={(e) => {
                  console.error('Failed to load existing profile picture');
                  e.target.style.display = 'none';
                }}
              />
              <button 
                className="remove-btn-small"
                onClick={handleRemovePicture}
                title="Remove current profile picture"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="file-input-container">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="file-input"
            disabled={isUploading}
          />
          <button 
            className="select-file-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {profilePicture ? 'Change Picture' : 'Select New Picture'}
          </button>
        </div>

        {profilePicture && (
          <div className="preview-section">
            <h4>New Picture Preview</h4>
            <img 
              src={URL.createObjectURL(profilePicture)} 
              alt="Preview" 
              className="preview-image"
            />
            <div className="file-info">
              <p>{profilePicture.name}</p>
              <p>{(profilePicture.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {isUploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p>Uploading... {uploadProgress}%</p>
          </div>
        )}

        <div className="upload-actions">
          {profilePicture && !isUploading && (
            <button 
              className="upload-btn"
              onClick={handleUpload}
            >
              Upload Picture
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureUpload; 
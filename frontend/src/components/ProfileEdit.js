
import React, { useState, useRef } from 'react';
import { authAPI } from '../services/api';
import '../styles/ProfileEdit.css';

const ProfileEdit = ({ user, onClose, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [previewAvatar, setPreviewAvatar] = useState(user.avatar || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress image if too large
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize if larger than 500x500
          if (width > 500 || height > 500) {
            const ratio = Math.min(500 / width, 500 / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          
          const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
          setPreviewAvatar(compressedImage);
          setAvatar(compressedImage);
          setError('');
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    if (!name.trim()) {
      setError('Name cannot be empty');
      setLoading(false);
      return;
    }

    if (name.length > 50) {
      setError('Name must be less than 50 characters');
      setLoading(false);
      return;
    }

    try {
      await authAPI.updateProfile({ name, avatar });
      setSuccess('Profile updated successfully!');
      setError('');
      
      setTimeout(() => {
        onUpdate({ ...user, name, avatar });
        onClose();
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update profile';
      setError(errorMessage);
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetAvatar = () => {
    setPreviewAvatar('');
    setAvatar('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h2>Edit Profile</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="profile-modal-content">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Avatar Section */}
          <div className="avatar-section">
            <div className="avatar-preview">
              {previewAvatar ? (
                <img src={previewAvatar} alt="Preview" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  <span className="avatar-icon">👤</span>
                </div>
              )}
            </div>

            <div className="avatar-controls">
              <button
                className="btn btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                📷 Upload Photo
              </button>
              {previewAvatar && (
                <button
                  className="btn btn-tertiary"
                  onClick={handleResetAvatar}
                  disabled={loading}
                >
                  ✕ Remove
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              <small className="avatar-hint">JPG, PNG, GIF up to 5MB</small>
            </div>
          </div>

          <div className="divider"></div>

          {/* Name Section */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              maxLength="50"
              disabled={loading}
              className="form-input"
            />
            <small className="char-count">{name.length}/50</small>
          </div>

          {/* Email (Read-only) */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="form-input form-input-disabled"
            />
            <small className="email-hint">Email cannot be changed</small>
          </div>
        </div>

        <div className="profile-modal-footer">
          <button
            className="btn btn-outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;

import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import config from './config';
import { authAPI, chatAPI } from './services/api';
import ProfileEdit from './components/ProfileEdit';

const BOT_AVATAR = "https://api.dicebear.com/7.x/bottts/svg?seed=Ollama";

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      // Verify token is still valid
      authAPI.getMe()
        .then((data) => {
          setCurrentUser(data.user);
          setIsLoggedIn(true);
        })
        .catch(() => {
          // Token invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowLanding(true);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <h1>PSAI</h1>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isLoggedIn) {
    if (showLanding) {
      return (
        <LandingPage
          onLoginClick={() => { setAuthMode('login'); setShowLanding(false); }}
          onSignupClick={() => { setAuthMode('signup'); setShowLanding(false); }}
        />
      );
    }
    return (
      <AuthScreen
        authMode={authMode}
        setAuthMode={setAuthMode}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <ChatApp
      currentUser={currentUser}
      onLogout={handleLogout}
      onUpdateUser={setCurrentUser}
      botAvatar={BOT_AVATAR}
    />
  );
}

function AuthScreen({ authMode, setAuthMode, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const data = await authAPI.login(email, password);
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters!');
      return;
    }

    setLoading(true);

    try {
      await authAPI.register(name, email, password);
      setSuccess('Account created successfully! Please login.');
      setTimeout(() => {
        setAuthMode('login');
        setSuccess('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setLoading(true);

    try {
      const data = await authAPI.forgotPassword(email);
      setSuccess(data.message);
      setShowResetForm(true);
      setCodeVerified(false);
      setResetCode('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process forgot password request.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');

    if (!resetCode) {
      setError('Please enter the reset code from your email');
      return;
    }

    if (resetCode.length !== 6) {
      setError('Reset code must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      await authAPI.verifyResetCode(email, resetCode);
      setCodeVerified(true);
      setSuccess('Code verified! Now enter your new password.');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid reset code. Please try again.');
      setCodeVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setSuccess('');

    if (!resetCode || !newPassword || !confirmNewPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const data = await authAPI.resetPassword(email, resetCode, newPassword);
      setSuccess(data.message);
      setTimeout(() => {
        setAuthMode('login');
        setShowResetForm(false);
        setCodeVerified(false);
        setSuccess('');
        setEmail('');
        setResetCode('');
        setNewPassword('');
        setConfirmNewPassword('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      if (authMode === 'login') handleLogin();
      else if (authMode === 'signup') handleSignup();
      else if (authMode === 'forgot') {
        if (showResetForm) handleResetPassword();
        else handleForgotPassword();
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>PSAI Chatbot</h1>

        {authMode === 'login' && (
          <div className="auth-form">
            <h2>Login</h2>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <button onClick={handleLogin} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="auth-links">
              <button onClick={() => setAuthMode('signup')} disabled={loading}>
                Create Account
              </button>
              <button onClick={() => setAuthMode('forgot')} disabled={loading}>
                Forgot Password?
              </button>
            </div>
          </div>
        )}

        {authMode === 'signup' && (
          <div className="auth-form">
            <h2>Create Account</h2>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <button onClick={handleSignup} disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>

            <div className="auth-links">
              <button onClick={() => setAuthMode('login')} disabled={loading}>
                Already have an account? Login
              </button>
            </div>
          </div>
        )}

        {authMode === 'forgot' && (
          <div className="auth-form">
            <h2>Forgot Password</h2>
            {error && <div className="error">{error}</div>}
            {success && <div className="success" style={{whiteSpace: 'pre-wrap'}}>{success}</div>}

            {!showResetForm ? (
              <>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
                <button onClick={handleForgotPassword} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </>
            ) : !codeVerified ? (
              <>
                <p style={{textAlign: 'center', color: '#666', marginBottom: '20px'}}>
                  We've sent a 6-digit code to your email. Enter it below.
                </p>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength="6"
                  disabled={loading}
                  style={{textAlign: 'center', fontSize: '20px', letterSpacing: '5px'}}
                />
                <button onClick={handleVerifyCode} disabled={loading || resetCode.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </>
            ) : (
              <>
                <input
                  type="password"
                  placeholder="New Password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
                <input
                  type="password"
                  placeholder="Re-enter Password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
                <button onClick={handleResetPassword} disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </>
            )}

            <div className="auth-links">
              <button onClick={() => {
                setAuthMode('login');
                setShowResetForm(false);
                setCodeVerified(false);
                setError('');
                setSuccess('');
                setResetCode('');
                setNewPassword('');
                setConfirmNewPassword('');
              }} disabled={loading}>
                Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatApp({ currentUser, onLogout, onUpdateUser, botAvatar }) {
  // Dark mode is always enabled as per design system
  const darkMode = true;

  const [activeSession, setActiveSession] = useState('default');
  const [sessions, setSessions] = useState(['default']);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const chatBoxRef = useRef(null);
  const profileMenuRef = useRef(null);
  const sessionsRef = useRef(null);

  // Load sessions and messages on mount
  useEffect(() => {
    loadSessions();
    loadMessages('default');
  }, []);

  // Load messages when session changes
  useEffect(() => {
    if (activeSession) {
      loadMessages(activeSession);
    }
  }, [activeSession]);

  // Save messages to backend when they change
  useEffect(() => {
    if (messages.length > 0 && activeSession) {
      const saveMessagesAsync = async () => {
        try {
          await chatAPI.saveMessages(activeSession, messages);
        } catch (err) {
          console.error('Failed to save messages:', err);
        }
      };
      saveMessagesAsync();
    }
  }, [messages, activeSession]);

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (sessionsRef.current && !sessionsRef.current.contains(event.target)) {
        setShowSessions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadSessions = async () => {
    try {
      const data = await chatAPI.getSessions();
      setSessions(data.sessions || ['default']);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  const loadMessages = async (sessionName) => {
    setLoadingMessages(true);
    try {
      const data = await chatAPI.getMessages(sessionName);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const PSAI_API_KEY = config.API_KEY;
  const PSAI_API_URL = config.API_URL;
  const MODEL = config.MODEL;

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (!PSAI_API_KEY || PSAI_API_KEY === 'your-openrouter-api-key') {
      const errTs = new Date().toISOString();
      const errMessages = [...messages, { type: 'user', text: input.trim(), timestamp: new Date().toISOString() }, { type: 'bot', text: 'Error: OpenRouter API key not configured. Add REACT_APP_EXTERNAL_API_KEY to frontend .env (or .env.local) and restart the app.', timestamp: errTs }];
      setMessages(errMessages);
      setInput('');
      return;
    }

    const userMessage = input.trim();
    const timestamp = new Date().toISOString();
    const newMessages = [...messages, { type: 'user', text: userMessage, timestamp }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // OpenRouter API uses OpenAI-compatible format
      const payload = {
        model: MODEL,
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
      };

      const response = await fetch(PSAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PSAI_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'PSAI Chatbot',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`API returned invalid JSON. Status: ${response.status}`);
      }

      let botMessage = 'Sorry, I could not process your request. Please try again.';

      if (response.ok) {
        // OpenRouter API response format (OpenAI-compatible)
        if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
          const choice = data.choices[0];
          if (choice.message && choice.message.content) {
            botMessage = choice.message.content;
          }
        } else if (data.error) {
          botMessage = `Error: ${data.error.message || 'Unknown error'}`;
        }
      } else {
        const errMsg = data.error?.message || (typeof data.message === 'string' ? data.message : null);
        // OpenRouter 401 often means invalid/missing API key (sometimes reported as cookie auth)
        if (response.status === 401 && !PSAI_API_KEY) {
          botMessage = 'Error: OpenRouter API key missing. Set REACT_APP_EXTERNAL_API_KEY in frontend .env';
        } else {
          botMessage = errMsg || `Error: ${response.status}`;
        }
      }

      const botTimestamp = new Date().toISOString();
      const updatedMessages = [...newMessages, { type: 'bot', text: botMessage, timestamp: botTimestamp }];
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error details:', error);
      const errorMsg = `Network error: ${error.message}`;
      const errorTimestamp = new Date().toISOString();
      const updatedMessages = [...newMessages, { type: 'bot', text: errorMsg, timestamp: errorTimestamp }];
      setMessages(updatedMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogoutClick = () => {
    setShowProfileMenu(false);
    onLogout();
  };

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear chat history?')) {
      try {
        await chatAPI.clearChat(activeSession);
        setMessages([]);
        setShowProfileMenu(false);
      } catch (err) {
        console.error('Failed to clear chat:', err);
        alert('Failed to clear chat. Please try again.');
      }
    }
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      const notification = document.createElement('div');
      notification.textContent = 'Copied!';
      notification.className = 'copy-notification';
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 2000);
    });
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const exportChat = (format = 'txt') => {
    let content = '';
    if (format === 'txt') {
      content = messages.map(msg => {
        const sender = msg.type === 'user' ? currentUser.name : 'Bot';
        const time = msg.timestamp ? formatTimestamp(msg.timestamp) : '';
        return `[${sender}] (${time}): ${msg.text}`;
      }).join('\n\n');
    } else {
      content = JSON.stringify(messages, null, 2);
    }

    const blob = new Blob([content], { type: format === 'txt' ? 'text/plain' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_${activeSession}_${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const createNewSession = async () => {
    const sessionName = prompt('Enter session name:');
    if (sessionName && sessionName.trim()) {
      const trimmedName = sessionName.trim();
      if (!sessions.includes(trimmedName)) {
        try {
          await chatAPI.createSession(trimmedName);
          const newSessions = [...sessions, trimmedName];
          setSessions(newSessions);
          setActiveSession(trimmedName);
          setMessages([]);
        } catch (err) {
          alert(err.response?.data?.error || 'Failed to create session. Please try again.');
        }
      } else {
        alert('Session name already exists!');
      }
    }
  };

  const switchSession = (sessionName) => {
    setActiveSession(sessionName);
    setShowSessions(false);
  };

  const deleteSession = async (sessionName) => {
    if (sessionName === 'default') {
      alert('Cannot delete default session!');
      return;
    }
    if (window.confirm(`Delete session "${sessionName}"?`)) {
      try {
        await chatAPI.deleteSession(sessionName);
        const newSessions = sessions.filter(s => s !== sessionName);
        setSessions(newSessions);
        if (activeSession === sessionName) {
          setActiveSession('default');
        }
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete session. Please try again.');
      }
    }
  };

  const filteredMessages = searchQuery
    ? messages.filter(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div className="chat-container">
      {/* ── SIDEBAR ── */}
      <aside className="chat-sidebar">
        <div className="sidebar-logo">PSAI</div>

        {/* New Chat */}
        <button className="sidebar-new-chat" onClick={createNewSession}>
          ＋ New Chat
        </button>

        {/* Search toggle */}
        <button
          className="sidebar-item"
          onClick={() => setShowSearch(!showSearch)}
        >
          🔍 Search
        </button>

        {/* Sessions list */}
        <div className="sidebar-section-label">Sessions</div>
        <div className="sidebar-sessions" ref={sessionsRef}>
          {sessions.map(session => (
            <div
              key={session}
              className={`sidebar-session-item ${session === activeSession ? 'active' : ''}`}
            >
              <button
                className="sidebar-session-name"
                onClick={() => switchSession(session)}
              >
                💬 {session}
              </button>
              {session !== 'default' && (
                <button
                  className="sidebar-session-delete"
                  onClick={() => deleteSession(session)}
                  title="Delete session"
                >
                  🗑
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer: user profile */}
        <div className="sidebar-footer">
          <div className="profile-menu-divider" style={{ marginBottom: 12 }} />
          <div ref={profileMenuRef} style={{ position: 'relative' }}>
            <button
              className="sidebar-user"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="sidebar-avatar" />
              ) : (
                <div className="sidebar-avatar">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : '?'}
                </div>
              )}
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{currentUser.name}</div>
                <div className="sidebar-user-email">{currentUser.email}</div>
              </div>
            </button>

            {showProfileMenu && (
              <div className="profile-menu" style={{ bottom: 'calc(100% + 8px)', top: 'auto' }}>
                <div className="profile-menu-header">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="profile-menu-avatar-img" />
                  ) : (
                    <div className="profile-avatar">
                      {currentUser.name ? currentUser.name[0].toUpperCase() : '?'}
                    </div>
                  )}
                  <div className="profile-details">
                    <p className="profile-name">{currentUser.name}</p>
                    <p className="profile-email">{currentUser.email}</p>
                  </div>
                </div>
                <div className="profile-menu-divider" />
                <button
                  onClick={() => { setShowProfileEdit(true); setShowProfileMenu(false); }}
                  className="profile-menu-item"
                >✏️ Edit Profile</button>
                <button onClick={() => exportChat('txt')} className="profile-menu-item">📄 Export TXT</button>
                <button onClick={() => exportChat('json')} className="profile-menu-item">📋 Export JSON</button>
                <div className="profile-menu-divider" />
                <button onClick={handleClearChat} className="profile-menu-item clear-item">🗑️ Clear History</button>
                <button onClick={handleLogoutClick} className="profile-menu-item logout-item">🚪 Logout</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN CHAT ── */}
      <div className="chat-main">
        {/* Header */}
        <div className="chat-header">
          <div className="header-left">
            <h2>💬 {activeSession}</h2>
          </div>
          <div className="header-right">
            <button
              className="header-icon-btn"
              onClick={() => setShowSearch(!showSearch)}
              title="Search messages"
            >🔍</button>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              autoFocus
            />
            <button
              className="search-close-btn"
              onClick={() => { setShowSearch(false); setSearchQuery(''); }}
            >✕</button>
          </div>
        )}

        {/* Messages */}
        <div className="chat-box" ref={chatBoxRef}>
          {loadingMessages && messages.length === 0 && (
            <div className="welcome-message"><p>Loading messages…</p></div>
          )}
          {!loadingMessages && messages.length === 0 && (
            <div className="welcome-message">
              <h3>👋 Hi {currentUser.name}!</h3>
              <p>How can I help you today?</p>
            </div>
          )}
          {filteredMessages.length === 0 && searchQuery && messages.length > 0 && (
            <div className="no-results">
              <p>No messages found matching &quot;{searchQuery}&quot;</p>
            </div>
          )}
          {filteredMessages.map((msg, i) => (
            <div key={i} className={`message ${msg.type}`}>
              {msg.type === 'bot' && (
                <img src={botAvatar} alt="Bot" className="avatar" />
              )}
              <div className="message-content">
                <div className="message-text">{msg.text}</div>
                <div className="message-footer">
                  <span className="message-timestamp">{formatTimestamp(msg.timestamp)}</span>
                  <button
                    className="copy-btn"
                    onClick={() => copyMessage(msg.text)}
                    title="Copy"
                  >📋</button>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="message bot">
              <img src={botAvatar} alt="Bot" className="avatar" />
              <div className="message-text typing">
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask PSAI anything…"
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()}>
            {loading ? '⏳ Sending…' : 'Send ➤'}
          </button>
        </div>
      </div>

      {/* Profile edit modal */}
      {showProfileEdit && (
        <ProfileEdit
          user={currentUser}
          onClose={() => setShowProfileEdit(false)}
          onUpdate={(updatedUser) => {
            onUpdateUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }}
        />
      )}
    </div>
  );
}

export default App;

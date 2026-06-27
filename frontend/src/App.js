import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './App.css';
import LandingPage from './components/LandingPage';
import config from './config';
import { authAPI, chatAPI } from './services/api';
import ProfileEdit from './components/ProfileEdit';

const BOT_AVATAR = "https://api.dicebear.com/7.x/bottts/svg?seed=Ollama";

// ─── Starter Templates ────────────────────────────────────────────────────────
const STARTER_TEMPLATES = [
  {
    icon: '🌐',
    title: 'Build a Landing Page',
    prompt: 'Create a beautiful neon-themed landing page using HTML, CSS, and JavaScript with smooth animations and a dark background.',
  },
  {
    icon: '⚛️',
    title: 'React Component',
    prompt: 'Write a React functional component for a responsive card grid that displays product items with hover effects.',
  },
  {
    icon: '✨',
    title: 'CSS Animation',
    prompt: 'Create a stunning CSS animation of a glowing pulsing button with neon purple color using HTML and CSS only.',
  },
  {
    icon: '🤖',
    title: 'Explain AI Concepts',
    prompt: 'Explain what large language models are, how they work, and what makes them powerful. Use simple language with examples.',
  },
];

// ─── Web-previewable languages ─────────────────────────────────────────────────
const PREVIEWABLE_LANGS = new Set(['html', 'css', 'javascript', 'js', 'jsx', 'react', 'tsx', 'ts']);

// ─── Utility: extract first code block from a markdown string ─────────────────
function extractCodeBlock(text) {
  const match = text.match(/```([\w+-]*)\n?([\s\S]*?)```/);
  if (!match) return null;
  const lang = (match[1] || 'text').toLowerCase().trim();
  const code = match[2].trim();
  return { lang, code };
}

// ─── App root ─────────────────────────────────────────────────────────────────
function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      authAPI.getMe()
        .then((data) => { setCurrentUser(data.user); setIsLoggedIn(true); })
        .catch(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); })
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

// ─── Auth Screen ──────────────────────────────────────────────────────────────
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
    if (password !== confirmPassword) { setError('Passwords do not match!'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters!'); return; }
    setLoading(true);
    try {
      await authAPI.register(name, email, password);
      setSuccess('Account created successfully! Please login.');
      setTimeout(() => {
        setAuthMode('login'); setSuccess(''); setEmail(''); setPassword(''); setConfirmPassword(''); setName('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(''); setLoading(true);
    try {
      const data = await authAPI.forgotPassword(email);
      setSuccess(data.message); setShowResetForm(true); setCodeVerified(false);
      setResetCode(''); setNewPassword(''); setConfirmNewPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process forgot password request.');
    } finally { setLoading(false); }
  };

  const handleVerifyCode = async () => {
    setError('');
    if (!resetCode) { setError('Please enter the reset code from your email'); return; }
    if (resetCode.length !== 6) { setError('Reset code must be 6 digits'); return; }
    setLoading(true);
    try {
      await authAPI.verifyResetCode(email, resetCode);
      setCodeVerified(true); setSuccess('Code verified! Now enter your new password.'); setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid reset code. Please try again.'); setCodeVerified(false);
    } finally { setLoading(false); }
  };

  const handleResetPassword = async () => {
    setError(''); setSuccess('');
    if (!resetCode || !newPassword || !confirmNewPassword) { setError('All fields are required'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmNewPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const data = await authAPI.resetPassword(email, resetCode, newPassword);
      setSuccess(data.message);
      setTimeout(() => {
        setAuthMode('login'); setShowResetForm(false); setCodeVerified(false);
        setSuccess(''); setEmail(''); setResetCode(''); setNewPassword(''); setConfirmNewPassword('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally { setLoading(false); }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      if (authMode === 'login') handleLogin();
      else if (authMode === 'signup') handleSignup();
      else if (authMode === 'forgot') { if (showResetForm) handleResetPassword(); else handleForgotPassword(); }
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
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyPress={handleKeyPress} disabled={loading} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={handleKeyPress} disabled={loading} />
            <button onClick={handleLogin} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
            <div className="auth-links">
              <button onClick={() => setAuthMode('signup')} disabled={loading}>Create Account</button>
              <button onClick={() => setAuthMode('forgot')} disabled={loading}>Forgot Password?</button>
            </div>
          </div>
        )}

        {authMode === 'signup' && (
          <div className="auth-form">
            <h2>Create Account</h2>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} onKeyPress={handleKeyPress} disabled={loading} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyPress={handleKeyPress} disabled={loading} />
            <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={handleKeyPress} disabled={loading} />
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyPress={handleKeyPress} disabled={loading} />
            <button onClick={handleSignup} disabled={loading}>{loading ? 'Creating account...' : 'Sign Up'}</button>
            <div className="auth-links">
              <button onClick={() => setAuthMode('login')} disabled={loading}>Already have an account? Login</button>
            </div>
          </div>
        )}

        {authMode === 'forgot' && (
          <div className="auth-form">
            <h2>Forgot Password</h2>
            {error && <div className="error">{error}</div>}
            {success && <div className="success" style={{ whiteSpace: 'pre-wrap' }}>{success}</div>}
            {!showResetForm ? (
              <>
                <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyPress={handleKeyPress} disabled={loading} />
                <button onClick={handleForgotPassword} disabled={loading}>{loading ? 'Sending...' : 'Send Reset Code'}</button>
              </>
            ) : !codeVerified ? (
              <>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>We've sent a 6-digit code to your email. Enter it below.</p>
                <input type="text" placeholder="Enter 6-digit code" value={resetCode} onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength="6" disabled={loading} style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '5px' }} />
                <button onClick={handleVerifyCode} disabled={loading || resetCode.length !== 6}>{loading ? 'Verifying...' : 'Verify Code'}</button>
              </>
            ) : (
              <>
                <input type="password" placeholder="New Password (min 6 characters)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={loading} />
                <input type="password" placeholder="Re-enter Password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} onKeyPress={handleKeyPress} disabled={loading} />
                <button onClick={handleResetPassword} disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
              </>
            )}
            <div className="auth-links">
              <button onClick={() => { setAuthMode('login'); setShowResetForm(false); setCodeVerified(false); setError(''); setSuccess(''); setResetCode(''); setNewPassword(''); setConfirmNewPassword(''); }} disabled={loading}>Back to Login</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Chat App ─────────────────────────────────────────────────────────────────
function ChatApp({ currentUser, onLogout, onUpdateUser, botAvatar }) {
  const darkMode = true;

  const [activeSession, setActiveSession] = useState('default');
  const [sessions, setSessions] = useState(['default']);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // ── Workspace panel state ──────────────────────────────────────────────────
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState('preview');
  const [activeFile, setActiveFile] = useState(null); // { name, code, lang }

  // ── Session aliases (frontend-only renaming) ───────────────────────────────
  const [sessionAliases, setSessionAliases] = useState(() => {
    try { return JSON.parse(localStorage.getItem('psai_session_aliases') || '{}'); }
    catch { return {}; }
  });
  const [renamingSession, setRenamingSession] = useState(null);
  const [renameInput, setRenameInput] = useState('');

  // Refs
  const chatBoxRef = useRef(null);
  const profileMenuRef = useRef(null);
  const textareaRef = useRef(null);

  // ── On mount ──────────────────────────────────────────────────────────────
  useEffect(() => { loadSessions(); loadMessages('default'); }, []);
  useEffect(() => { if (activeSession) loadMessages(activeSession); }, [activeSession]);
  useEffect(() => {
    if (messages.length > 0 && activeSession) {
      chatAPI.saveMessages(activeSession, messages).catch((err) => console.error('Failed to save messages:', err));
    }
  }, [messages, activeSession]);

  useEffect(() => {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'true');
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Reactive code extraction from last bot message ────────────────────────
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.type !== 'bot') return;
    const extracted = extractCodeBlock(lastMsg.text);
    if (extracted) {
      setActiveFile({
        name: `app.${extracted.lang === 'javascript' || extracted.lang === 'js' ? 'js' : extracted.lang}`,
        code: extracted.code,
        lang: extracted.lang,
      });
      if (window.innerWidth > 1024) setWorkspaceOpen(true);
    }
  }, [messages]);

  // ── Auto-resize textarea ──────────────────────────────────────────────────
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  // ── API helpers ───────────────────────────────────────────────────────────
  const loadSessions = async () => {
    try {
      const data = await chatAPI.getSessions();
      setSessions(data.sessions || ['default']);
    } catch (err) { console.error('Failed to load sessions:', err); }
  };

  const loadMessages = async (sessionName) => {
    setLoadingMessages(true);
    try {
      const data = await chatAPI.getMessages(sessionName);
      setMessages(data.messages || []);
    } catch (err) { console.error('Failed to load messages:', err); setMessages([]); }
    finally { setLoadingMessages(false); }
  };

  const PSAI_API_KEY = config.API_KEY;
  const PSAI_API_URL = config.API_URL;
  const MODEL = config.MODEL;

  // ── Send message ────────────────────────────────────────
  const sendMessage = async (overrideText) => {
    const text = (overrideText !== undefined ? overrideText : input).trim();
    if (!text) return;

    const userMessage = text;
    const timestamp = new Date().toISOString();
    const newMessages = [...messages, { type: 'user', text: userMessage, timestamp }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const messagesPayload = [{ role: 'user', content: userMessage }];
      const data = await chatAPI.generateResponse(messagesPayload);

      let botMessage = 'Sorry, I could not process your request. Please try again.';
      if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
        const choice = data.choices[0];
        if (choice.message && choice.message.content) botMessage = choice.message.content;
      } else if (data.error) {
        botMessage = `Error: ${data.error.message || data.error || 'Unknown error'}`;
      }

      const botTimestamp = new Date().toISOString();
      setMessages([...newMessages, { type: 'bot', text: botMessage, timestamp: botTimestamp }]);
    } catch (error) {
      console.error('Error details:', error);
      let errMsg = error.response?.data?.error || error.message;
      if (error.response?.status === 404) {
        errMsg = 'AI service is temporarily unavailable. Please try again in a moment.';
      } else if (error.response?.status === 500) {
        errMsg = 'Server error. Please try again in a moment.';
      } else if (error.code === 'ECONNABORTED') {
        errMsg = 'Request timed out. Please check your connection and try again.';
      }
      setMessages([...newMessages, { type: 'bot', text: `⚠️ ${errMsg}`, timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleLogoutClick = () => { setShowProfileMenu(false); onLogout(); };

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear chat history?')) {
      try {
        await chatAPI.clearChat(activeSession);
        setMessages([]);
        setShowProfileMenu(false);
        setActiveFile(null);
        setWorkspaceOpen(false);
      } catch (err) { console.error('Failed to clear chat:', err); alert('Failed to clear chat. Please try again.'); }
    }
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
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const createNewSession = async () => {
    const sessionName = prompt('Enter session name:');
    if (sessionName && sessionName.trim()) {
      const trimmedName = sessionName.trim();
      if (!sessions.includes(trimmedName)) {
        try {
          await chatAPI.createSession(trimmedName);
          setSessions(prev => [...prev, trimmedName]);
          setActiveSession(trimmedName);
          setMessages([]);
          setActiveFile(null);
          setWorkspaceOpen(false);
        } catch (err) { alert(err.response?.data?.error || 'Failed to create session. Please try again.'); }
      } else { alert('Session name already exists!'); }
    }
  };

  const switchSession = (sessionName) => { setActiveSession(sessionName); };

  const deleteSession = async (sessionName) => {
    if (sessionName === 'default') { alert('Cannot delete default session!'); return; }
    if (window.confirm(`Delete session "${getSessionDisplayName(sessionName)}"?`)) {
      try {
        await chatAPI.deleteSession(sessionName);
        setSessions(prev => prev.filter(s => s !== sessionName));
        // Clean up alias if any
        setSessionAliases(prev => {
          const updated = { ...prev };
          delete updated[sessionName];
          localStorage.setItem('psai_session_aliases', JSON.stringify(updated));
          return updated;
        });
        if (activeSession === sessionName) setActiveSession('default');
      } catch (err) { alert(err.response?.data?.error || 'Failed to delete session. Please try again.'); }
    }
  };

  // ── Frontend-only session renaming via aliases ────────────────────────────
  const getSessionDisplayName = useCallback((sessionId) => {
    return sessionAliases[sessionId] || sessionId;
  }, [sessionAliases]);

  const startRenaming = (sessionId) => {
    setRenamingSession(sessionId);
    setRenameInput(getSessionDisplayName(sessionId));
  };

  const commitRename = (sessionId) => {
    const trimmed = renameInput.trim();
    if (trimmed && trimmed !== sessionId) {
      const updated = { ...sessionAliases, [sessionId]: trimmed };
      setSessionAliases(updated);
      localStorage.setItem('psai_session_aliases', JSON.stringify(updated));
    }
    setRenamingSession(null);
    setRenameInput('');
  };

  const cancelRename = () => { setRenamingSession(null); setRenameInput(''); };

  // ── Search ─────────────────────────────────────────────────────────────────
  const filteredMessages = searchQuery
    ? messages.filter(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  // ── Custom code block renderer for ReactMarkdown ──────────────────────────
  const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const [copied, setCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const lang = match ? match[1].toLowerCase() : '';
    const codeString = String(children).replace(/\n$/, '');

    if (inline) {
      return <code className="inline-code" {...props}>{children}</code>;
    }

    const isPreviewable = PREVIEWABLE_LANGS.has(lang);

    const handleOpenInWorkspace = () => {
      setActiveFile({ name: `app.${lang || 'txt'}`, code: codeString, lang: lang || 'text' });
      setWorkspaceOpen(true);
      setWorkspaceTab('preview');
    };

    return (
      <div className="code-block-wrapper">
        <div className="code-block-header">
          <span className="code-block-lang">{lang || 'code'}</span>
          <div className="code-block-actions">
            {isPreviewable && (
              <button className="code-action-btn" onClick={handleOpenInWorkspace} title="Open in Preview">
                👁️ Preview
              </button>
            )}
            <CopyToClipboard text={codeString} onCopy={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
              <button className="code-action-btn">{copied ? '✅ Copied' : '📋 Copy'}</button>
            </CopyToClipboard>
          </div>
        </div>
        <SyntaxHighlighter
          style={oneDark}
          language={lang || 'text'}
          PreTag="div"
          showLineNumbers={codeString.split('\n').length > 5}
          customStyle={{
            margin: 0,
            borderRadius: '0 0 10px 10px',
            fontSize: '13px',
            background: 'rgba(0,0,0,0.55)',
          }}
          {...props}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  };

  // ── Workspace Preview iframe builder ──────────────────────────────────────
  const buildPreviewDoc = (file) => {
    if (!file) return '';
    const { lang, code } = file;
    if (lang === 'html') return code;
    if (lang === 'css') return `<!DOCTYPE html><html><head><style>${code}</style></head><body><p style="color:#888;font-family:sans-serif;text-align:center;margin-top:40px">CSS Preview</p></body></html>`;
    if (['js', 'javascript'].includes(lang)) {
      return `<!DOCTYPE html><html><head><script>window.onerror=function(m,s,l){document.body.innerHTML+='<pre style="color:red">Error: '+m+'</pre>';return true;};</script></head><body><script>${code}</script></body></html>`;
    }
    return '';
  };

  const canPreview = activeFile && PREVIEWABLE_LANGS.has(activeFile.lang);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="chat-container">

      {/* ── SIDEBAR ── */}
      <aside className="chat-sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-text">PSAI</span>
          <span className="sidebar-logo-badge">AI</span>
        </div>

        <button className="sidebar-new-chat" onClick={createNewSession}>
          <span>＋</span> New Chat
        </button>

        <button className="sidebar-item" onClick={() => setShowSearch(!showSearch)}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Search
        </button>

        <div className="sidebar-section-label">Conversations</div>
        <div className="sidebar-sessions">
          {sessions.map(session => (
            <div key={session} className={`sidebar-session-item ${session === activeSession ? 'active' : ''}`}>
              {renamingSession === session ? (
                <div className="session-rename-row">
                  <input
                    className="session-rename-input"
                    value={renameInput}
                    autoFocus
                    onChange={e => setRenameInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitRename(session);
                      if (e.key === 'Escape') cancelRename();
                    }}
                    onBlur={() => commitRename(session)}
                  />
                </div>
              ) : (
                <>
                  <button className="sidebar-session-name" onClick={() => switchSession(session)}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                    <span>{getSessionDisplayName(session)}</span>
                  </button>
                  <div className="session-actions">
                    <button className="sidebar-session-action" onClick={() => startRenaming(session)} title="Rename">✏️</button>
                    {session !== 'default' && (
                      <button className="sidebar-session-action danger" onClick={() => deleteSession(session)} title="Delete">🗑</button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="profile-menu-divider" style={{ marginBottom: 12 }} />
          <div ref={profileMenuRef} style={{ position: 'relative' }}>
            <button className="sidebar-user" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="sidebar-avatar" />
              ) : (
                <div className="sidebar-avatar">{currentUser.name ? currentUser.name[0].toUpperCase() : '?'}</div>
              )}
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{currentUser.name}</div>
                <div className="sidebar-user-email">{currentUser.email}</div>
              </div>
              <div className="sidebar-user-chevron">⌄</div>
            </button>

            {showProfileMenu && (
              <div className="profile-menu" style={{ bottom: 'calc(100% + 8px)', top: 'auto' }}>
                <div className="profile-menu-header">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="profile-menu-avatar-img" />
                  ) : (
                    <div className="profile-avatar">{currentUser.name ? currentUser.name[0].toUpperCase() : '?'}</div>
                  )}
                  <div className="profile-details">
                    <p className="profile-name">{currentUser.name}</p>
                    <p className="profile-email">{currentUser.email}</p>
                  </div>
                </div>
                <div className="profile-menu-divider" />
                <button onClick={() => { setShowProfileEdit(true); setShowProfileMenu(false); }} className="profile-menu-item">✏️ Edit Profile</button>
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

      {/* ── MAIN AREA (Chat + Workspace split) ── */}
      <div className="chat-main-wrapper">

        {/* ── CHAT MAIN ── */}
        <div className="chat-main">

          {/* Header */}
          <div className="chat-header">
            <div className="header-left">
              <div className="header-session-info">
                <div className="header-session-dot" />
                <h2>{getSessionDisplayName(activeSession)}</h2>
              </div>
              <div className="header-model-badge">PSAI · AI Assistant</div>
            </div>
            <div className="header-right">
              {activeFile && (
                <button
                  className={`header-icon-btn ${workspaceOpen ? 'active' : ''}`}
                  onClick={() => setWorkspaceOpen(!workspaceOpen)}
                  title="Toggle Workspace"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                  {workspaceOpen ? 'Hide Workspace' : 'Open Workspace'}
                </button>
              )}
              <button className={`header-icon-btn ${showSearch ? 'active' : ''}`} onClick={() => setShowSearch(!showSearch)} title="Search">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
            </div>
          </div>

          {/* Search bar */}
          {showSearch && (
            <div className="search-bar">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus
              />
              <button className="search-close-btn" onClick={() => { setShowSearch(false); setSearchQuery(''); }}>✕</button>
            </div>
          )}

          {/* Messages area */}
          <div className="chat-box" ref={chatBoxRef}>
            {loadingMessages && messages.length === 0 && (
              <div className="welcome-message"><div className="loading-dots"><span /><span /><span /></div></div>
            )}

            {/* Empty state + starter templates */}
            {!loadingMessages && messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 2a10 10 0 110 20A10 10 0 0112 2zm0 0v10m0 0l-3-3m3 3l3-3"/></svg>
                </div>
                <h2 className="empty-state-title">How can I help you today?</h2>
                <p className="empty-state-sub">Hi {currentUser.name}! Start a conversation or try one of these prompts:</p>
                <div className="template-grid">
                  {STARTER_TEMPLATES.map((t, i) => (
                    <button key={i} className="template-card" onClick={() => sendMessage(t.prompt)}>
                      <span className="template-icon">{t.icon}</span>
                      <span className="template-title">{t.title}</span>
                      <span className="template-preview">{t.prompt.slice(0, 60)}…</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredMessages.length === 0 && searchQuery && messages.length > 0 && (
              <div className="no-results"><p>No messages found matching "{searchQuery}"</p></div>
            )}

            {filteredMessages.map((msg, i) => (
              <div key={i} className={`message ${msg.type}`}>
                {msg.type === 'bot' && (
                  <img src={botAvatar} alt="Bot" className="avatar" />
                )}
                {msg.type === 'user' && (
                  <div className="user-avatar">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : '?'}
                  </div>
                )}
                <div className="message-content">
                  <div className={`message-text ${msg.type === 'bot' ? 'markdown-body' : ''}`}>
                    {msg.type === 'bot' ? (
                      <ReactMarkdown
                        components={{
                          code: CodeBlock,
                          p: ({ children }) => <p className="md-p">{children}</p>,
                          h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
                          h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
                          h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
                          ul: ({ children }) => <ul className="md-ul">{children}</ul>,
                          ol: ({ children }) => <ol className="md-ol">{children}</ol>,
                          li: ({ children }) => <li className="md-li">{children}</li>,
                          blockquote: ({ children }) => <blockquote className="md-blockquote">{children}</blockquote>,
                          strong: ({ children }) => <strong className="md-strong">{children}</strong>,
                          em: ({ children }) => <em className="md-em">{children}</em>,
                          a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="md-link">{children}</a>,
                          table: ({ children }) => <div className="md-table-wrapper"><table className="md-table">{children}</table></div>,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    ) : (
                      <span>{msg.text}</span>
                    )}
                  </div>
                  <div className="message-footer">
                    <span className="message-timestamp">{formatTimestamp(msg.timestamp)}</span>
                    <CopyToClipboard text={msg.text}>
                      <button className="copy-btn" title="Copy message">
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      </button>
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="message bot">
                <img src={botAvatar} alt="Bot" className="avatar" />
                <div className="message-content">
                  <div className="message-text bot-thinking">
                    <span className="thinking-dot" /><span className="thinking-dot" /><span className="thinking-dot" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="input-container">
            <div className="input-pill">
              <textarea
                ref={textareaRef}
                className="chat-textarea"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask PSAI anything… (Shift+Enter for newline)"
                disabled={loading}
              />
              <div className="input-actions">
                <button
                  className="send-btn"
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  title="Send"
                >
                  {loading ? (
                    <div className="send-spinner" />
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  )}
                </button>
              </div>
            </div>
            <p className="input-hint">Shift+Enter for newline · Enter to send</p>
          </div>
        </div>

        {/* ── WORKSPACE PANEL ── */}
        {workspaceOpen && activeFile && (
          <div className="workspace-panel">
            <div className="workspace-header">
              <div className="workspace-filename">
                <span className="workspace-file-icon">📄</span>
                {activeFile.name}
              </div>
              <div className="workspace-tabs">
                <button
                  className={`workspace-tab ${workspaceTab === 'preview' ? 'active' : ''}`}
                  onClick={() => setWorkspaceTab('preview')}
                >
                  👁️ Preview
                </button>
                <button
                  className={`workspace-tab ${workspaceTab === 'code' ? 'active' : ''}`}
                  onClick={() => setWorkspaceTab('code')}
                >
                  💻 Code
                </button>
              </div>
              <button className="workspace-close-btn" onClick={() => setWorkspaceOpen(false)} title="Close Workspace">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="workspace-body">
              {workspaceTab === 'preview' ? (
                canPreview ? (
                  <iframe
                    className="workspace-iframe"
                    title="Live Preview"
                    srcDoc={buildPreviewDoc(activeFile)}
                    sandbox="allow-scripts"
                  />
                ) : (
                  <div className="workspace-no-preview">
                    <div className="no-preview-icon">🚫</div>
                    <h3>Live preview not supported</h3>
                    <p>Preview is only available for <strong>HTML</strong>, <strong>CSS</strong>, and <strong>JavaScript</strong> code.</p>
                    <button className="workspace-tab active" style={{ marginTop: 16 }} onClick={() => setWorkspaceTab('code')}>
                      Open Source Code
                    </button>
                  </div>
                )
              ) : (
                <div className="workspace-code-view">
                  <div className="workspace-code-header">
                    <span className="code-block-lang">{activeFile.lang}</span>
                    <CopyToClipboard text={activeFile.code}>
                      <button className="code-action-btn">📋 Copy All</button>
                    </CopyToClipboard>
                  </div>
                  <SyntaxHighlighter
                    style={oneDark}
                    language={activeFile.lang || 'text'}
                    PreTag="div"
                    showLineNumbers
                    customStyle={{
                      margin: 0,
                      flex: 1,
                      fontSize: '13px',
                      borderRadius: 0,
                      background: 'rgba(0,0,0,0.4)',
                      height: '100%',
                      overflow: 'auto',
                    }}
                  >
                    {activeFile.code}
                  </SyntaxHighlighter>
                </div>
              )}
            </div>
          </div>
        )}
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

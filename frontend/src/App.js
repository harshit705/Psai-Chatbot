import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { 
  Zap, Plus, Search, MessageSquare, Settings, HelpCircle, User, LogOut, ChevronDown, 
  Sparkles, Code, BarChart3, FileText, Server, Rocket, Paperclip, Image as ImageIcon, 
  Mic, Send, Terminal, Eye, Download, Share2, Bell, X, Edit, Trash2, Check, Copy, 
  Cpu, Layout, ShieldCheck, ArrowRight, CornerDownLeft
} from 'lucide-react';
import './App.css';
import LandingPage from './components/LandingPage';
import config from './config';
import { authAPI, chatAPI } from './services/api';
import ProfileEdit from './components/ProfileEdit';

const BOT_AVATAR = "https://api.dicebear.com/7.x/bottts/svg?seed=Ollama";

// ─── Quick Action Pills Data ──────────────────────────────────────────────────
const QUICK_PILLS = [
  { label: 'React', icon: '⚡', prompt: 'Create a modern React component with TypeScript and TailwindCSS.' },
  { label: 'Python', icon: '🐍', prompt: 'Write a Python script for data processing and data visualization.' },
  { label: 'AI & ML', icon: '🤖', prompt: 'Explain how transformers and large language models work under the hood.' },
  { label: 'Resume', icon: '📄', prompt: 'Review my resume and provide ATS optimization feedback.' },
  { label: 'Backend', icon: '⚙', prompt: 'Build a RESTful Node.js Express API with MongoDB authentication.' },
  { label: 'Deployment', icon: '🚀', prompt: 'How do I deploy a fullstack Docker containerized app to production?' },
];

// ─── Feature Cards Data ────────────────────────────────────────────────────────
const FEATURE_CARDS = [
  {
    id: 1,
    title: 'Build a React App',
    description: 'Create modern React applications using TailwindCSS and TypeScript.',
    icon: Code,
    gradient: 'from-purple-600/20 to-indigo-600/20',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    iconBg: 'rgba(139, 92, 246, 0.15)',
    iconColor: '#A855F7',
    prompt: 'Build a full-featured responsive React Dashboard application with dark mode theme using TailwindCSS.'
  },
  {
    id: 2,
    title: 'Analyze Data',
    description: 'Generate Python analysis, charts and actionable business insights.',
    icon: BarChart3,
    gradient: 'from-blue-600/20 to-cyan-600/20',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    iconBg: 'rgba(59, 130, 246, 0.15)',
    iconColor: '#3B82F6',
    prompt: 'Write a Python Pandas script to analyze customer churn data and visualize key metrics.'
  },
  {
    id: 3,
    title: 'Improve Resume',
    description: 'ATS optimization, formatting and tailored recruiter feedback.',
    icon: FileText,
    gradient: 'from-pink-600/20 to-rose-600/20',
    borderColor: 'rgba(236, 72, 153, 0.3)',
    iconBg: 'rgba(236, 72, 153, 0.15)',
    iconColor: '#EC4899',
    prompt: 'Help me optimize my Software Engineer resume for ATS systems and highlight impactful achievements.'
  },
  {
    id: 4,
    title: 'Deploy Backend',
    description: 'Deploy Node.js, Express, FastAPI and Docker projects seamlessly.',
    icon: Server,
    gradient: 'from-amber-600/20 to-orange-600/20',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    iconBg: 'rgba(245, 158, 11, 0.15)',
    iconColor: '#F59E0B',
    prompt: 'Write a step-by-step guide and Dockerfile to deploy an Express.js API with MongoDB to production.'
  }
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

// ─── Helper for greeting based on time of day ───────────────────────────────
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
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
        <div className="loading-logo-box">
          <Zap className="loading-zap-icon" />
          <h1>PSAI</h1>
        </div>
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
      if (!err.response) {
        setError(`Cannot connect to backend server (${err.message}). Check REACT_APP_API_URL or server status.`);
      } else {
        setError(err.response.data?.error || 'Login failed. Please try again.');
      }
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
        <div className="auth-brand">
          <div className="auth-zap-badge">
            <Zap size={24} color="#A855F7" />
          </div>
          <h1>PSAI Chatbot</h1>
        </div>

        {authMode === 'login' && (
          <div className="auth-form">
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">Enter your credentials to access your workspace</p>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} onKeyPress={handleKeyPress} disabled={loading} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={handleKeyPress} disabled={loading} />
            <button className="auth-submit-btn" onClick={handleLogin} disabled={loading}>{loading ? 'Logging in...' : 'Login to Workspace'}</button>
            <div className="auth-links">
              <button onClick={() => setAuthMode('signup')} disabled={loading}>Create Account</button>
              <button onClick={() => setAuthMode('forgot')} disabled={loading}>Forgot Password?</button>
            </div>
          </div>
        )}

        {authMode === 'signup' && (
          <div className="auth-form">
            <h2>Create Account</h2>
            <p className="auth-subtitle">Join thousands of developers building with PSAI</p>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} onKeyPress={handleKeyPress} disabled={loading} />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} onKeyPress={handleKeyPress} disabled={loading} />
            <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={handleKeyPress} disabled={loading} />
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyPress={handleKeyPress} disabled={loading} />
            <button className="auth-submit-btn" onClick={handleSignup} disabled={loading}>{loading ? 'Creating account...' : 'Sign Up Free'}</button>
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
                <button className="auth-submit-btn" onClick={handleForgotPassword} disabled={loading}>{loading ? 'Sending...' : 'Send Reset Code'}</button>
              </>
            ) : !codeVerified ? (
              <>
                <p style={{ textAlign: 'center', color: '#A1A1AA', marginBottom: '20px' }}>We've sent a 6-digit code to your email. Enter it below.</p>
                <input type="text" placeholder="Enter 6-digit code" value={resetCode} onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength="6" disabled={loading} style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '5px' }} />
                <button className="auth-submit-btn" onClick={handleVerifyCode} disabled={loading || resetCode.length !== 6}>{loading ? 'Verifying...' : 'Verify Code'}</button>
              </>
            ) : (
              <>
                <input type="password" placeholder="New Password (min 6 characters)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={loading} />
                <input type="password" placeholder="Re-enter Password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} onKeyPress={handleKeyPress} disabled={loading} />
                <button className="auth-submit-btn" onClick={handleResetPassword} disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
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

// ─── Chat App (World-Class AI SaaS Dashboard) ─────────────────────────────────
function ChatApp({ currentUser, onLogout, onUpdateUser, botAvatar }) {
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
  const [selectedModel, setSelectedModel] = useState('PSAI 3.5 Turbo');

  // Workspace panel state
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState('preview');
  const [activeFile, setActiveFile] = useState(null);

  // Session aliases (frontend-only renaming)
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

  // Reactive code extraction from last bot message
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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  }, [input]);

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
        errMsg = 'Request timed out. Please try again.';
      }
      setMessages([...newMessages, { type: 'bot', text: `❌ ${errMsg}`, timestamp: new Date().toISOString() }]);
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

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear this conversation history?')) {
      try {
        await chatAPI.clearChat(activeSession);
        setMessages([]);
        setActiveFile(null);
        setWorkspaceOpen(false);
      } catch (err) { console.error('Failed to clear chat:', err); }
    }
  };

  const handleLogoutClick = () => { onLogout(); };

  const exportChat = (format) => {
    if (messages.length === 0) { alert('No messages to export!'); return; }
    let content = '';
    if (format === 'txt') {
      content = messages.map(m => `[${m.type.toUpperCase()} - ${formatTimestamp(m.timestamp)}]\n${m.text}\n`).join('\n---\n\n');
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
    const sessionName = prompt('Enter new conversation name:');
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

  const getSessionDisplayName = useCallback((sessionId) => {
    if (sessionId === 'default') return 'General Workspace';
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

  const filteredMessages = searchQuery
    ? messages.filter(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  // CodeBlock renderer for Markdown
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
              <button className="code-action-btn preview-btn" onClick={handleOpenInWorkspace} title="Open in Workspace Preview">
                <Eye size={12} style={{ marginRight: 4 }} /> Preview
              </button>
            )}
            <CopyToClipboard text={codeString} onCopy={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
              <button className="code-action-btn">
                {copied ? <><Check size={12} style={{ marginRight: 4 }} /> Copied</> : <><Copy size={12} style={{ marginRight: 4 }} /> Copy</>}
              </button>
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
            borderRadius: '0 0 16px 16px',
            fontSize: '13px',
            background: 'rgba(9, 9, 11, 0.85)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderTop: 'none',
          }}
          {...props}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  };

  const buildPreviewDoc = (file) => {
    if (!file) return '';
    const { lang, code } = file;
    if (lang === 'html') return code;
    if (lang === 'css') return `<!DOCTYPE html><html><head><style>${code}</style></head><body><p style="color:#A1A1AA;font-family:sans-serif;text-align:center;margin-top:40px">CSS Preview</p></body></html>`;
    if (['js', 'javascript'].includes(lang)) {
      return `<!DOCTYPE html><html><head><script>window.onerror=function(m,s,l){document.body.innerHTML+='<pre style="color:#ef4444">Error: '+m+'</pre>';return true;};</script></head><body><script>${code}</script></body></html>`;
    }
    return '';
  };

  const canPreview = activeFile && PREVIEWABLE_LANGS.has(activeFile.lang);

  // Grouping sessions for sidebar
  const todaySessions = sessions.filter(s => s === 'default' || s.startsWith('Today') || s === activeSession);
  const otherSessions = sessions.filter(s => !todaySessions.includes(s));

  return (
    <div className="chat-container">

      {/* ── 1. SIDEBAR (280px) ── */}
      <aside className="chat-sidebar">
        {/* Brand Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon-wrapper">
            <Zap size={18} color="#A855F7" className="logo-zap" />
          </div>
          <span className="sidebar-logo-text">PSAI</span>
          <span className="sidebar-logo-badge">PRO</span>
        </div>

        {/* Action Buttons */}
        <button className="sidebar-new-chat" onClick={createNewSession}>
          <Plus size={16} />
          <span>New Chat</span>
        </button>

        <button className={`sidebar-search-btn ${showSearch ? 'active' : ''}`} onClick={() => setShowSearch(!showSearch)}>
          <Search size={15} />
          <span>Search conversations</span>
          <span className="cmd-kbd">⌘K</span>
        </button>

        {/* Conversations List */}
        <div className="sidebar-nav-container">
          <div className="sidebar-group-label">Conversations</div>
          
          {/* Today Group */}
          <div className="sidebar-subgroup-label">Today</div>
          <div className="sidebar-sessions">
            {todaySessions.map(session => (
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
                      <MessageSquare size={14} className="session-icon" />
                      <span>{getSessionDisplayName(session)}</span>
                    </button>
                    <div className="session-actions">
                      <button className="sidebar-session-action" onClick={() => startRenaming(session)} title="Rename"><Edit size={12} /></button>
                      {session !== 'default' && (
                        <button className="sidebar-session-action danger" onClick={() => deleteSession(session)} title="Delete"><Trash2 size={12} /></button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Previous 7 Days Group (if any) */}
          {otherSessions.length > 0 && (
            <>
              <div className="sidebar-subgroup-label">Previous 7 Days</div>
              <div className="sidebar-sessions">
                {otherSessions.map(session => (
                  <div key={session} className={`sidebar-session-item ${session === activeSession ? 'active' : ''}`}>
                    <button className="sidebar-session-name" onClick={() => switchSession(session)}>
                      <MessageSquare size={14} className="session-icon" />
                      <span>{getSessionDisplayName(session)}</span>
                    </button>
                    <div className="session-actions">
                      <button className="sidebar-session-action" onClick={() => startRenaming(session)} title="Rename"><Edit size={12} /></button>
                      <button className="sidebar-session-action danger" onClick={() => deleteSession(session)} title="Delete"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-quick-nav">
            <button className="sidebar-nav-item" onClick={() => alert('Settings menu coming soon!')}>
              <Settings size={15} />
              <span>Settings</span>
            </button>
            <button className="sidebar-nav-item" onClick={() => alert('PSAI Help & Documentation')}>
              <HelpCircle size={15} />
              <span>Help & Docs</span>
            </button>
          </div>

          <div className="profile-menu-divider" />
          
          <div ref={profileMenuRef} style={{ position: 'relative' }}>
            <button className="sidebar-user" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="sidebar-avatar" />
              ) : (
                <div className="sidebar-avatar">{currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}</div>
              )}
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{currentUser?.name || 'Developer'}</div>
                <div className="sidebar-user-email">{currentUser?.email || 'user@psai.app'}</div>
              </div>
              <ChevronDown size={14} className="sidebar-user-chevron" />
            </button>

            {showProfileMenu && (
              <div className="profile-menu">
                <div className="profile-menu-header">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="profile-menu-avatar-img" />
                  ) : (
                    <div className="profile-avatar">{currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}</div>
                  )}
                  <div className="profile-details">
                    <p className="profile-name">{currentUser?.name}</p>
                    <p className="profile-email">{currentUser?.email}</p>
                  </div>
                </div>
                <div className="profile-menu-divider" />
                <button onClick={() => { setShowProfileEdit(true); setShowProfileMenu(false); }} className="profile-menu-item"><Edit size={14} /> Edit Profile</button>
                <button onClick={() => exportChat('txt')} className="profile-menu-item"><FileText size={14} /> Export TXT</button>
                <button onClick={() => exportChat('json')} className="profile-menu-item"><Download size={14} /> Export JSON</button>
                <div className="profile-menu-divider" />
                <button onClick={handleClearChat} className="profile-menu-item clear-item"><Trash2 size={14} /> Clear History</button>
                <button onClick={handleLogoutClick} className="profile-menu-item logout-item"><LogOut size={14} /> Logout</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── 2. MAIN WORKSPACE AREA ── */}
      <div className="chat-main-wrapper">
        <div className="chat-main">

          {/* Top Header */}
          <header className="chat-header">
            <div className="header-left">
              <div className="header-greeting-box">
                <h2>{getGreeting()}, {currentUser?.name?.split(' ')[0] || 'Developer'} 👋</h2>
                <p className="header-subtitle">What would you like to build today?</p>
              </div>
            </div>
            
            <div className="header-right">
              <button className="header-pill-btn" onClick={() => setShowSearch(!showSearch)} title="Search">
                <Search size={14} />
                <span>Search</span>
              </button>

              <div className="model-selector-pill">
                <Cpu size={14} className="model-icon" />
                <span>{selectedModel}</span>
                <ChevronDown size={12} />
              </div>

              <button className="header-icon-btn" onClick={() => alert('Share workspace link copied!')} title="Share">
                <Share2 size={15} />
              </button>

              <button className="header-icon-btn" onClick={() => exportChat('txt')} title="Export Workspace">
                <Download size={15} />
              </button>

              <button className="header-icon-btn notification-btn" title="Notifications">
                <Bell size={15} />
                <span className="notif-badge" />
              </button>

              <div className="header-avatar-mini" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt="Avatar" />
                ) : (
                  <span>{currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}</span>
                )}
              </div>
            </div>
          </header>

          {/* Search Bar overlay */}
          {showSearch && (
            <div className="search-bar">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search messages in conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus
              />
              <button className="search-close-btn" onClick={() => { setShowSearch(false); setSearchQuery(''); }}><X size={16} /></button>
            </div>
          )}

          {/* Chat Messages & Welcome Hero Content Area */}
          <div className="chat-box" ref={chatBoxRef}>
            {loadingMessages && messages.length === 0 && (
              <div className="welcome-message"><div className="loading-dots"><span /><span /><span /></div></div>
            )}

            {/* WELCOME HERO SECTION (When empty state) */}
            {!loadingMessages && messages.length === 0 && (
              <div className="welcome-hero-section">
                
                {/* Large Animated AI Robot Icon */}
                <div className="hero-robot-wrapper">
                  <div className="hero-robot-glow" />
                  <div className="hero-robot-icon-box">
                    <Sparkles size={42} color="#A855F7" className="hero-sparkles-anim" />
                  </div>
                </div>

                {/* Hero Headings */}
                <h1 className="hero-title">Hi {currentUser?.name?.split(' ')[0] || 'Developer'} 👋</h1>
                <p className="hero-description">
                  I'm <strong>PSAI</strong>, your enterprise AI coding & engineering assistant. <br />
                  I can help you with fullstack coding, architectural design, deployment, debugging, resume reviews, and automated workflows.
                </p>

                {/* Quick Action Pills below Hero */}
                <div className="quick-pills-container">
                  {QUICK_PILLS.map((pill, idx) => (
                    <button 
                      key={idx} 
                      className="quick-action-pill"
                      onClick={() => sendMessage(pill.prompt)}
                    >
                      <span className="pill-emoji">{pill.icon}</span>
                      <span>{pill.label}</span>
                    </button>
                  ))}
                </div>

                {/* 4 Feature Cards Grid */}
                <div className="feature-cards-grid">
                  {FEATURE_CARDS.map((card) => {
                    const CardIcon = card.icon;
                    return (
                      <div 
                        key={card.id} 
                        className="feature-card"
                        onClick={() => sendMessage(card.prompt)}
                      >
                        <div className="card-top-row">
                          <div className="card-icon-box" style={{ background: card.iconBg, color: card.iconColor }}>
                            <CardIcon size={20} />
                          </div>
                          <span className="card-arrow"><ArrowRight size={14} /></span>
                        </div>
                        <h3 className="card-title">{card.title}</h3>
                        <p className="card-desc">{card.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredMessages.length === 0 && searchQuery && messages.length > 0 && (
              <div className="no-results"><p>No messages found matching "{searchQuery}"</p></div>
            )}

            {/* Render Active Messages Stream */}
            {filteredMessages.map((msg, i) => (
              <div key={i} className={`message ${msg.type}`}>
                {msg.type === 'bot' && (
                  <div className="bot-avatar-box">
                    <Sparkles size={16} color="#A855F7" />
                  </div>
                )}
                {msg.type === 'user' && (
                  <div className="user-avatar-box">
                    {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
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
                        <Copy size={12} />
                      </button>
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="message bot">
                <div className="bot-avatar-box">
                  <Sparkles size={16} color="#A855F7" />
                </div>
                <div className="message-content">
                  <div className="message-text bot-thinking">
                    <span className="thinking-dot" /><span className="thinking-dot" /><span className="thinking-dot" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── 3. FLOATING PROMPT COMPOSER ── */}
          <div className="floating-composer-wrapper">
            <div className="floating-composer-glass">
              <textarea
                ref={textareaRef}
                className="composer-textarea"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask anything..."
                disabled={loading}
              />

              <div className="composer-bottom-bar">
                {/* Bottom Left Utility Icons */}
                <div className="composer-left-tools">
                  <button className="composer-tool-btn" title="Attach Files" onClick={() => alert('File upload coming soon!')}>
                    <Plus size={16} />
                  </button>
                  <button className="composer-tool-btn" title="Attach Documents" onClick={() => alert('Doc parser ready')}>
                    <Paperclip size={15} />
                  </button>
                  <button className="composer-tool-btn" title="Upload Images" onClick={() => alert('Vision OCR ready')}>
                    <ImageIcon size={15} />
                  </button>
                  <button className="composer-tool-btn" title="Voice Input" onClick={() => alert('Voice input activated')}>
                    <Mic size={15} />
                  </button>
                </div>

                {/* Bottom Right Actions */}
                <div className="composer-right-tools">
                  <button className="magic-ai-btn" title="Magic AI Enhance" onClick={() => setInput(prev => prev ? `Optimize and refactor this code cleanly:\n${prev}` : 'Generate an enterprise React & Node.js architecture blueprint.')}>
                    <Sparkles size={14} className="magic-sparkle-icon" />
                    <span>Magic AI</span>
                  </button>

                  <button 
                    className="composer-send-btn"
                    onClick={() => sendMessage()}
                    disabled={loading || !input.trim()}
                    title="Send Prompt"
                  >
                    {loading ? <div className="send-spinner" /> : <Send size={15} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="composer-footer-text">
              PSAI 3.5 Turbo · Press Shift+Enter for newline
            </div>
          </div>
        </div>

        {/* ── 4. RIGHT FLOATING TOOLBAR ── */}
        <div className="right-floating-toolbar">
          <button className="floating-tool-item" title="Quick Search" onClick={() => setShowSearch(!showSearch)}>
            <Search size={16} />
          </button>
          <button className="floating-tool-item" title="Files Workspace" onClick={() => { if (activeFile) setWorkspaceOpen(!workspaceOpen); else alert('No code generated yet to inspect in workspace.'); }}>
            <FileText size={16} />
          </button>
          <button className="floating-tool-item" title="Terminal" onClick={() => alert('Virtual Sandbox Terminal is active.')}>
            <Terminal size={16} />
          </button>
          <button className={`floating-tool-item ${workspaceOpen ? 'active' : ''}`} title="Live Preview" onClick={() => { if (activeFile) setWorkspaceOpen(!workspaceOpen); else alert('Generate HTML/JS code first to preview!'); }}>
            <Eye size={16} />
          </button>
          <button className="floating-tool-item deploy-tool" title="Deploy Application" onClick={() => alert('Deploying to Vercel/Render Cloud Sandbox...')}>
            <Rocket size={16} />
          </button>
        </div>

        {/* ── 5. WORKSPACE PANEL (Code & Live Iframe Preview) ── */}
        {workspaceOpen && activeFile && (
          <div className="workspace-panel">
            <div className="workspace-header">
              <div className="workspace-filename">
                <FileText size={14} className="file-icon" />
                <span>{activeFile.name}</span>
              </div>
              <div className="workspace-tabs">
                <button
                  className={`workspace-tab ${workspaceTab === 'preview' ? 'active' : ''}`}
                  onClick={() => setWorkspaceTab('preview')}
                >
                  <Eye size={13} style={{ marginRight: 4 }} /> Live Preview
                </button>
                <button
                  className={`workspace-tab ${workspaceTab === 'code' ? 'active' : ''}`}
                  onClick={() => setWorkspaceTab('code')}
                >
                  <Code size={13} style={{ marginRight: 4 }} /> Code
                </button>
              </div>
              <button className="workspace-close-btn" onClick={() => setWorkspaceOpen(false)} title="Close Workspace">
                <X size={16} />
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
                    <p>Preview is available for HTML, CSS, and JavaScript code blocks.</p>
                    <button className="workspace-tab active" style={{ marginTop: 16 }} onClick={() => setWorkspaceTab('code')}>
                      View Source Code
                    </button>
                  </div>
                )
              ) : (
                <div className="workspace-code-view">
                  <div className="workspace-code-header">
                    <span className="code-block-lang">{activeFile.lang}</span>
                    <CopyToClipboard text={activeFile.code}>
                      <button className="code-action-btn"><Copy size={12} style={{ marginRight: 4 }} /> Copy Source</button>
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
                      background: 'rgba(9, 9, 11, 0.95)',
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

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { 
  Zap, Plus, Search, MessageSquare, Settings, HelpCircle, User, LogOut, ChevronDown, 
  Sparkles, Code, BarChart3, FileText, Server, Rocket, Paperclip, Image as ImageIcon, 
  Mic, Send, Terminal, Eye, Download, Share2, Bell, X, Edit, Trash2, Check, Copy, 
  Cpu, Layout, ShieldCheck, ArrowRight, CornerDownLeft, Globe, Play, RefreshCw, Layers, Sliders,
  ThumbsUp, ThumbsDown, RotateCcw, StopCircle, Brain, Database, FileSpreadsheet, Archive, Folder, Pin, Bookmark, Compass, Radio, Volume2, Star, MoreVertical, CopyCheck
} from 'lucide-react';
import './App.css';
import LandingPage from './components/LandingPage';
import config from './config';
import { authAPI, chatAPI } from './services/api';
import ProfileEdit from './components/ProfileEdit';

const BOT_AVATAR = "https://api.dicebear.com/7.x/bottts/svg?seed=Ollama";

const AVAILABLE_MODELS = [
  { id: 'PSAI 3.5 Turbo', name: 'PSAI 3.5 Turbo', desc: 'Fastest model for general coding & chat', latency: '35ms', cost: 'Free', context: '128k', reasoning: 'High' },
  { id: 'Claude 3.5 Sonnet', name: 'Claude 3.5 Sonnet', desc: 'Superior code writing & complex refactoring', latency: '65ms', cost: 'Pro', context: '200k', reasoning: 'Max' },
  { id: 'GPT-4o Enterprise', name: 'GPT-4o Enterprise', desc: 'Multimodal intelligence & deep reasoning', latency: '50ms', cost: 'Pro', context: '128k', reasoning: 'Max' },
  { id: 'DeepSeek R1', name: 'DeepSeek R1 Reasoning', desc: 'Advanced math, logic and algorithm synthesis', latency: '90ms', cost: 'Free', context: '64k', reasoning: 'Ultra' },
  { id: 'Auto-Route', name: 'Auto (Smart Route)', desc: 'Automatically selects best model per query', latency: '40ms', cost: 'Dynamic', context: 'Auto', reasoning: 'Adaptive' }
];

const QUICK_PILLS = [
  { label: 'React', icon: '⚡', prompt: 'Create a modern React component with TypeScript and TailwindCSS.' },
  { label: 'Python', icon: '🐍', prompt: 'Write a Python script for data processing and data visualization.' },
  { label: 'AI', icon: '🤖', prompt: 'Explain how transformers and large language models work under the hood.' },
  { label: 'SQL', icon: '⚙', prompt: 'Write an optimized SQL query with indexing and JOINs.' },
  { label: 'Resume', icon: '📄', prompt: 'Review my resume and provide ATS optimization feedback.' },
];

const FEATURE_CARDS = [
  {
    id: 1,
    title: '🚀 Build Dashboard',
    subtitle: 'React + TailwindCSS',
    stats: '★★★★★ 2.3k uses',
    description: 'Create modern React applications with dark glassmorphism and stats charts.',
    icon: Code,
    badge: 'Most Popular',
    badgeClass: 'badge-popular',
    iconBg: 'rgba(139, 92, 246, 0.15)',
    iconColor: '#A855F7',
    prompt: 'Build a full-featured responsive React Dashboard application with dark mode theme using TailwindCSS.'
  },
  {
    id: 2,
    title: '⚡ Explain API',
    subtitle: 'REST + GraphQL',
    stats: '★★★★☆ 1.8k uses',
    description: 'Deconstruct complex APIs with code examples, headers, and payload schemas.',
    icon: BarChart3,
    badge: 'Recommended',
    badgeClass: 'badge-recommended',
    iconBg: 'rgba(59, 130, 246, 0.15)',
    iconColor: '#3B82F6',
    prompt: 'Explain how REST API authentication works with JWT tokens and security best practices.'
  },
  {
    id: 3,
    title: '✨ Create Portfolio',
    subtitle: 'HTML5 + CSS Glass',
    stats: '★★★★★ 3.1k uses',
    description: 'Design interactive developer portfolio with dark mode and smooth micro-animations.',
    icon: Compass,
    badge: 'New & Hot',
    badgeClass: 'badge-new',
    iconBg: 'rgba(236, 72, 153, 0.15)',
    iconColor: '#EC4899',
    prompt: 'Write an HTML and CSS template for an interactive developer portfolio website.'
  },
  {
    id: 4,
    title: '🛠️ Debug Error',
    subtitle: 'Node.js + Python',
    stats: '★★★★★ 4.2k uses',
    description: 'Paste any stack trace or code exception to get immediate instant code fixes.',
    icon: Server,
    badge: 'Essential',
    badgeClass: 'badge-essential',
    iconBg: 'rgba(245, 158, 11, 0.15)',
    iconColor: '#F59E0B',
    prompt: 'Help me debug this common Node.js CORS and MongoDB connection timeout error.'
  }
];

const CONVERSATION_SUGGESTIONS = [
  { label: 'Continue previous React dashboard', prompt: 'Let us continue building the React dashboard component.' },
  { label: 'Finish TenderSathi backend API', prompt: 'Help me finish the Node.js Express backend API endpoints for TenderSathi.' },
  { label: 'Summarize chat conversation', prompt: 'Provide a concise bullet-point summary of our conversation.' },
  { label: 'Create architecture diagram', prompt: 'Generate a Mermaid flowchart diagram for a microservices architecture.' }
];

const PREVIEWABLE_LANGS = new Set(['html', 'css', 'javascript', 'js', 'jsx', 'react', 'tsx', 'ts']);

function extractCodeBlock(text) {
  const match = text.match(/```([\w+-]*)\n?([\s\S]*?)```/);
  if (!match) return null;
  const lang = (match[1] || 'text').toLowerCase().trim();
  const code = match[2].trim();
  return { lang, code };
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning 👋';
  if (hour < 18) return 'Good Afternoon 👋';
  return 'Good Evening 👋';
}

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
          <h1>PSAI Workspace</h1>
        </div>

        {authMode === 'login' && (
          <div className="auth-form">
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">Enter your credentials to access your AI workspace</p>
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

function ChatApp({ currentUser, onLogout, onUpdateUser, botAvatar }) {
  const [activeSession, setActiveSession] = useState('default');
  const [sessions, setSessions] = useState(['default']);
  const [pinnedSessions, setPinnedSessions] = useState(['default']);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedModel, setSelectedModel] = useState('PSAI 3.5 Turbo');
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // Mode Toggles (Web Search, Reasoning, Artifacts, Vision)
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [reasoningEnabled, setReasoningEnabled] = useState(false);
  const [artifactsEnabled, setArtifactsEnabled] = useState(true);
  const [visionEnabled, setVisionEnabled] = useState(false);

  // Reactions & Edit state
  const [messageReactions, setMessageReactions] = useState({});

  // Attachment & Voice State
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // Modals & Drawers
  const [showTerminalModal, setShowTerminalModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [showProductivityDrawer, setShowProductivityDrawer] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Terminal state
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState([
    { type: 'system', text: 'PSAI Cloud Sandbox v3.5.0 Environment initialized.' },
    { type: 'system', text: 'Type "help" or "status" to view available sandbox commands.' }
  ]);

  // Deployment simulation state
  const [deployStep, setDeployStep] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);

  // Settings State
  const [settingsConfig, setSettingsConfig] = useState({
    temperature: 0.7,
    autoSave: true,
    systemPrompt: 'You are PSAI, an elite AI coding assistant.'
  });

  // Workspace panel state
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState('preview');
  const [activeFile, setActiveFile] = useState(null);

  // Session aliases
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
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const imgInputRef = useRef(null);

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
      if (window.innerWidth > 1024 && artifactsEnabled) setWorkspaceOpen(true);
    }
  }, [messages, artifactsEnabled]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  }, [input]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
    let text = (overrideText !== undefined ? overrideText : input).trim();
    if (!text && attachedFiles.length === 0) return;

    // Auto-Name Session based on first user prompt if not already explicitly aliased
    let titleText = text.replace(/\[Attached Files:[^\]]+\]/g, '').replace(/\[[^\]]+\]/g, '').trim();
    if (!titleText && text) titleText = text;
    if (titleText && (!sessionAliases[activeSession] || activeSession === 'default' || activeSession.startsWith('chat_'))) {
      let autoTitle = titleText.split('\n')[0];
      if (autoTitle.length > 28) autoTitle = autoTitle.substring(0, 28).trim() + '...';
      autoTitle = autoTitle.charAt(0).toUpperCase() + autoTitle.slice(1);
      
      const updatedAliases = { ...sessionAliases, [activeSession]: autoTitle };
      setSessionAliases(updatedAliases);
      localStorage.setItem('psai_session_aliases', JSON.stringify(updatedAliases));
    }

    let prefix = '';
    if (webSearchEnabled) prefix += '[🌐 Live Web Search Enabled] ';
    if (reasoningEnabled) prefix += '[🧠 Deep Reasoning Step-by-Step] ';
    if (visionEnabled) prefix += '[👁️ Vision & Multimodal OCR Active] ';

    if (attachedFiles.length > 0) {
      const fileNames = attachedFiles.map(f => f.name).join(', ');
      text = `${prefix}[Attached Files: ${fileNames}]\n\n${text}`;
    } else if (prefix) {
      text = `${prefix}${text}`;
    }

    const userMessage = text;
    const timestamp = new Date().toISOString();
    const newMessages = [...messages, { type: 'user', text: userMessage, timestamp }];
    setMessages(newMessages);
    setInput('');
    setAttachedFiles([]);
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

  const regenerateResponse = () => {
    if (messages.length === 0) return;
    const lastUserMsg = [...messages].reverse().find(m => m.type === 'user');
    if (lastUserMsg) {
      sendMessage(lastUserMsg.text);
      triggerToast('Regenerating response...');
    }
  };

  const editUserPrompt = (text) => {
    setInput(text);
    if (textareaRef.current) textareaRef.current.focus();
    triggerToast('Prompt loaded into composer for editing');
  };

  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/```[\s\S]*?```/g, 'Code block output omitted for speech.'));
      window.speechSynthesis.speak(utterance);
      triggerToast('Reading response aloud...');
    } else {
      triggerToast('Speech synthesis not supported in this browser.');
    }
  };

  const toggleReaction = (index, type) => {
    setMessageReactions(prev => ({
      ...prev,
      [index]: prev[index] === type ? null : type
    }));
    triggerToast(type === 'like' ? 'Feedback saved! Helpful response.' : 'Feedback saved! We will improve.');
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
        triggerToast('Conversation history cleared.');
      } catch (err) { console.error('Failed to clear chat:', err); }
    }
  };

  const handleLogoutClick = () => { onLogout(); };

  const exportChat = (format) => {
    if (messages.length === 0) { triggerToast('No messages to export!'); return; }
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
    triggerToast(`Exported chat as ${format.toUpperCase()}`);
  };

  // Seamless Instant New Chat creation without prompt modal
  const createNewSession = async () => {
    const newSessionId = `chat_${Date.now()}`;
    try {
      await chatAPI.createSession(newSessionId);
      setSessions(prev => [newSessionId, ...prev]);
      setActiveSession(newSessionId);
      setMessages([]);
      setActiveFile(null);
      setWorkspaceOpen(false);
      triggerToast('New conversation started!');
    } catch (err) {
      console.error('Failed to create session on backend:', err);
      setSessions(prev => [newSessionId, ...prev]);
      setActiveSession(newSessionId);
      setMessages([]);
      setActiveFile(null);
      setWorkspaceOpen(false);
    }
  };

  const switchSession = (sessionName) => { setActiveSession(sessionName); };

  const togglePinSession = (sessionName) => {
    setPinnedSessions(prev => 
      prev.includes(sessionName) ? prev.filter(s => s !== sessionName) : [...prev, sessionName]
    );
    triggerToast(pinnedSessions.includes(sessionName) ? 'Unpinned conversation' : 'Pinned conversation to top');
  };

  const deleteSession = async (sessionName) => {
    if (sessionName === 'default') { triggerToast('Cannot delete default session!'); return; }
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
        triggerToast('Session deleted.');
      } catch (err) { triggerToast('Failed to delete session.'); }
    }
  };

  const getSessionDisplayName = useCallback((sessionId) => {
    if (sessionId === 'default') return 'General Workspace';
    return sessionAliases[sessionId] || 'New Chat';
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

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setAttachedFiles(prev => [...prev, ...files.map(f => ({ name: f.name, size: f.size, type: f.type }))]);
      triggerToast(`Attached ${files.length} file(s)`);
    }
  };

  const removeAttachment = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleVoiceInput = () => {
    setShowVoiceModal(true);
    setIsRecording(true);
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsRecording(false);
        setShowVoiceModal(false);
        triggerToast('Voice transcript captured!');
      };
      recognition.onerror = () => { setIsRecording(false); setShowVoiceModal(false); };
      recognition.start();
    } else {
      setTimeout(() => {
        setInput(prev => prev ? `${prev} Build a fullstack web app with React and Node.js` : 'Build a fullstack web app with React and Node.js');
        setIsRecording(false);
        setShowVoiceModal(false);
        triggerToast('Voice transcript captured (Demo)');
      }, 3000);
    }
  };

  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    const newLogs = [...terminalLogs, { type: 'user', text: `$ ${cmd}` }];
    setTerminalInput('');

    if (cmd === 'clear') {
      setTerminalLogs([]);
      return;
    } else if (cmd === 'help') {
      newLogs.push({ type: 'output', text: 'Available commands:\n  help      - Show this manual\n  status    - Check AI sandbox status\n  build     - Run frontend & backend build checks\n  test      - Execute test suite\n  clear     - Clear terminal history' });
    } else if (cmd === 'status') {
      newLogs.push({ type: 'output', text: '✔ AI Core engine: Online (Connected to Render Backend)\n✔ Memory Pool: 2048 MB / Active\n✔ Sandbox Latency: 42ms' });
    } else if (cmd === 'build') {
      newLogs.push({ type: 'output', text: 'Compiling React components...\nBundling assets with Vite...\n✔ Build succeeded cleanly in 1.4s! 0 errors, 0 warnings.' });
    } else if (cmd === 'test') {
      newLogs.push({ type: 'output', text: 'PASS src/App.test.js\nPASS src/auth.test.js\nTest Suites: 2 passed, 2 total\nTests:       14 passed, 14 total' });
    } else {
      newLogs.push({ type: 'output', text: `bash: ${cmd}: command executed successfully.` });
    }
    setTerminalLogs(newLogs);
  };

  const startDeployment = () => {
    setIsDeploying(true);
    setDeployStep(1);
    setTimeout(() => setDeployStep(2), 1500);
    setTimeout(() => setDeployStep(3), 3000);
    setTimeout(() => {
      setDeployStep(4);
      setIsDeploying(false);
      triggerToast('Production deployment live on Vercel & Render!');
    }, 4500);
  };

  const filteredMessages = searchQuery
    ? messages.filter(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

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

    const handleExplainCode = () => {
      sendMessage(`Please explain this ${lang || 'code'} snippet in simple terms step-by-step:\n\`\`\`${lang}\n${codeString}\n\`\`\``);
    };

    const handleRunInTerminal = () => {
      setShowTerminalModal(true);
      setTerminalLogs(prev => [...prev, { type: 'user', text: `$ node temp_snippet.${lang || 'js'}` }, { type: 'output', text: `Executing code...\nProcess finished with exit code 0.` }]);
    };

    const handleDownloadCode = () => {
      const blob = new Blob([codeString], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `snippet.${lang || 'txt'}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      triggerToast('Code downloaded!');
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
            <button className="code-action-btn" onClick={handleRunInTerminal} title="Run in Sandbox Terminal">
              <Play size={12} style={{ marginRight: 4 }} /> Run
            </button>
            <button className="code-action-btn" onClick={handleExplainCode} title="Explain this code">
              <Brain size={12} style={{ marginRight: 4 }} /> Explain
            </button>
            <button className="code-action-btn" onClick={handleDownloadCode} title="Download Code file">
              <Download size={12} style={{ marginRight: 4 }} /> Download
            </button>
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

  const pinnedList = sessions.filter(s => pinnedSessions.includes(s));
  const unpinnedSessions = sessions.filter(s => !pinnedSessions.includes(s));
  const todaySessions = unpinnedSessions.filter(s => s === 'default' || s.startsWith('chat_') || s.startsWith('Today') || s === activeSession);
  const otherSessions = unpinnedSessions.filter(s => !todaySessions.includes(s));

  return (
    <div className="chat-container">

      {/* Hidden File Inputs */}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple style={{ display: 'none' }} />
      <input type="file" ref={docInputRef} accept=".pdf,.doc,.docx,.csv,.xlsx,.txt,.json,.md,.zip" onChange={handleFileUpload} multiple style={{ display: 'none' }} />
      <input type="file" ref={imgInputRef} accept="image/*" onChange={handleFileUpload} multiple style={{ display: 'none' }} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <Sparkles size={14} color="#A855F7" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. SIDEBAR (280px) ── */}
      <aside className="chat-sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon-wrapper">
            <Zap size={18} color="#A855F7" className="logo-zap" />
          </div>
          <span className="sidebar-logo-text">PSAI</span>
          <span className="sidebar-logo-badge">PRO</span>
        </div>

        <button className="sidebar-new-chat" onClick={createNewSession}>
          <Plus size={16} />
          <span>New Chat</span>
        </button>

        <button className={`sidebar-search-btn ${showSearch ? 'active' : ''}`} onClick={() => setShowSearch(!showSearch)}>
          <Search size={15} />
          <span>Search conversations</span>
          <span className="cmd-kbd">⌘K</span>
        </button>

        {/* AI Memory Box with Remembers Title */}
        <div className="sidebar-memory-box" onClick={() => setShowMemoryModal(true)}>
          <div className="memory-box-header">
            <Brain size={14} color="#A855F7" />
            <span>Remembers</span>
            <span className="memory-manage-btn">Manage</span>
          </div>
          <div className="memory-chips-mini">
            <span>• React & Node.js Developer</span>
            <span>• TenderSathi Platform</span>
            <span className="memory-time-stamp">Updated 2h ago</span>
          </div>
        </div>

        <div className="sidebar-nav-container">
          {pinnedList.length > 0 && (
            <>
              <div className="sidebar-group-label"><Pin size={11} style={{ marginRight: 4 }} /> Pinned & Favorites</div>
              <div className="sidebar-sessions">
                {pinnedList.map(session => (
                  <div key={session} className={`sidebar-session-item ${session === activeSession ? 'active' : ''}`}>
                    <button className="sidebar-session-name" onClick={() => switchSession(session)}>
                      <MessageSquare size={14} className="session-icon" />
                      <span>{getSessionDisplayName(session)}</span>
                    </button>
                    <div className="session-actions">
                      <button className="sidebar-session-action" onClick={() => togglePinSession(session)} title="Unpin"><Pin size={12} color="#A855F7" /></button>
                      <button className="sidebar-session-action" onClick={() => startRenaming(session)} title="Rename"><Edit size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="sidebar-group-label" style={{ marginTop: 12 }}>Conversations</div>
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
                      <button className="sidebar-session-action" onClick={() => togglePinSession(session)} title="Pin to top"><Pin size={12} /></button>
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

          {otherSessions.length > 0 && (
            <>
              <div className="sidebar-subgroup-label">Previous Week</div>
              <div className="sidebar-sessions">
                {otherSessions.map(session => (
                  <div key={session} className={`sidebar-session-item ${session === activeSession ? 'active' : ''}`}>
                    <button className="sidebar-session-name" onClick={() => switchSession(session)}>
                      <MessageSquare size={14} className="session-icon" />
                      <span>{getSessionDisplayName(session)}</span>
                    </button>
                    <div className="session-actions">
                      <button className="sidebar-session-action" onClick={() => togglePinSession(session)} title="Pin"><Pin size={12} /></button>
                      <button className="sidebar-session-action" onClick={() => startRenaming(session)} title="Rename"><Edit size={12} /></button>
                      <button className="sidebar-session-action danger" onClick={() => deleteSession(session)} title="Delete"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-quick-nav">
            <button className="sidebar-nav-item" onClick={() => setShowProductivityDrawer(true)}>
              <Bookmark size={15} />
              <span>Prompt Library</span>
            </button>
            <button className="sidebar-nav-item" onClick={() => setShowSettingsModal(true)}>
              <Settings size={15} />
              <span>Settings</span>
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
                <h2>{getGreeting()}</h2>
                <p className="header-subtitle">Welcome back, {currentUser?.name?.split(' ')[0] || 'Developer'}</p>
              </div>
            </div>
            
            <div className="header-right-group">
              <button className="header-pill-btn" onClick={() => setShowSearch(!showSearch)} title="Search">
                <Search size={14} />
                <span>Search</span>
              </button>

              {/* Multi-Model Selector Pill */}
              <div style={{ position: 'relative' }}>
                <div className="model-selector-pill" onClick={() => setShowModelDropdown(!showModelDropdown)}>
                  <Cpu size={14} className="model-icon" />
                  <span>{selectedModel} ▼</span>
                </div>

                {showModelDropdown && (
                  <div className="model-dropdown-menu">
                    {AVAILABLE_MODELS.map(m => (
                      <div 
                        key={m.id} 
                        className={`model-option-item ${m.id === selectedModel ? 'active' : ''}`}
                        onClick={() => { setSelectedModel(m.id); setShowModelDropdown(false); triggerToast(`Model switched to ${m.name}`); }}
                      >
                        <div className="model-opt-header">
                          <span className="model-opt-name">{m.name}</span>
                          <span className="model-opt-badge">{m.reasoning}</span>
                        </div>
                        <p className="model-opt-desc">{m.desc}</p>
                        <div className="model-opt-metrics">
                          <span>⚡ {m.latency}</span>
                          <span>💬 {m.context}</span>
                          <span>💰 {m.cost}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="header-icon-btn" onClick={() => { navigator.clipboard.writeText(window.location.href); triggerToast('Workspace link copied to clipboard!'); }} title="Share Workspace">
                <Share2 size={15} />
              </button>

              <button className="header-icon-btn" onClick={() => exportChat('txt')} title="Export Workspace">
                <Download size={15} />
              </button>

              <button className="header-icon-btn notification-btn" onClick={() => setShowNotificationsDrawer(!showNotificationsDrawer)} title="Notifications">
                <Bell size={15} />
                <span className="notif-badge" />
              </button>

              {/* Notifications Drawer */}
              {showNotificationsDrawer && (
                <div className="notifications-drawer">
                  <div className="drawer-header">
                    <h3>Notifications</h3>
                    <button className="drawer-close" onClick={() => setShowNotificationsDrawer(false)}><X size={14} /></button>
                  </div>
                  <div className="drawer-body">
                    <div className="notif-item">
                      <Sparkles size={14} color="#A855F7" />
                      <div>
                        <p className="notif-title">PSAI 3.5 Engine Updated</p>
                        <p className="notif-time">2 mins ago · Reduced latency by 40%</p>
                      </div>
                    </div>
                    <div className="notif-item">
                      <ShieldCheck size={14} color="#22c55e" />
                      <div>
                        <p className="notif-title">Production Server Healthy</p>
                        <p className="notif-time">1 hour ago · Render & Atlas online</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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

          {/* Chat Messages & Stacked Welcome Hero Content Area */}
          <div className="chat-box" ref={chatBoxRef}>
            {loadingMessages && messages.length === 0 && (
              <div className="welcome-message"><div className="loading-dots"><span /><span /><span /></div></div>
            )}

            {/* STACKED WELCOME HERO SECTION */}
            {!loadingMessages && messages.length === 0 && (
              <div className="welcome-hero-section compact stacked">
                <h1 className="hero-title stacked-main">{getGreeting()}</h1>
                <h2 className="hero-subtitle stacked-sub">Welcome back, {currentUser?.name?.split(' ')[0] || 'Developer'}</h2>
                <p className="hero-description compact" style={{ marginTop: 4 }}>What would you like to build today?</p>

                <div className="quick-pills-container compact">
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

                <div className="feature-cards-grid compact">
                  {FEATURE_CARDS.map((card) => {
                    const CardIcon = card.icon;
                    return (
                      <div 
                        key={card.id} 
                        className="feature-card compact live-card"
                        onClick={() => sendMessage(card.prompt)}
                      >
                        <div className="card-top-row">
                          <div className="card-icon-box" style={{ background: card.iconBg, color: card.iconColor }}>
                            <CardIcon size={18} className="card-animated-icon" />
                          </div>
                          <span className={`card-badge-pill ${card.badgeClass}`}>{card.badge}</span>
                        </div>
                        <h3 className="card-title">{card.title}</h3>
                        <div className="card-subtitle-row">
                          <span>{card.subtitle}</span>
                          <span className="card-stats-tag">{card.stats}</span>
                        </div>
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

            {/* Messages Stream */}
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
                  
                  {/* Rich Actions Toolbar for Bot & User */}
                  <div className="message-footer">
                    <span className="message-timestamp">{formatTimestamp(msg.timestamp)}</span>
                    
                    <CopyToClipboard text={msg.text} onCopy={() => triggerToast('Message copied to clipboard')}>
                      <button className="msg-action-btn" title="Copy text"><Copy size={12} /></button>
                    </CopyToClipboard>

                    {msg.type === 'bot' && (
                      <>
                        <button className={`msg-action-btn ${messageReactions[i] === 'like' ? 'active' : ''}`} onClick={() => toggleReaction(i, 'like')} title="Helpful">
                          <ThumbsUp size={12} />
                        </button>
                        <button className={`msg-action-btn ${messageReactions[i] === 'dislike' ? 'active' : ''}`} onClick={() => toggleReaction(i, 'dislike')} title="Needs improvement">
                          <ThumbsDown size={12} />
                        </button>
                        <button className="msg-action-btn" onClick={() => speakMessage(msg.text)} title="Read Aloud">
                          <Volume2 size={12} />
                        </button>
                        <button className="msg-action-btn" onClick={regenerateResponse} title="Regenerate response">
                          <RotateCcw size={12} />
                        </button>
                      </>
                    )}

                    {msg.type === 'user' && (
                      <button className="msg-action-btn" onClick={() => editUserPrompt(msg.text)} title="Edit prompt">
                        <Edit size={12} />
                      </button>
                    )}
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
                    <span className="thinking-label">PSAI is synthesizing code...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── 3. UPGRADED GLOWING COMPOSER ── */}
          <div className="floating-composer-wrapper">
            
            {/* Conversation Suggestions Chips */}
            <div className="suggestions-chips-row">
              {CONVERSATION_SUGGESTIONS.map((sug, idx) => (
                <button key={idx} className="suggestion-chip" onClick={() => sendMessage(sug.prompt)}>
                  <span>✨ {sug.label}</span>
                </button>
              ))}
            </div>

            <div className="floating-composer-glass glowing-border">
              
              {/* Attachment Chips */}
              {attachedFiles.length > 0 && (
                <div className="attachment-chips-row">
                  {attachedFiles.map((file, idx) => (
                    <div key={idx} className="attachment-chip">
                      <Paperclip size={12} />
                      <span className="chip-name">{file.name}</span>
                      <button className="chip-remove" onClick={() => removeAttachment(idx)}><X size={12} /></button>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                ref={textareaRef}
                className="composer-textarea"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask PSAI anything... (/ for commands, @ for context)"
                disabled={loading}
              />

              <div className="composer-bottom-bar">
                <div className="composer-left-tools">
                  <button className="composer-tool-btn" title="Attach Files (PDF, DOCX, CSV, ZIP)" onClick={() => docInputRef.current?.click()}>
                    <Paperclip size={15} />
                  </button>
                  <button className="composer-tool-btn" title="Upload Images (Vision OCR)" onClick={() => imgInputRef.current?.click()}>
                    <ImageIcon size={15} />
                  </button>
                  <button className={`composer-tool-btn ${isRecording ? 'recording' : ''}`} title="Voice Mode" onClick={handleVoiceInput}>
                    <Mic size={15} />
                  </button>

                  <div className="composer-vdivider" />

                  {/* Mode Toggles */}
                  <button className={`composer-toggle-chip ${webSearchEnabled ? 'active' : ''}`} onClick={() => { setWebSearchEnabled(!webSearchEnabled); triggerToast(webSearchEnabled ? 'Web search disabled' : 'Live Web Search enabled'); }}>
                    <Globe size={13} /> <span>Web Search</span>
                  </button>
                  <button className={`composer-toggle-chip ${reasoningEnabled ? 'active' : ''}`} onClick={() => { setReasoningEnabled(!reasoningEnabled); triggerToast(reasoningEnabled ? 'Deep reasoning disabled' : 'Deep Reasoning enabled'); }}>
                    <Brain size={13} /> <span>Reasoning</span>
                  </button>
                  <button className={`composer-toggle-chip ${artifactsEnabled ? 'active' : ''}`} onClick={() => { setArtifactsEnabled(!artifactsEnabled); triggerToast(artifactsEnabled ? 'Artifacts auto-open disabled' : 'Artifacts Workspace enabled'); }}>
                    <Layers size={13} /> <span>Artifacts</span>
                  </button>
                  <button className={`composer-toggle-chip ${visionEnabled ? 'active' : ''}`} onClick={() => { setVisionEnabled(!visionEnabled); triggerToast(visionEnabled ? 'Vision OCR disabled' : 'Vision OCR enabled'); }}>
                    <Eye size={13} /> <span>Vision</span>
                  </button>
                </div>

                <div className="composer-right-tools">
                  <button className="magic-ai-btn" title="Magic AI Enhance" onClick={() => setInput(prev => prev ? `Optimize and refactor this code cleanly with best practices:\n${prev}` : 'Generate an enterprise React & Node.js architecture blueprint.')}>
                    <Sparkles size={14} className="magic-sparkle-icon" />
                    <span>Magic</span>
                  </button>

                  <button 
                    className="composer-send-btn"
                    onClick={() => sendMessage()}
                    disabled={loading || (!input.trim() && attachedFiles.length === 0)}
                    title="Send Prompt"
                  >
                    {loading ? <div className="send-spinner" /> : <Send size={15} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="composer-footer-text">
              {selectedModel} · Shift+Enter for newline · ⌘K for shortcuts
            </div>
          </div>
        </div>

        {/* ── 4. RIGHT FLOATING TOOLBAR WITH HOVER TOOLTIPS ── */}
        <div className="right-floating-toolbar">
          <div className="toolbar-tooltip-item" data-tooltip="Search Chat">
            <button className="floating-tool-item" onClick={() => setShowSearch(!showSearch)}>
              <Search size={16} />
            </button>
          </div>
          <div className="toolbar-tooltip-item" data-tooltip="Files Workspace">
            <button className="floating-tool-item" onClick={() => { if (activeFile) setWorkspaceOpen(!workspaceOpen); else triggerToast('Generate code first to inspect workspace.'); }}>
              <FileText size={16} />
            </button>
          </div>
          <div className="toolbar-tooltip-item" data-tooltip="Sandbox Console">
            <button className="floating-tool-item" onClick={() => setShowTerminalModal(!showTerminalModal)}>
              <Terminal size={16} />
            </button>
          </div>
          <div className="toolbar-tooltip-item" data-tooltip="Live Preview">
            <button className={`floating-tool-item ${workspaceOpen ? 'active' : ''}`} onClick={() => { if (activeFile) setWorkspaceOpen(!workspaceOpen); else triggerToast('Generate HTML/JS code first to preview!'); }}>
              <Eye size={16} />
            </button>
          </div>
          <div className="toolbar-tooltip-item" data-tooltip="Cloud Deploy">
            <button className="floating-tool-item deploy-tool" onClick={() => setShowDeployModal(true)}>
              <Rocket size={16} />
            </button>
          </div>
        </div>

        {/* ── 5. TERMINAL MODAL ── */}
        {showTerminalModal && (
          <div className="modal-overlay">
            <div className="modal-box terminal-modal">
              <div className="terminal-header">
                <div className="terminal-dots">
                  <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
                </div>
                <div className="terminal-title"><Terminal size={14} style={{ marginRight: 6 }} /> PSAI Virtual Sandbox Terminal</div>
                <button className="modal-close-btn" onClick={() => setShowTerminalModal(false)}><X size={16} /></button>
              </div>
              <div className="terminal-body">
                {terminalLogs.map((log, index) => (
                  <div key={index} className={`terminal-line ${log.type}`}>
                    <pre>{log.text}</pre>
                  </div>
                ))}
              </div>
              <form onSubmit={handleTerminalSubmit} className="terminal-input-row">
                <span className="prompt-symbol">$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="Type a command (e.g. help, status, build, test, clear)..."
                  className="terminal-input"
                  autoFocus
                />
              </form>
            </div>
          </div>
        )}

        {/* ── 6. VOICE MODE MODAL ── */}
        {showVoiceModal && (
          <div className="modal-overlay">
            <div className="modal-box voice-modal">
              <div className="voice-modal-body">
                <div className="voice-wave-container">
                  <div className="wave-bar" /><div className="wave-bar" /><div className="wave-bar" /><div className="wave-bar" /><div className="wave-bar" />
                </div>
                <h3>Listening to Harshit...</h3>
                <p className="voice-status">Speak naturally. PSAI will transcribe and answer in realtime.</p>
                <button className="voice-stop-btn" onClick={() => { setIsRecording(false); setShowVoiceModal(false); triggerToast('Voice Mode stopped.'); }}>
                  <StopCircle size={18} style={{ marginRight: 6 }} /> End Voice Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 7. MEMORY MODAL ── */}
        {showMemoryModal && (
          <div className="modal-overlay">
            <div className="modal-box memory-modal">
              <div className="modal-header">
                <h3><Brain size={18} color="#A855F7" style={{ marginRight: 8 }} /> PSAI AI Memory Transparency</h3>
                <button className="modal-close-btn" onClick={() => setShowMemoryModal(false)}><X size={16} /></button>
              </div>
              <div className="modal-body">
                <p className="memory-desc">PSAI transparently remembers key contextual facts to tailor engineering responses to your projects.</p>
                <div className="memory-list">
                  <div className="memory-item"><Check size={14} color="#22c55e" /> <span>User Name: <strong>{currentUser?.name || 'Harshit'}</strong></span></div>
                  <div className="memory-item"><Check size={14} color="#22c55e" /> <span>Role: <strong>Fullstack React & Node.js Engineer</strong></span></div>
                  <div className="memory-item"><Check size={14} color="#22c55e" /> <span>Active Workspace: <strong>Psai-Chatbot Project</strong></span></div>
                  <div className="memory-item"><Check size={14} color="#22c55e" /> <span>Project Context: <strong>TenderSathi Platform Backend</strong></span></div>
                </div>
                <button className="deploy-start-btn" style={{ marginTop: 20 }} onClick={() => { setShowMemoryModal(false); triggerToast('Memory preferences updated!'); }}>
                  Manage & Reset Memories
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 8. PRODUCTIVITY & PROMPT LIBRARY DRAWER ── */}
        {showProductivityDrawer && (
          <div className="modal-overlay">
            <div className="modal-box productivity-modal">
              <div className="modal-header">
                <h3><Bookmark size={18} style={{ marginRight: 8 }} /> Prompt Library & Templates</h3>
                <button className="modal-close-btn" onClick={() => setShowProductivityDrawer(false)}><X size={16} /></button>
              </div>
              <div className="modal-body">
                <div className="template-list">
                  {PROMPT_TEMPLATES.map((tmpl, idx) => (
                    <div key={idx} className="template-item" onClick={() => { setInput(tmpl.prompt); setShowProductivityDrawer(false); triggerToast(`Loaded "${tmpl.title}" template`); }}>
                      <p className="tmpl-title">{tmpl.title}</p>
                      <p className="tmpl-desc">{tmpl.prompt}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 9. DEPLOYMENT MODAL ── */}
        {showDeployModal && (
          <div className="modal-overlay">
            <div className="modal-box deploy-modal">
              <div className="modal-header">
                <h3><Rocket size={18} color="#F59E0B" style={{ marginRight: 8 }} /> Cloud Deployment Center</h3>
                <button className="modal-close-btn" onClick={() => setShowDeployModal(false)}><X size={16} /></button>
              </div>
              <div className="modal-body">
                <p className="deploy-desc">Deploy your fullstack application directly to Vercel (Frontend) and Render (Backend) containers.</p>
                
                <div className="deploy-steps">
                  <div className={`deploy-step-item ${deployStep >= 1 ? 'active' : ''} ${deployStep > 1 ? 'completed' : ''}`}>
                    <span className="step-num">1</span>
                    <div>
                      <p className="step-title">Compile TypeScript & Bundle</p>
                      <p className="step-sub">Optimizing assets & verifying build scripts</p>
                    </div>
                  </div>
                  <div className={`deploy-step-item ${deployStep >= 2 ? 'active' : ''} ${deployStep > 2 ? 'completed' : ''}`}>
                    <span className="step-num">2</span>
                    <div>
                      <p className="step-title">Run Automated Tests</p>
                      <p className="step-sub">Validating auth routes & database connections</p>
                    </div>
                  </div>
                  <div className={`deploy-step-item ${deployStep >= 3 ? 'active' : ''} ${deployStep > 3 ? 'completed' : ''}`}>
                    <span className="step-num">3</span>
                    <div>
                      <p className="step-title">Provision Edge Containers</p>
                      <p className="step-sub">Publishing to psai-chatbot.vercel.app</p>
                    </div>
                  </div>
                </div>

                {deployStep === 4 && (
                  <div className="deploy-success-box">
                    <ShieldCheck size={24} color="#22c55e" />
                    <div>
                      <p className="success-title">Successfully Deployed to Production!</p>
                      <a href="https://psai-chatbot.vercel.app" target="_blank" rel="noopener noreferrer" className="success-link">https://psai-chatbot.vercel.app</a>
                    </div>
                  </div>
                )}

                <div className="deploy-actions">
                  {deployStep < 4 ? (
                    <button className="deploy-start-btn" onClick={startDeployment} disabled={isDeploying}>
                      {isDeploying ? <><RefreshCw size={16} className="spin-icon" style={{ marginRight: 8 }} /> Deploying...</> : 'Trigger Production Deploy'}
                    </button>
                  ) : (
                    <button className="deploy-start-btn completed" onClick={() => setDeployStep(0)}>
                      Re-deploy Workspace
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 10. SETTINGS MODAL ── */}
        {showSettingsModal && (
          <div className="modal-overlay">
            <div className="modal-box settings-modal">
              <div className="modal-header">
                <h3><Sliders size={18} style={{ marginRight: 8 }} /> PSAI Preferences</h3>
                <button className="modal-close-btn" onClick={() => setShowSettingsModal(false)}><X size={16} /></button>
              </div>
              <div className="modal-body">
                <div className="setting-row">
                  <div>
                    <p className="setting-title">Temperature (Creativity)</p>
                    <p className="setting-sub">Lower for precision code, higher for creative ideas</p>
                  </div>
                  <span className="setting-val">{settingsConfig.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settingsConfig.temperature}
                  onChange={(e) => setSettingsConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="setting-range"
                />

                <div className="setting-row" style={{ marginTop: 20 }}>
                  <div>
                    <p className="setting-title">Auto-save Conversation History</p>
                    <p className="setting-sub">Automatically sync session data to MongoDB Atlas</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsConfig.autoSave}
                    onChange={(e) => setSettingsConfig(prev => ({ ...prev, autoSave: e.target.checked }))}
                    className="setting-checkbox"
                  />
                </div>

                <div style={{ marginTop: 20 }}>
                  <p className="setting-title" style={{ marginBottom: 6 }}>Custom System Prompt</p>
                  <textarea
                    value={settingsConfig.systemPrompt}
                    onChange={(e) => setSettingsConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                    className="setting-textarea"
                    rows={3}
                  />
                </div>

                <button className="deploy-start-btn" style={{ marginTop: 20 }} onClick={() => { setShowSettingsModal(false); triggerToast('Settings saved successfully!'); }}>
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 11. HELP & DOCS MODAL ── */}
        {showHelpModal && (
          <div className="modal-overlay">
            <div className="modal-box help-modal">
              <div className="modal-header">
                <h3><HelpCircle size={18} style={{ marginRight: 8 }} /> PSAI Guide & Shortcuts</h3>
                <button className="modal-close-btn" onClick={() => setShowHelpModal(false)}><X size={16} /></button>
              </div>
              <div className="modal-body">
                <h4>Keyboard Shortcuts</h4>
                <div className="shortcut-list">
                  <div className="shortcut-item"><span>Send message</span><kbd>Enter</kbd></div>
                  <div className="shortcut-item"><span>New line</span><kbd>Shift + Enter</kbd></div>
                  <div className="shortcut-item"><span>Search chat</span><kbd>⌘K</kbd></div>
                </div>

                <h4 style={{ marginTop: 20 }}>Features Overview</h4>
                <p className="help-text">
                  • <strong>Workspace Preview:</strong> Generated HTML/CSS/JS blocks can be previewed live in the right panel.<br />
                  • <strong>Virtual Terminal:</strong> Open the terminal icon to run sandbox checks.<br />
                  • <strong>Model Selection:</strong> Switch AI models at any time using the header pill.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── 12. WORKSPACE PANEL (AI Artifacts & Tabs) ── */}
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
                  <Eye size={13} style={{ marginRight: 4 }} /> Artifact Preview
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

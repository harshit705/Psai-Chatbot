// API Configuration - OpenRouter API (proxied securely through backend)
const config = {
  MODEL: process.env.REACT_APP_MODEL || 'openai/gpt-3.5-turbo',
  // API calls go through the secure backend proxy at /api/chat/generate
  // The OpenRouter API key is stored only on the backend (Render env vars)
};

export default config;

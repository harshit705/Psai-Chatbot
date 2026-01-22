// API Configuration - OpenRouter API
const config = {
  API_KEY: process.env.REACT_APP_EXTERNAL_API_KEY,
  API_URL: process.env.REACT_APP_EXTERNAL_API_URL || "https://openrouter.ai/api/v1/chat/completions",
  MODEL: process.env.REACT_APP_MODEL || "openai/gpt-3.5-turbo"
};

// Validate required environment variables
if (!config.API_KEY) {
  console.error('❌ Error: REACT_APP_EXTERNAL_API_KEY is not set in .env.local');
  console.error('Please add your OpenRouter API key to frontend/.env.local');
}

export default config;

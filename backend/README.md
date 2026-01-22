# Backend Server

Express server with MongoDB and JWT authentication.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/psai-chatbot
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   ```

3. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Chat
- `GET /api/chat/sessions` - Get all chat sessions
- `GET /api/chat/messages/:sessionName` - Get messages for a session
- `POST /api/chat/messages` - Save messages
- `POST /api/chat/sessions` - Create new session
- `DELETE /api/chat/sessions/:sessionName` - Delete session
- `DELETE /api/chat/messages/:sessionName` - Clear chat

## Project Structure

```
backend/
├── server.js              # Express server entry point
├── models/
│   ├── User.js            # User model
│   └── Chat.js            # Chat model
├── routes/
│   ├── auth.js            # Authentication routes
│   └── chat.js            # Chat routes
├── middleware/
│   └── authMiddleware.js  # JWT authentication middleware
├── .env                   # Environment variables
└── package.json           # Dependencies
```

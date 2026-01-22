# PSAI Chatbot 🤖

A full-stack AI chatbot application with user authentication, email verification, password reset, and real-time chat functionality. Built with React 18 frontend and Express.js backend.

## ✨ Features

### 🔐 Authentication
- ✅ User Registration with validation
- ✅ User Login with JWT tokens
- ✅ Password Reset with Email Verification
  - 6-digit OTP sent to email
  - Code verification before password reset
  - New password + re-enter password fields
- ✅ Profile Management
  - Edit full name
  - Upload profile picture (with image compression)
  - View email (read-only)
- ✅ Remember me functionality

### 💬 Chat Features
- ✅ Real-time chat with AI (OpenRouter API)
- ✅ Multiple chat sessions
- ✅ Chat history persistence
- ✅ Export chats as TXT or JSON
- ✅ Search messages
- ✅ Dark mode toggle
- ✅ Message timestamps
- ✅ Copy message to clipboard

### 🎨 UI/UX
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Profile avatar display
- ✅ Loading states
- ✅ Error handling
- ✅ Success notifications

### ⚡ Performance
- ✅ Optimized bundle (no React Strict Mode in dev)
- ✅ Image compression for profile uploads
- ✅ Lazy loading support
- ✅ DNS prefetch for external APIs

## 📁 Project Structure

```
psai-chatbot/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js          # Authentication routes
│   │   │   └── chat.js          # Chat routes
│   │   ├── models/
│   │   │   ├── User.js          # User schema
│   │   │   └── Chat.js          # Chat schema
│   │   ├── middleware/
│   │   │   └── authMiddleware.js # JWT verification
│   │   ├── services/
│   │   │   └── emailService.js  # Email sending
│   │   ├── app.js
│   │   └── index.js
│   ├── .env                     # Environment variables (ADD TO .gitignore)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── ForgotPassword.js
│   │   │   └── ProfileEdit.js
│   │   ├── services/
│   │   │   └── api.js           # Axios API client
│   │   ├── App.js               # Main app component
│   │   └── index.js
│   ├── .env.local               # Frontend env (ADD TO .gitignore)
│   └── package.json
│
├── docs/                        # Documentation
├── .gitignore
├── README.md
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ 
- npm or yarn
- MongoDB Atlas account
- Gmail account (for email service)

### Installation

1. **Clone repository**
```bash
git clone <your-repo-url>
cd psai-chatbot
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Setup Environment Variables**

**Backend (.env)**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
PORT=5000
JWT_SECRET=your-random-secret-key-here
NODE_ENV=development

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# External API
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
OPENROUTER_MODEL=openai/gpt-3.5-turbo
```

**Frontend (.env.local)**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_EXTERNAL_API_KEY=your-openrouter-key
REACT_APP_MODEL=openai/gpt-3.5-turbo
GENERATE_SOURCEMAP=false
```

### Running the Application

**Terminal 1 - Backend**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm start
```

Access the app at `http://localhost:3000`

## 📚 API Endpoints

### Authentication Routes
```
POST   /api/auth/register           - Create new account
POST   /api/auth/login              - Login user
GET    /api/auth/me                 - Get current user
POST   /api/auth/forgot-password    - Request password reset
POST   /api/auth/verify-reset-code  - Verify reset code
POST   /api/auth/reset-password     - Reset password
POST   /api/auth/update-profile     - Update user profile
```

### Chat Routes
```
GET    /api/chat/sessions           - Get all chat sessions
POST   /api/chat/sessions           - Create new session
GET    /api/chat/messages/:session  - Get messages
POST   /api/chat/messages           - Save messages
DELETE /api/chat/messages/:session  - Clear chat
DELETE /api/chat/sessions/:session  - Delete session
```

## 🔑 Key Implementation Details

### Password Reset Flow
1. User requests password reset with email
2. Backend generates 6-digit code and sends via email
3. User enters code - verified against database
4. If valid, user enters new password + re-enter password
5. Backend verifies code again and updates password

### Profile Picture Upload
- Maximum size: 2MB
- Automatically compressed to 500x500px
- Stored as base64 in database
- JPEG quality: 0.8

### Email Service
- Uses Gmail SMTP
- Requires app-specific password (not regular Gmail password)
- Sends welcome email on registration
- Sends password reset code on forgot password

### Security
- Passwords hashed with bcryptjs (10 rounds)
- JWT tokens expire in 7 days
- Reset codes expire in 1 hour
- Sensitive data in environment variables only

## 📦 Build & Deploy

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy the build/ folder
```

### Backend (Render/Heroku)
```bash
cd backend
npm start
# Set environment variables in platform dashboard
```

## 🧪 Testing

### Test Password Reset
1. Go to Forgot Password
2. Enter email
3. Check Gmail for reset code
4. Enter code (must be exact 6 digits)
5. Enter new password (min 6 chars)
6. Login with new password

### Test Profile Upload
1. Login
2. Click on profile menu
3. Click "Edit Profile"
4. Upload image (JPG, PNG, GIF)
5. Image auto-compresses and displays
6. Save changes

## ⚠️ Important Before GitHub

### ✅ Files to Exclude (.gitignore updated)
- `backend/.env` - Database credentials
- `frontend/.env.local` - API keys
- `node_modules/` - Dependencies
- `.DS_Store`, `Thumbs.db` - OS files
- `build/`, `dist/` - Build outputs

### ✅ Never Commit
```
API_KEYS
PASSWORDS
EMAIL_ADDRESSES
JWT_SECRETS
DATABASE_CREDENTIALS
```

### ✅ For Public GitHub
1. Use `.env.example` files
2. Update README with setup instructions ✅
3. Add comprehensive comments in code
4. Remove sensitive data from commits
5. Use environment variables for everything

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check connection in backend
cd backend
npm run test-connection
```

### Email Not Sending
- Enable "Less secure apps" or use App Password (Gmail)
- Check `.env` has correct EMAIL_USER and EMAIL_PASS
- Restart backend after changing email config

### Port 5000 Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Profile Image Not Uploading
- Check image size < 2MB
- Ensure Express limit is set to 50mb
- Check browser console for errors

## 📝 Environment Variables Reference

| Variable | Required | Example |
|----------|----------|---------|
| MONGODB_URI | ✅ | mongodb+srv://... |
| JWT_SECRET | ✅ | random-secret-string |
| EMAIL_USER | ✅ | your-email@gmail.com |
| EMAIL_PASS | ✅ | app-specific-password |
| FRONTEND_URL | ❌ | http://localhost:3000 |
| REACT_APP_API_URL | ✅ | http://localhost:5000/api |

## 🔗 Useful Links

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [OpenRouter API](https://openrouter.ai)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [JWT.io](https://jwt.io)

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🤝 Contributing

Contributions are welcome! Please create an issue or pull request.

---

**Last Updated:** December 18, 2025  
**Built with ❤️ for AI Chat**

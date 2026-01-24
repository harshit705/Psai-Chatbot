# PSAI Chatbot

> A sophisticated full-stack AI chatbot application with secure user authentication, real-time messaging, and advanced chat management features.

![React](https://img.shields.io/badge/React-18.2-blue?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

---

## 🎯 Overview

PSAI Chatbot is an enterprise-grade conversational AI platform designed to deliver secure, scalable, and user-friendly chat experiences. It combines React's modern UI capabilities with Express.js backend robustness and MongoDB's flexible data management.

**Key Highlights:**
- 🔐 Bank-level security with JWT authentication
- ⚡ High-performance real-time messaging
- 📱 Fully responsive design
- 🌙 Dark mode support
- 🚀 Production-ready with comprehensive error handling

---

## ✨ Features

### 🔐 Authentication & Security
- User registration with comprehensive validation
- Secure JWT-based authentication
- Password reset with OTP verification
- Email-based account recovery
- Session management with "Remember Me" option
- Password hashing with bcryptjs

### 💬 Chat Capabilities
- Real-time AI conversations using OpenRouter API
- Multiple independent chat sessions
- Full chat history persistence
- Advanced message search functionality
- Export conversations (TXT & JSON formats)
- Message copying to clipboard
- Per-message timestamps

### 👤 User Profile Management
- Editable user profiles
- Profile picture upload with automatic compression
- Email verification system
- Secure credential management

### 🎨 User Interface
- Responsive mobile-first design
- Dark/Light mode toggle
- Intuitive navigation
- Loading indicators & animations
- Comprehensive error notifications
- Toast notifications for user feedback

### ⚙️ Performance & Optimization
- Lazy component loading
- Image compression for uploads
- Optimized React bundle
- DNS prefetching for external APIs

---

## 🛠 Technology Stack

### Frontend
- **React** 18.2 - UI library
- **Axios** - HTTP client
- **CSS3** - Styling with responsive design
- **localStorage** - Client-side data persistence

### Backend
- **Node.js** - Runtime environment
- **Express.js** 5.2 - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** 8.20 - ODM
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **CORS** - Cross-origin resource handling
- **dotenv** - Environment variables

### External Services
- **MongoDB Atlas** - Database hosting
- **OpenRouter API** - AI model access
- **Gmail SMTP** - Email delivery

---

## 📋 Prerequisites

Ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **Git** (v2.30.0 or higher)

**Accounts Required:**
- MongoDB Atlas account (free tier available)
- Gmail account with 2FA enabled
- OpenRouter account with API credits

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/psai-chatbot.git
cd psai-chatbot
```

### Step 2: Install Root Dependencies

```bash
npm install
```

This will set up the necessary development tools at the root level.

### Step 3: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Step 4: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Alternative: One-Command Installation

```bash
npm run install:all
```

---

## ⚙️ Configuration

### Backend Configuration

1. **Create Environment File:**

```bash
cd backend
cp .env.example .env
```

2. **Configure `.env` with your credentials:**

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/psai-chatbot?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=production

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secure-random-string-min-32-characters

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# AI API
OPENROUTER_API_KEY=your-api-key
```

**How to set up Gmail App Password:**
1. Enable 2-Factor Authentication in Gmail settings
2. Visit: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows"
4. Copy the generated 16-character password

### Frontend Configuration

1. **Create Environment File:**

```bash
cd frontend
cp .env.example .env
```

2. **Configure `.env`:**

```env
# API Endpoint
REACT_APP_API_URL=http://localhost:5000/api

# For production deployment:
# REACT_APP_API_URL=https://your-backend-domain.com/api

# AI API Configuration
REACT_APP_EXTERNAL_API_KEY=your-openrouter-api-key
REACT_APP_EXTERNAL_API_URL=https://openrouter.ai/api/v1/chat/completions
REACT_APP_MODEL=openai/gpt-3.5-turbo
```

---

## 🎯 Running the Application

### Development Mode (Full Stack)

```bash
npm run dev
```

This starts both frontend (port 3000) and backend (port 5000) concurrently.

### Development Mode (Separate Terminals)

**Terminal 1 - Backend:**
```bash
npm run backend:dev
```

**Terminal 2 - Frontend:**
```bash
npm run frontend
```

### Production Build

```bash
npm run build
```

This creates optimized production builds in:
- `frontend/build/` - React static files
- Backend is ready for deployment

---

## 🌐 Deployment

### Deploying to Render

**Backend Deployment:**

1. Push code to GitHub
2. Visit https://render.com
3. Create new "Web Service"
4. Connect GitHub repository
5. Configure settings:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `node src/index.js`
   - **Environment Variables:** Add all from `.env`

6. Set PORT to `10000` (Render default)
7. Deploy

**Frontend Deployment (Vercel):**

1. Visit https://vercel.com
2. Import GitHub repository
3. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `./frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Environment Variables:**
     ```
     REACT_APP_API_URL=https://your-render-backend.onrender.com/api
     REACT_APP_EXTERNAL_API_KEY=your-api-key
     REACT_APP_EXTERNAL_API_URL=https://openrouter.ai/api/v1/chat/completions
     REACT_APP_MODEL=openai/gpt-3.5-turbo
     ```

4. Deploy

### Deploying to Vercel (Full Stack)

For full-stack deployment on Vercel:

1. Move backend to `api/` directory
2. Configure `vercel.json`:
```json
{
  "buildCommand": "npm install && cd frontend && npm run build",
  "outputDirectory": "frontend/build",
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "JWT_SECRET": "@jwt_secret"
  }
}
```

---

## 📁 Project Structure

```
psai-chatbot/
│
├── 📄 package.json                 # Root configuration
├── 📄 README.md                    # This file
├── 📄 .gitignore                   # Git ignore rules
├── 📄 .env.example                 # Example environment variables
│
├── backend/                        # Express.js server
│   ├── src/
│   │   ├── index.js               # Entry point
│   │   ├── app.js                 # Express app configuration
│   │   ├── middleware/
│   │   │   └── authMiddleware.js  # JWT authentication
│   │   ├── models/
│   │   │   ├── User.js            # User schema
│   │   │   └── Chat.js            # Chat/Message schema
│   │   ├── routes/
│   │   │   ├── auth.js            # Auth endpoints
│   │   │   └── chat.js            # Chat endpoints
│   │   └── services/
│   │       └── emailService.js    # Email functionality
│   ├── .env.example               # Backend env template
│   ├── package.json               # Backend dependencies
│   └── README.md                  # Backend documentation
│
├── frontend/                       # React application
│   ├── public/
│   │   ├── index.html             # HTML entry point
│   │   ├── manifest.json          # PWA manifest
│   │   └── favicon.ico            # App icon
│   ├── src/
│   │   ├── index.js               # React entry
│   │   ├── App.js                 # Main component
│   │   ├── App.css                # App styles
│   │   ├── config.js              # Configuration
│   │   ├── components/
│   │   │   ├── Login.js           # Login page
│   │   │   ├── Register.js        # Registration page
│   │   │   ├── ForgotPassword.js  # Password recovery
│   │   │   ├── ProfileEdit.js     # Profile management
│   │   │   └── Auth.css           # Auth styles
│   │   ├── services/
│   │   │   └── api.js             # API client
│   │   ├── styles/
│   │   │   └── ProfileEdit.css    # Component styles
│   │   └── utils/
│   │       └── lazyComponents.js  # Code splitting
│   ├── .env.example               # Frontend env template
│   ├── package.json               # Frontend dependencies
│   └── README.md                  # Frontend documentation
│
└── public/                        # Static assets
    └── electron.js                # Electron support

```

---

## 📡 API Documentation

### Base URL
- **Development:** `http://localhost:5000/api`
- **Production:** `https://your-domain.com/api`

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Chat Endpoints

#### Get All Chat Sessions
```http
GET /chat/sessions
Authorization: Bearer <token>
```

#### Get Messages for Session
```http
GET /chat/messages/:sessionName
Authorization: Bearer <token>
```

#### Save Messages
```http
POST /chat/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionName": "my-session",
  "messages": [...]
}
```

#### Create New Session
```http
POST /chat/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionName": "new-chat"
}
```

#### Delete Session
```http
DELETE /chat/sessions/:sessionName
Authorization: Bearer <token>
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Backend (5000) in use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

**Frontend (3000) in use:**
```bash
npm start -- --port 3001
```

### MongoDB Connection Issues

1. Verify connection string in `.env`
2. Check MongoDB Atlas network access (whitelist your IP)
3. Ensure credentials are correct
4. Test connection:
   ```bash
   cd backend
   node check-mongodb.js
   ```

### Email Not Sending

1. Verify Gmail 2FA is enabled
2. Check app password is generated correctly
3. Ensure "Less secure apps" is not blocking (2FA should handle this)
4. Test email:
   ```bash
   cd backend
   node test-email.js
   ```

### CORS Errors

1. Frontend and backend must be on different ports/domains
2. Check CORS configuration in `backend/src/app.js`
3. Update `REACT_APP_API_URL` in frontend `.env`

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm run install:all

# Rebuild
npm run build
```

---

## 🔒 Security Checklist

- [ ] Change all default secrets in `.env`
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Enable 2FA on Gmail
- [ ] Use HTTPS in production
- [ ] Set NODE_ENV to "production"
- [ ] Implement rate limiting for APIs
- [ ] Regular security audits
- [ ] Keep dependencies updated: `npm audit`

---

## 📝 Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `production` |
| `JWT_SECRET` | JWT signing secret | Min 32 chars |
| `EMAIL_SERVICE` | Email provider | `gmail` |
| `EMAIL_USER` | Email address | `user@gmail.com` |
| `EMAIL_PASS` | App password | 16-char password |
| `OPENROUTER_API_KEY` | AI API key | `sk-or-v1-...` |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `REACT_APP_EXTERNAL_API_KEY` | OpenRouter API key | `sk-or-v1-...` |
| `REACT_APP_EXTERNAL_API_URL` | OpenRouter endpoint | `https://openrouter.ai/api/v1/chat/completions` |
| `REACT_APP_MODEL` | AI model selection | `openai/gpt-3.5-turbo` |

---

## 🤝 Support & Contributions

For issues, questions, or suggestions:

1. Check existing [GitHub Issues](https://github.com/yourusername/psai-chatbot/issues)
2. Create a detailed issue with reproducible steps
3. Include error messages and system information
4. For security issues, please email privately

---

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

---

## 🙏 Acknowledgments

- Built with React 18 and Express.js
- Powered by OpenRouter AI
- Hosted on MongoDB Atlas
- Inspired by modern chat applications

---

**Last Updated:** January 24, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅

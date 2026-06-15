# PSAI Chatbot

PSAI Chatbot is a full-stack AI chatbot application featuring secure user authentication, real-time messaging, and multi-session chat management. Built with React, Express, Node.js, and MongoDB.

---

## 🚀 Features

- **Secure Authentication:** JWT-based login, registration, password validation, and OTP password recovery.
- **Real-Time AI Chat:** Powered by the OpenRouter API with support for multiple independent chat sessions.
- **User Profile Management:** Editable profiles, including profile picture upload with compression.
- **Premium UI/UX:** Responsive mobile-first design, dark/light mode toggle, and micro-animations.
- **Chat History & Search:** Full chat persistence in MongoDB with advanced message search and conversation export options (JSON/TXT).

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Axios, CSS3 (Vanilla CSS)
- **Backend:** Node.js, Express.js (v5.2)
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Services:** OpenRouter API (AI Completion), Nodemailer (Gmail SMTP for OTP)

---

## 📋 Prerequisites

Make sure you have the following installed:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

Required API accounts:
- **MongoDB Atlas** (for the database)
- **OpenRouter** (for the AI models)
- **Gmail Account** (with App Password enabled for sending OTP verification emails)

---

## ⚙️ Setup & Configuration

### 1. Installation

Install dependencies for the root project, frontend, and backend with a single command:
```bash
npm run install:all
```

### 2. Environment Variables

#### Backend (`backend/.env`)
Create a `.env` file inside the `backend` folder:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/psai-chatbot?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
JWT_SECRET=your_32_character_jwt_secret_key
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
OPENROUTER_API_KEY=your-openrouter-api-key
```

> **Note:** To generate a Gmail App Password, enable 2-Factor Authentication on your Gmail account and create an app password at [Google App Passwords](https://myaccount.google.com/apppasswords).

#### Frontend (`frontend/.env`)
Create a `.env` file inside the `frontend` folder:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_EXTERNAL_API_KEY=your-openrouter-api-key
REACT_APP_EXTERNAL_API_URL=https://openrouter.ai/api/v1/chat/completions
REACT_APP_MODEL=openai/gpt-3.5-turbo
```

---

## 🏃 Running the Application

To run the application locally in development mode:

```bash
# Start both frontend (port 3000) and backend (port 5000) concurrently
npm run dev
```

### Other Available Scripts
- `npm run frontend`: Starts only the React frontend application.
- `npm run backend:dev`: Starts only the backend server using nodemon.
- `npm run build`: Builds the frontend production bundle.
- `npm run test`: Runs the frontend test suite.

---

## 📂 Project Structure

```text
psai-chatbot/
├── backend/               # Express server, routes, models, and middleware
├── frontend/              # React components, pages, public assets, and API service
├── package.json           # Root workspace scripts & concurrently manager
└── README.md              # Main documentation
```

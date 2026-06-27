const express = require('express');
const Chat = require('../models/Chat');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all sessions for user
router.get('/sessions', authenticate, async (req, res) => {
  try {
    // ✅ Optimized: only fetch sessionName field (lean) for faster response
    const chats = await Chat.find({ userId: req.user._id }).select('sessionName').lean();
    const sessions = [...new Set(chats.map(chat => chat.sessionName))];
    
    // Ensure default session exists
    if (!sessions.includes('default')) {
      sessions.unshift('default');
    }

    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages for a session
router.get('/messages/:sessionName', authenticate, async (req, res) => {
  try {
    const { sessionName } = req.params;
    const chat = await Chat.findOne({
      userId: req.user._id,
      sessionName: sessionName || 'default',
    });

    if (!chat) {
      return res.json({ messages: [] });
    }

    res.json({ messages: chat.messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save message
router.post('/messages', authenticate, async (req, res) => {
  try {
    const { sessionName = 'default', messages } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages must be an array' });
    }

    let chat = await Chat.findOne({
      userId: req.user._id,
      sessionName,
    });

    if (!chat) {
      chat = new Chat({
        userId: req.user._id,
        sessionName,
        messages,
      });
    } else {
      chat.messages = messages;
    }

    await chat.save();

    res.json({ message: 'Messages saved successfully', chat });
  } catch (error) {
    console.error('Save messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new session
router.post('/sessions', authenticate, async (req, res) => {
  try {
    const { sessionName } = req.body;

    if (!sessionName || !sessionName.trim()) {
      return res.status(400).json({ error: 'Session name is required' });
    }

    const trimmedName = sessionName.trim();

    // Check if session already exists
    const existing = await Chat.findOne({
      userId: req.user._id,
      sessionName: trimmedName,
    });

    if (existing) {
      return res.status(400).json({ error: 'Session name already exists' });
    }

    // Create new session
    const chat = new Chat({
      userId: req.user._id,
      sessionName: trimmedName,
      messages: [],
    });

    await chat.save();

    res.json({ message: 'Session created successfully', sessionName: trimmedName });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete session
router.delete('/sessions/:sessionName', authenticate, async (req, res) => {
  try {
    const { sessionName } = req.params;

    if (sessionName === 'default') {
      return res.status(400).json({ error: 'Cannot delete default session' });
    }

    await Chat.deleteOne({
      userId: req.user._id,
      sessionName,
    });

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear chat for a session
router.delete('/messages/:sessionName', authenticate, async (req, res) => {
  try {
    const { sessionName } = req.params;

    const chat = await Chat.findOne({
      userId: req.user._id,
      sessionName,
    });

    if (chat) {
      chat.messages = [];
      await chat.save();
    }

    res.json({ message: 'Chat cleared successfully' });
  } catch (error) {
    console.error('Clear chat error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/chat/generate (Secure AI generation proxy)
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const TARQA_API_KEY = process.env.TARQA_API_KEY;
    const TARQA_API_URL = process.env.TARQA_API_URL || 'https://tarqaai.com/api/v1/chat/completions';
    const TARQA_MODEL = process.env.TARQA_MODEL || 'gpt-3.5-turbo';

    if (!TARQA_API_KEY) {
      return res.status(500).json({ error: 'TarqaAI API key is not configured on the server.' });
    }

    const payload = {
      model: TARQA_MODEL,
      messages: messages,
    };

    const response = await fetch(TARQA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TARQA_API_KEY}`,
        'X-Title': 'PSAI Chatbot (Backend Proxy)',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return res.status(502).json({ error: 'Invalid response from AI provider gateway.' });
    }

    if (!response.ok) {
      const errMsg = data.error?.message || data.message || `API gateway error: ${response.status}`;
      return res.status(response.status).json({ error: errMsg });
    }

    res.json(data);
  } catch (error) {
    console.error('AI Proxy Error:', error);
    res.status(500).json({ error: 'Failed to communicate with AI gateway.' });
  }
});

module.exports = router;

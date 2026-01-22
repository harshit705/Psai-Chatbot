const express = require('express');
const Chat = require('../models/Chat');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all sessions for user
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id }).select('sessionName');
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

module.exports = router;

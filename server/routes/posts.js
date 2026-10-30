const express = require('express');
const Post = require('../models/Post');

const router = express.Router();

// create a new post
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body; //MISSING AUTHOR
    const post = await Post.create({ title, content });
    res.status(201).json(post);
  } catch (err) {
    console.error('Error creating post:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// list all posts, newest first
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
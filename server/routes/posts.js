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


  // list all posts, or filter by search query (newest first)
  router.get('/', async (req, res) => {
    try {
      const { search } = req.query;
      let query = {};

      if (search) {
        // case-insensitive regex matching title or content
        query = {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } }
          ]
        };
      }

      const posts = await Post.find(query).sort({ createdAt: -1 });
      res.json(posts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

// delete post by ID
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully', id: req.params.id });
  } catch (err) {
    console.error('Error deleting post:', err);
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
const express = require('express');
const Post = require('../models/Post');
const multer = require('multer');
const router = express.Router();

// store uploaded file in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// create a new post
router.post('/', upload.single('image'), async (req, res) => {  
  try {
    const { title, content } = req.body; //MISSING AUTHOR

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const postData = {
      title,
      content,
    };

    // add binary image data if a file was uploaded
    if (req.file) {
      postData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    const newPost = new Post(postData);
    const savedPost = await newPost.save();

    // return post
    const responsePost = savedPost.toObject();
    if (responsePost.image) {
      delete responsePost.image.data;
    }

    res.status(201).json(responsePost);
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

    const posts = await Post.find(query).select('-image.data').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// give binary image by post ID
router.get('/:id/image', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select('image');

    if (!post || !post.image || !post.image.data) {
      return res.status(404).send('Image not found');
    }

    res.set('Content-Type', post.image.contentType);
    res.send(post.image.data);
  } catch (err) {
    console.error('Error serving image:', err);
    res.status(500).send('Server error');
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

    // invalid MongoDB ObjectId
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
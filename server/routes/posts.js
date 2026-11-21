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
    // block unauthenticated users
    if (!req.session.userId) {
      return res.status(401).json({ error: 'You must be logged in to post.' });
    }

    const { title, servings, minutes, ingredients, instructions } = req.body;

    // author
    const authorId = req.session.userId;

    if (!title || !instructions) {
      return res.status(400).json({ error: 'Title and instructions are required' });
    }

    const parsedIngredients =
    typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;

    const postData = {
      title,
      servings: Number(servings),
      minutes: Number(minutes),
      ingredients: Array.isArray(parsedIngredients) ? parsedIngredients : [],
      instructions,
      author: authorId,
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

    await savedPost.populate('author', 'username');


    // return post
    const responsePost = savedPost.toObject();
    if (responsePost.image) {
      delete responsePost.image.data;
    }

    responsePost.isOwner = true;
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
      const regex = { $regex: search, $options: 'i' };
      query = {
        $or: [
          { title: regex },
          { content: regex },
          { ingredients: regex },
          { instructions: regex },
        ]
      };
    }

    const posts = await Post.find(query)
      .select('-image.data')
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .lean();

    const postsWithOwnership = posts.map((post) => ({
      ...post,
      isOwner: Boolean(
        req.session.userId &&
        String(post.author?._id) === String(req.session.userId)
      ),
    }));

    res.json(postsWithOwnership);
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
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // check if user is author
    if (!post.author || post.author.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ error: 'You can only delete your own posts.' });
    }

    await post.deleteOne();

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
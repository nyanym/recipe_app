const express = require('express');
const Post = require('../models/Post');
const multer = require('multer');
const router = express.Router();
const User = require('../models/User');

// store uploaded file in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// when user searches special characters, treats as plain text
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ingredients/instructions arrive as real arrays from a JSON request,
// but as JSON strings if the form is ever sent as multipart (image upload)
const parseListField = (value) => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

// create a new post
router.post('/', upload.single('image'), async (req, res) => {
  try {
    // block unauthenticated users
    if (!req.session.userId) {
      return res.status(401).json({ error: 'You must be logged in to post.' });
    }

    const { title, content } = req.body;
    const ingredients = parseListField(req.body.ingredients);
    const instructions = parseListField(req.body.instructions);

    // author
    const authorId = req.session.userId;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // the model validates title length, ingredients, and instructions
    const postData = {
      title,
      content,
      ingredients,
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

// save/unsave a post for the logged-in user
router.post('/:id/save', async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.savedPosts) {
      user.savedPosts = [];
    }

    const postId = req.params.id;
    const alreadySaved = user.savedPosts.some((id) => String(id) === String(postId));

    if (alreadySaved) {
      user.savedPosts.pull(postId);     // Unsave
    } else {
      user.savedPosts.addToSet(postId); // Save
    }

    await user.save();

    res.json({
      saved: !alreadySaved,
      postId,
    });
  } catch (err) {
    console.error('Error toggling save post:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// list all posts (newest first)
//   ?search=pasta            -> title contains "pasta"
//   ?ingredient=flour        -> has an ingredient containing "flour"
//   ?ingredient=flour,eggs   -> has BOTH (comma separated)
// search and ingredient can be combined
router.get('/', async (req, res) => {
  try {
    const { search, ingredient } = req.query;
    const conditions = [];

    if (search && search.trim() !== '') {
      // case-insensitive match on title only
      conditions.push({
        title: { $regex: escapeRegex(search.trim()), $options: 'i' },
      });
    }

    if (ingredient && ingredient.trim() !== '') {
      // every listed ingredient must match at least one ingredient name
      ingredient
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item !== '')
        .forEach((item) => {
          conditions.push({
            'ingredients.name': { $regex: escapeRegex(item), $options: 'i' },
          });
        });
    }

    const query = conditions.length > 0 ? { $and: conditions } : {};

    const posts = await Post.find(query)
      .select('-image.data')
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .lean();

    let savedSet = new Set();   // make sure cleanup later
    if (req.session.userId) {
      const currentUser = await User.findById(req.session.userId).select('savedPosts').lean();
      if (currentUser?.savedPosts) {
        savedSet = new Set(currentUser.savedPosts.map((id) => String(id)));
      }
    }

    const postsWithFlags = posts.map((post) => ({
      ...post,
      isOwner: Boolean(
        req.session.userId &&
        String(post.author?._id) === String(req.session.userId)
      ),
      isSaved: savedSet.has(String(post._id)),
    }));

    res.json(postsWithFlags);
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
    if (
      !req.session.userId ||
      !post.author ||
      post.author.toString() !== req.session.userId.toString()
    ) {
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
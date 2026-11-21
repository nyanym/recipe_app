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

// create a new post
router.post('/', upload.single('image'), async (req, res) => {  
  try {
    // block unauthenticated users
    if (!req.session.userId) {
      return res.status(401).json({ error: 'You must be logged in to post.' });
    }

    const { title, content } = req.body; 

    // author
    const authorId = req.session.userId;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const postData = {
      title,
      content,
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
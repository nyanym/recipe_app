const express = require('express');
const Post = require('../models/Post');
const multer = require('multer');
const router = express.Router();
const User = require('../models/User');
const summarizeRatings = require('../utils/RatingSummary');

// store uploaded file in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// when user searches special characters, treats as plain text
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// create a new post
router.post('/', upload.single('image'), async (req, res) => {
  try {
    // block unauthenticated users
    if (!req.session.userId) {
      return res.status(401).json({ error: 'You must be logged in to post.' });
    }

    const { title, content, servings, minutes, ingredients, instructions } = req.body;

    // author
    const authorId = req.session.userId;

    if (!title || !instructions) {
      return res.status(400).json({ error: 'Title and instructions are required' });
    }

        const parsedIngredients =
      typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    const parsedInstructions =
      typeof instructions === 'string' ? JSON.parse(instructions) : instructions;

    const postData = {
      title,
      servings: Number(servings),
      minutes: Number(minutes),
      ingredients: Array.isArray(parsedIngredients) ? parsedIngredients : [],
      content,
      instructions: Array.isArray(parsedInstructions) ? parsedInstructions : [instructions],
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
    responsePost.rating = 0;
    responsePost.ratingCount = 0;
    responsePost.myRating = null;
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

// summary includes postId, rating, ratingCount, myRating
const buildRatingSummary = async (postId, userId) => {
  const summaries = await summarizeRatings([postId]);
  const summary = summaries.get(String(postId)) || { rating: 0, ratingCount: 0 };
  let myRating = null;
  if (userId) {
    const user = await User.findById(userId).select('ratedPosts').lean();
    const mine = user?.ratedPosts?.find((r) => String(r.post) === String(postId));
    myRating = mine ? mine.value : null;
  }
  return { postId, ...summary, myRating };
};

// get a post's average rating, count and (if logged in) your own rating
router.get('/:id/rating', async (req, res) => {
  try {
    const postExists = await Post.exists({ _id: req.params.id });
    if (!postExists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(await buildRatingSummary(req.params.id, req.session.userId));
  } catch (err) {
    console.error('Error loading rating:', err);
    // invalid MongoDB ObjectId
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// rate a post for the logged-in user.
router.post('/:id/rating', async (req, res) => {
  try {
    // block unauthenticated users
    if (!req.session.userId) {
      return res.status(401).json({ error: 'You must be logged in to rate recipes.' });
    }

    const value = Number(req.body.value);
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return res.status(400).json({ error: 'Rating must be a whole number from 1 to 5' });
    }

    const post = await Post.findById(req.params.id).select('author');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // authors can't rate their own recipe
    if (String(post.author) === String(req.session.userId)) {
      return res.status(403).json({ error: "You can't rate your own recipe." });
    }

    // Only add the rating if this user hasn't rated the post yet.
    const result = await User.updateOne(
      { _id: req.session.userId, 'ratedPosts.post': { $ne: post._id } },
      { $push: { ratedPosts: { post: post._id, value } } },
      { runValidators: true }
    );

    if (result.matchedCount === 0) {
      // either the user is gone, or they already rated this post
      const userExists = await User.exists({ _id: req.session.userId });
      if (!userExists) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(409).json({
        error: "You've already rated this recipe. Remove your rating to rate it again.",
      });
    }

    res.json(await buildRatingSummary(post._id, req.session.userId));
  } catch (err) {
    console.error('Error rating post:', err);
    // invalid MongoDB ObjectId
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// remove the logged-in user's rating for a post
router.delete('/:id/rating', async (req, res) => {
  try {
    // block unauthenticated users
    if (!req.session.userId) {
      return res.status(401).json({ error: 'You must be logged in to remove a rating.' });
    }

    const result = await User.updateOne(
      { _id: req.session.userId },
      { $pull: { ratedPosts: { post: req.params.id } } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(await buildRatingSummary(req.params.id, req.session.userId));
  } catch (err) {
    console.error('Error removing rating:', err);
    // invalid MongoDB ObjectId
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { search, ingredient } = req.query;
    const conditions = [];

    // if (search) {
    //   // case-insensitive regex matching title or content
    //   const regex = { $regex: search, $options: 'i' };
    //   query = {
    //     $or: [
    //       { title: regex },
    //       { content: regex },
    //       { ingredients: regex },
    //       { instructions: regex },
    //     ]
    //   };
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
    const myRatings = new Map();
    if (req.session.userId) {
      const currentUser = await User.findById(req.session.userId)
        .select('savedPosts ratedPosts')
        .lean();
      if (currentUser?.savedPosts) {
        savedSet = new Set(currentUser.savedPosts.map((id) => String(id)));
      }
      (currentUser?.ratedPosts || []).forEach((r) => myRatings.set(String(r.post), r.value));
    }

    // average rating and count for every post in the list
    const ratingSummaries = await summarizeRatings(posts.map((post) => post._id));

    const postsWithFlags = posts.map((post) => ({
      ...post,
      rating: ratingSummaries.get(String(post._id))?.rating ?? 0,
      ratingCount: ratingSummaries.get(String(post._id))?.ratingCount ?? 0,
      myRating: myRatings.get(String(post._id)) ?? null,
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
    // remove this post from every user's ratedPosts
    await User.updateMany(
      { 'ratedPosts.post': post._id },
      { $pull: { ratedPosts: { post: post._id } } }
    );

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
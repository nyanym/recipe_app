const express = require('express')
const router = express.Router();

const Comment = require('../models/Comment');
const Post = require('../models/Post');

const authMiddleware = require('../middleware/authMiddleware');

// Get Post comments
router.get('/posts/:postId/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId }).sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({message: 'Failed to retrieve comments'});
    }
});

// Make a comment
router.post('/posts/:postId/comments', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Comment cannot be empty' });
        }

        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(400).json({ message: 'Post not found' });
        }

        const comment = await Comment.create({
            post: post._id,
            author: req.user.id,
            username: req.user.username,
            text: text.trim()
        });

        res.status(201).json(comment);

    } catch (error) {
        res.status(500).json({
            message: 'Failed to create comment'
        });
    }
});

// Delete a comment
router.delete('/comments/:commentId', authMiddleware, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({
                message: 'Comment not found'
            });
        }

        if (comment.author.toString() != req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete the comment" });
        }

        await comment.deleteOne();

        res.json({
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to delete comment'
        });
    }
});

module.exports = router;
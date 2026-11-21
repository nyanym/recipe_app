const express = require('express');
const mongoose = require('mongoose');
const Checklist = require('../models/Checklist');
const router = express.Router();

router.use((req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ error: 'You must be logged in.' });
  next();
});

router.param('postId', (req, res, next, val) => {
  if (!mongoose.isValidObjectId(val)) {
    return res.status(400).json({ error: 'Invalid post id' });
  }
  next();
});

router.get('/:postId', async (req, res) => {
  try {
    const doc = await Checklist.findOne({
      user: req.session.userId,
      post: req.params.postId,
    }).lean();
    res.json({ checkedIndices: doc ? doc.checkedIndices : [] });
  } catch (err) {
    console.error('Error loading checklist:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:postId', async (req, res) => {
  try {
    const checkedIndices = Array.isArray(req.body.checkedIndices)
      ? req.body.checkedIndices.filter((n) => Number.isInteger(n) && n >= 0)
      : [];
        const updated = await Checklist.findOneAndUpdate(
      { user: req.session.userId, post: req.params.postId },
      { 
        $set: { checkedIndices },
        $setOnInsert: { user: req.session.userId, post: req.params.postId },
      },
      { upsert: true, new: true, runValidators: true }
    ).lean();
    res.json({ checkedIndices: updated ? updated.checkedIndices : [] });
  } catch (err) {
    console.error('Error saving checklist:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
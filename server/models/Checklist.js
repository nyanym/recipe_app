const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    checkedIndices: { type: [Number], default: [] },
  },
  { timestamps: true }
);

// one checklist per user per post
checklistSchema.index({ user: 1, post: 1 }, { unique: true });

module.exports = mongoose.model('Checklist', checklistSchema);
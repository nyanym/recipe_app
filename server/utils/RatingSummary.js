const mongoose = require('mongoose');
const User = require('../models/User');

// Returns rating and ratingCount
const summarizeRatings = async (postIds) => {
  const ids = postIds.map((id) => new mongoose.Types.ObjectId(String(id)));

  const rows = await User.aggregate([
    // only users who rated at least one of these posts
    { $match: { 'ratedPosts.post': { $in: ids } } },
    // one row per rating instead of one row per user
    { $unwind: '$ratedPosts' },
    // drop that user's ratings for other posts
    { $match: { 'ratedPosts.post': { $in: ids } } },
    // average and count per post
    {
      $group: {
        _id: '$ratedPosts.post',
        average: { $avg: '$ratedPosts.value' },
        count: { $sum: 1 },
      },
    },
  ]);

  const map = new Map();
  rows.forEach((row) => {
    map.set(String(row._id), {
      rating: Math.round(row.average * 10) / 10,
      ratingCount: row.count,
    });
  });
  return map;
};

module.exports = summarizeRatings;

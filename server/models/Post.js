const mongoose = require('mongoose');

const MAX_TITLE_WORDS = 21; // title must have fewer than this many words
 
//same as client-side
const countWords = (text) => {
  const trimmed = (text || '').trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
};

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      validate: {
        validator: (value) => {
          const words = countWords(value);
          return words > 0 && words < MAX_TITLE_WORDS;
        },
        message: `Title must have at least 1 word and fewer than ${MAX_TITLE_WORDS} words`,
      },
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
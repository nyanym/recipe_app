const mongoose = require('mongoose');

const MAX_TITLE_WORDS = 21; // title must have fewer than this many words
const MAX_CONTENT_CHARS = 300; //content must have fewer than this many characters

//same as client-side
const countWords = (text) => {
  const trimmed = (text || '').trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
};

const ingredientSchema = new mongoose.Schema(
  {
    //i.e: 2 cups
    quantity: { 
      type: String,
      required: [true, 'Ingredient quantity is required'],
      trim: true,
    },
    //i.e: flour
    name: { 
      type: String,
      required: [true, 'Ingredient name is required'],
      trim: true,
    },
  },
  { _id: false }
);


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
    // description of the recipe
    content: {
      type: String,
      trim: true,
      maxlength: [
        MAX_CONTENT_CHARS,
        `Content must be ${MAX_CONTENT_CHARS} characters or fewer`,
      ],
      default: '',
    },
    ingredients: {
      type: [ingredientSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'At least one ingredient is required',
      },
    },
    // one string per step
    instructions: {
      type: [String],
      validate: {
        validator: (steps) =>
          Array.isArray(steps) &&
          steps.length > 0 &&
          steps.every((step) => typeof step === 'string' && step.trim() !== ''),
        message: 'At least one instruction step is required, and steps cannot be empty',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
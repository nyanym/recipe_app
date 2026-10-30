require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const postRoutes = require('./routes/posts');

const app = express();

// connect to MongoDB Atlas
connectDB();

// middleware
app.use(cors());
app.use(express.json());

// Basic test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Database and backend active' });
});

// Sample backend API route
app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from Node.js backend!' });
});

// Posts API (create + list)
app.use('/api/posts', postRoutes);

// // restricting what frontend can talk to backend
// app.use(cors({
//   origin: 'https://my-recipe-app.vercel.app', // Your frontend domain
//   credentials: true
// }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Node server is running on http://localhost:${PORT}`);
});
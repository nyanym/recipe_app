require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const postRoutes = require('./routes/posts');
const authRoutes = require ('./routes/auth');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();

// connect to MongoDB Atlas
connectDB();

// middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60
    }),

    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 14 * 24 * 60 * 60 * 1000
    }
}));

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

//Authentication API
app.use('/api/auth', authRoutes);

// // restricting what frontend can talk to backend
// app.use(cors({
//   origin: 'https://my-recipe-app.vercel.app', // Your frontend domain
//   credentials: true
// }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Node server is running on http://localhost:${PORT}`);
});
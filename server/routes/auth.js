const express = require('express');
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const multer = require('multer');
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const formatUser = (user) => ({
  id: user._id,
  username: user.username,
  displayName: user.displayName || '',
  bio: user.bio || '',
  profilePic: user.profilePic?.contentType
    ? { contentType: user.profilePic.contentType }
    : null,
});

//Sign up a new account
router.post("/signup", async (req, res) => {
    try {
        const {username, password} = req.body;

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({message:"Password must be at least 8 characters and contain a letter, number, and special character."});
        }

        const existingUser = await User.findOne({ username });

        if (existingUser){
            return res.status(400).json({message: "Username already exists"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
        });

        await newUser.save();

        req.session.userId = newUser._id.toString();

        res.status(201).json({
            message: "User created successfully",
            user: {
                username: newUser.username
            }
        });

    } catch (error) {
        res.status(500).json({message: "Server error"});
    }

});


//Login to your account
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username }).select("-profilePic.data");

        if (!user) {
            return res.status(401).json({message: "Invalid username or password"});
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches){
            return res.status(401).json({message: "Invalid username or password"});
        }

        req.session.userId = user._id.toString();

        res.status(200).json({
            message: "Login successful",
            user: formatUser(user)
        });

    } catch (error) {
        res.status(500).json({message: "Server error"});
    }

});

// To check if user is logged in
router.get("/me", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        const user = await User.findById(req.session.userId)
            .select("username displayName bio profilePic.contentType");

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            user: formatUser(user),
        });
    }
    catch(err){
        res.status(500).json({
            message: "Server error"
        });
    }
});

// Log out
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout Failed:', err);
            return res.status(500).json({message: 'Could not log out'});
        }

        res.clearCookie('connect.sid', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        return res.status(200).json({ message: 'Logged out successfully' });
    });
});

// When you update profile info
router.put("/me", upload.single('profilePic'), async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        const { displayName, bio } = req.body; 
        const updates = {};

        if (displayName !== undefined) updates.displayName = displayName.trim();
        if (bio !== undefined) updates.bio = bio.trim();
        
        if (req.file) {
            updates.profilePic = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            };
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.session.userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password -profilePic.data');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: updatedUser });
    }
    catch(err){
        console.error('Error updating profile:', err);
            if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Server error' });
    }
});

// profile-pic
router.get('/:id/profile-pic', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('profilePic');

    if (!user || !user.profilePic || !user.profilePic.data) {
      return res.status(404).send('Image not found');
    }

    res.set('Content-Type', user.profilePic.contentType);
    res.send(user.profilePic.data);
  } catch (err) {
    console.error('Error serving profile picture:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
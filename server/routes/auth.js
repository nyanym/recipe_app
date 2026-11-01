const express = require('express');
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const router = express.Router();

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

        res.status(201).json({message: "User created successfully"});

    } catch (error) {
        res.status(500).json({message: "Server error"});
    }

});


//Login to your account
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({message: "Invalid username or password"});
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches){
            return res.status(401).json({message: "Invalid username or password"});
        }

        res.status(200).json({message: "Login successful"});

    } catch (error) {
        res.status(500).json({message: "Server error"});
    }

});


module.exports = router;
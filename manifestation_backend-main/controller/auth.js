const express = require('express');
const router = express.Router();
const CryptoJS = require('crypto-js');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../model/User');


// REGISTER STUDENT
router.post("/register", async (req, res) => {
    const { name, email, center, password } = req.body;
    
    try {

        if (!name || !email || !center || !password) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                missing: {
                    name: !name,
                    email: !email,
                    center: !center,
                    password: !password
                }
            });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const existingName = await User.findOne({ name });
        if (existingName) {
            return res.status(400).json({ message: 'Name already exists' });
        }

        // Encrypt password
        const encryptedPassword = CryptoJS.AES.encrypt(password, process.env.PASS_SEC).toString();

        // Create new user
        const newUser = new User({
            name,
            email,
            center,
            password: encryptedPassword
        });

        // Save the user in the database
        const savedUser = await newUser.save();

        // Return a successful response without the password
        res.status(201).json({
            message: 'User registration is successful',
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                center: savedUser.center
            }
        });

    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ 
            message: 'Server error during registration',
        });
    }
});


// LOGIN STUDENT
router.post("/login-student", async (req, res) => {
    const { email, password: providedPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User not found for email: ${email}`);
            return res.status(401).json({ message: "Wrong Email" });
        }

        // Check if the user is a student
        if (!user.isStudent) {
            return res.status(403).json({ message: "Please pay a one time payment to Dr. Lee before login" });
        }

        // Decrypt the stored password
        const hashPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC);
        const Originalpassword = hashPassword.toString(CryptoJS.enc.Utf8);

        // Check if the provided password matches the decrypted password
        if (Originalpassword !== providedPassword) {
            return res.status(401).json("Wrong password");
        }

        const accessToken = generateAccessToken(user);
        const userData = excludePassword(user);

        return res.status(200).json({ ...userData, accessToken });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server Time Out" });
    }
});


function generateAccessToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email, isStudent: user.isStudent },
        process.env.JWT_SEC,
        { expiresIn: "1d" }
    );
}

function excludePassword(user) {
    const { password, ...others } = user._doc;
    return others;
}


// LOGIN COORDINATOR
router.post("/login-coordinator", async (req, res) => {
    const { email, password: providedPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User not found for email: ${email}`);
            return res.status(401).json({ message: "Wrong Email" });
        }

        // Check if the user is a student
        if (!user.isCoordinator) {
            return res.status(403).json({ message: "Administrator Login only" });
        }

        // Decrypt the stored password
        const hashPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC);
        const Originalpassword = hashPassword.toString(CryptoJS.enc.Utf8);

        // Check if the provided password matches the decrypted password
        if (Originalpassword !== providedPassword) {
            return res.status(401).json("Wrong password");
        }

        const accessToken = generateToken(user);
        const userData = excludePasswordOnly(user);

        return res.status(200).json({ ...userData, accessToken });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server Time Out" });
    }
});


function generateToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email, isCoordinator: user.isCoordinator },
        process.env.JWT_SEC,
        { expiresIn: "1d" }
    );
}

function excludePasswordOnly(user) {
    const { password, ...others } = user._doc;
    return others;
}

module.exports = router;
const express = require('express');
const router = express.Router();
const User = require("../model/User");
const CryptoJS = require('crypto-js');
require('dotenv').config();
const { verifyTokenAndCoordinator } = require('./middleware');

// Add this helper function
const excludePassword = (user) => {
    const { password, ...userData } = user.toObject();
    return userData;
};

// GET USER BY ID
router.get("/user/:id", verifyTokenAndCoordinator,  async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const userData = excludePassword(user);
        res.status(200).json(userData);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error while fetching user" });
    }
});

// UPDATE USER
router.put("/user/:id", verifyTokenAndCoordinator, async (req, res) => {
    try {
        const { password, ...updateData } = req.body;
        
        // If password is being updated, encrypt it
        if (password) {
            updateData.password = CryptoJS.AES.encrypt(
                password,
                process.env.PASS_SEC
            ).toString();
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const userData = excludePassword(updatedUser);
        res.status(200).json({
            message: "User updated successfully",
            user: userData
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Server error while updating user" });
    }
});

// DELETE USER
router.delete("/user/:id", verifyTokenAndCoordinator, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ 
            message: "User deleted successfully",
            userId: req.params.id
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Server error while deleting user" });
    }
});


// GET ALL USERS
router.get("/", verifyTokenAndCoordinator, async (req, res) => {
    try {
        // Add query parameters for filtering
        const query = {};
        if (req.query.center) query.center = req.query.center;
        if (req.query.isStudent !== undefined) query.isStudent = req.query.isStudent;

        // Add pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch users with filters and pagination
        const users = await User.find(query)
            .skip(skip)
            .limit(limit)
            .select('-password'); // Exclude password field

        // Get total count for pagination
        const total = await User.countDocuments(query);

        res.status(200).json({
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalUsers: total,
                usersPerPage: limit
            }
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error while fetching users" });
    }
});

//isPaid
router.get("/admitted", async (req, res) => {
    try {
        const exam = await Exam.find();
        res.status(200).json(exam);
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router
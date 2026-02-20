const express = require("express");
const router = express.Router();

const User = require("../models/User");

// CREATE USER
router.post("/create", async (req, res) =>
{
    try
    {
        const user = new User(req.body);
        await user.save();

        res.status(201).json({
            message: "User created successfully",
            user
        });
    }
    catch (error)
    {
        res.status(500).json({
            message: "Error creating user",
            error
        });
    }
});


router.get("/all", async (req, res) =>
{
    try
    {
        const users = await User.find();

        res.status(200).json(users);
    }
    catch (error)
    {
        res.status(500).json({
            message: "Error fetching users",
            error
        });
    }
});

module.exports = router;

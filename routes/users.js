const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// Update user
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(req.body.password);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (err) {
               return res.status(500).json(err);
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            res.status(200).json("Account updated successfully!");
        } catch(err) {
            return res.status(500).json(err)
        }
    } else {
         return res.status(403).json("You can only update your account!")
    }
});

// Delete a user
router.delete("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account was deleted successfully!");
        } catch(err) {
            return res.status(500).json(err)
        }
    } else {
         return res.status(403).json("You can delete only your account!")
    }
});

// Get a user
router.get("/", async (req, res) => {
    const userId = req.query.userId;
    const username = req.query.username;
    try {
        const user = userId 
          ? await User.findById(userId) 
          : await User.findOne({username: username });
        const { password, updatedAt, ...otherUserDetails } = user._doc;
        res.status(200).json(otherUserDetails);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Follow a user
router.put("/:id/follow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({ $push: { followings: req.params.id } });
                res.status(200).json("user has been followed");
            } else {
                res.status(403).json("You are already following this user")
            }
        } catch (err) {
            res.status(500).json(err)
        }
    } else {
        res.status(403).json("You can not follow yourself!")
    }
});

// Unfollow a user
router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({ $pull: { followings: req.params.id } });
                res.status(200).json("user has been unfollowed");
            } else {
                res.status(403).json("You already unfollow the user")
            }
        } catch (err) {
            res.status(500).json(err)
        }
    } else {
        res.status(403).json("You can not unfollow yourself!")
    }
})

module.exports = router;

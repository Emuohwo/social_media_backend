const Post = require("../models/Post");
const User = require("../models/User");
const router = require("express").Router();

// create a post
router.post("/", async (req, res) => {
    const newPost = new Post(req.body);

    try {
        const savedPost = await newPost.save();
        res.status(201).json(savedPost)
    } catch(err) {
        res.status(500).json(err)
    }
})

// update a post
router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.updateOne({ $set: req.body });
            res.status(200).json("Post was updated")
        } else {
            res.status(403).json("You can only update your post!")
        }
    } catch (err) {
        res.status(500).json(err)
    }
});

// delete a post
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).json("Post was deleted")
        } else {
            res.status(403).json("You can only delete your post!")
        }
    } catch (err) {
        res.status(500).json(err)
    }
});

// like/dislike a post
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } });
            res.status(200).json("The post has been liked!")
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } });
            res.status(200).json("Post disliked")
        }
    } catch (err) {
        res.status(500).json(err)
    }
})

// get a post
router.get("/:id", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json("Post not found");
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err);
    }
})

// get timeline posts
router.get("/timeline/:userId", async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        const userPosts = await Post.find({ userId: currentUser._id });
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find({ userId: friendId });
            })
        );
        res.status(200).json(userPosts.concat(...friendPosts))
    } catch (err) {
        res.status(500).json(err);
    }
})

// get user's all post
router.get("/profile/:username", async (req, res) => {
    try {
        const user = await User.findOne({username: req.params.username});
        const posts = await Post.find({ user: user._id });
        res.status(200).json(posts)
    } catch (err) {
        res.status(500).json(err);
    }
})


module.exports = router;

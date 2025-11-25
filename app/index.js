import express from "express"
import userModel from "./models/user.js"
import postModel from "./models/post.js"
import bcrypt, { hash } from "bcrypt"
import dotenv from "dotenv"
import { generateToken, jwtAuthMiddleware } from "./utils/jwt.js"

const app = express();
app.use(express.json());
dotenv.config()

// Register Account
app.post("/signup", async (req, res) => {
    // Check if a user with the provided email already exists in the database
    const user = await userModel.findOne({ email: req.body.email });
    if (user) {
        res.send({ message: "Something went wrong!", success: false })
    } else {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, salt, async (err, hash) => {
                const createdUser = await userModel.create({
                    username: req.body.username,
                    name: req.body.name,
                    email: req.body.email,
                    password: hash
                });
                res.send({ message: "User registered successfully!", success: true })
            })
        });
    }
});

// Login Account
app.post("/login", async (req, res) => {
    // Check if a user with the provided email exists in the database
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
        res.send({ message: "Something went wrong!", success: false })
    } else {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (result) {
                const payload = {
                    email: user.email,
                    name: user.name,
                    userId: user._id
                }
                const token = generateToken(payload)
                res.send({ message: "Logged in successfully", success: true, token: token })
            } else {
                res.send({ message: "Something went wrong!", success: false })
            }
        });
    }
});

// Update password
app.put("/update-password", jwtAuthMiddleware, async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.user.userId })

        bcrypt.compare(req.body.current_password, user.password, (err, result) => {
            if (!result) {
                return res.send({
                    message: "Current pasword do not match"
                })
            }
            if (req.body.new_password !== req.body.confirm_new_password) {
                return res.send({
                    message: "New passwords do not match.",
                    success: false
                })
            }
            // Update with hashed password
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.body.confirm_new_password, salt, async (err, hash) => {
                    const updatePassword = await userModel.findOneAndUpdate(
                        { _id: req.user.userId },
                        { $set: { password: hash } },
                        { new: true } // return updated document
                    )
                    res.send({
                        message: "Password updated successfully",
                        result: updatePassword,
                        success: true
                    })
                })
            })
        })

    } catch (err) {
        res.send({
            message: err.message ?? "Unknown error",
            success: false
        })
    }
})

// POST by user id 
app.post("/post/:id", jwtAuthMiddleware, async (req, res) => {
    const user = await userModel.findOne({ _id: req.params.id })
    const createdPost = await postModel.create({
        user: user._id,
        content: req.body.content
    });
    user.posts.push(createdPost._id)
    await user.save()
    res.send({ message: "Post created successfully!", result: createdPost, success: true })
})

// GET All Post
app.get("/posts", jwtAuthMiddleware, async (req, res) => {
    const allPosts = await postModel.find();
    res.send({ message: "Posts fetched successfully!", result: allPosts, success: true })
})

// GET Profile By user id
app.get("/profile/:id", jwtAuthMiddleware, async (req, res) => {
    const user = await userModel.findOne({ _id: req.params.id }).populate("posts")
    res.send({ message: `Hi! ${user.name}, Welcome to your profile.`, posts: user.posts, success: true })
})

// Like/Unlike a post by id
app.post("/like-unlike/:id", jwtAuthMiddleware, async (req, res) => {
    try {
        const post = await postModel.findOne({ _id: req.params.id })
        if (!post) {
            return res.send({
                message: "Post not found",
                success: false
            })
        }
        if (post.likes.includes(req.user.userId)) {
            // Already liked --> remove like
            await postModel.findOneAndUpdate(
                { _id: req.params.id },
                { $pull: { likes: req.user.userId } }
            )
            return res.send({
                message: "Like Removed",
                success: true
            })
        } else {
            post.likes.push(req.user.userId)
            await post.save()
            res.send({
                message: "Liked",
                success: true
            })
        }
    } catch (err) {
        res.send({
            message: err.message ?? "Unknown error",
            success: false
        })
    }
})

// Get Total Likes By post id
app.get("/totalLikes/:id", jwtAuthMiddleware, async (req, res) => {
    const post = await postModel.findOne({ _id: req.params.id })
    res.send({ message: "Total Likes", totalLikes: post.likes.length })
})

// Update Post By post id 
app.put("/update/:id", jwtAuthMiddleware, async (req, res) => {
    const updatedPost = await postModel.findOneAndUpdate(
        { _id: req.params.id },
        { content: req.body.content }
    )
    res.send({ message: "Post updated successfully!", success: true })
})

// Delete Post By post id
app.delete("/delete-post/:id", jwtAuthMiddleware, async (req, res) => {
    const post = await postModel.findOneAndDelete({ _id: req.params.id })
    if (!post) {
        res.send({ message: "Something went wrong!", success: false })
    } else {
        res.send({ message: "Post deleted successfully!", success: true })
    }
})

// Delete User By user id
app.delete("/delete-user/:id", jwtAuthMiddleware, async (req, res) => {
    const user = await userModel.findOneAndDelete({ _id: req.params.id })
    if (!user) {
        res.send({ message: `Something went wrong!`, success: false })
    } else {
        res.send({ message: `Your Profile ${req.user.name} has been deleted successfully!`, success: true })
    }
})

// Start The Server
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on the port ${PORT}`)
})
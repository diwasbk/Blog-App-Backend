import express from "express"
import userModel from "../models/user.js"
import postModel from "../models/post.js"
import { generateToken, jwtAuthMiddleware } from "../utils/jwt.js"

const postRouter = express.Router()

// New Post
postRouter.post("/new", jwtAuthMiddleware, async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.user.userId })
        const createdPost = await postModel.create({
            user: user._id,
            content: req.body.content
        });
        user.posts.push(createdPost._id)
        await user.save()
        res.send({
            message: "Post created successfully!",
            result: createdPost,
            success: true
        })
    }
    catch (err) {
        res.send({
            message: err.message ?? "Unknown error",
            success: false
        })
    }
})

// GET All Post
postRouter.get("/all", jwtAuthMiddleware, async (req, res) => {
    try {
        const allPosts = await postModel.find();
        res.send({
            message: "Posts fetched successfully!",
            result: allPosts,
            success: true
        })
    }
    catch (err) {
        res.send({
            message: err.message ?? "Unknown error",
            success: false
        })
    }
})

// Like/Unlike a post By id
postRouter.post("/like-unlike/:id", jwtAuthMiddleware, async (req, res) => {
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
postRouter.get("/user/likes/:id", jwtAuthMiddleware, async (req, res) => {
    try {
        const post = await postModel.findOne({ _id: req.params.id })
        if (!post) {
            return res.send({
                message: "Post not found",
                success: false
            })
        }
        const totalLikes = post.likes.length
        const likedby = await userModel.find({ _id: post.likes }).select("username name")
        res.send({
            message: "Likes",
            post: post,
            totalLikes: totalLikes,
            likedby: likedby,
            success: true
        })
    } catch (err) {
        res.send({
            message: err.message ?? "Unknown error",
            success: false
        })
    }
})

// Update Post By post id 
postRouter.put("/update/:id", jwtAuthMiddleware, async (req, res) => {
    try {
        const updatedPost = await postModel.findOneAndUpdate(
            { _id: req.params.id },
            { content: req.body.content }
        )
        const post = await postModel.findOne({_id: req.params.id})
        res.send({
            message: "Post updated successfully!",
            result: post,
            success: true
        })
    }
    catch (err) {
        res.send({
            message: err.message ?? "Unknown error",
            success: false
        })
    }
})

// View My Posts
postRouter.get("/my-posts", jwtAuthMiddleware, async (req, res) => {
    try {
        const myPosts = await userModel.findOne({ _id: req.user.userId }).select("posts").populate("posts")
        res.send({
            message: `Author: ${req.user.name}`,
            result: myPosts,
            success: true
        })
    } catch (err) {
        res.send({
            message: err.message ?? "Unknown error",
            success: false
        })
    }
})

// Delete Post By post id
postRouter.delete("/delete-post/:id", jwtAuthMiddleware, async (req, res) => {
    try {
        const post = await postModel.findOneAndDelete({ _id: req.params.id })
        if (!post) {
            res.send({
                message: "Something went wrong!",
                success: false
            })
        } else {
            res.send({
                message: "Post deleted successfully!",
                success: true
            })
        }
    }
    catch (err) {
        res.send({
            message: err.message ?? "Unknown error",
            success: false
        })
    }
})

export default postRouter

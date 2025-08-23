import express from "express"
import userModel from "./models/user.js"
import bcrypt, { hash } from "bcrypt"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser"

const app = express();
app.use(express.json());
dotenv.config()
app.use(cookieParser())

// Auth Middleware
const authMiddleware = (req, res, next) => {
    if (req.cookies.token === "") {
        res.send({ message: "Anauthorized Access" })
    } else {
        const data = jwt.verify(req.cookies.token, process.env.SECRET_KEY)
        req.user = data
        next()
    }
}

// Register Account (POST Route)
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

// Login Account (POST Route)
app.post("/login", async (req, res) => {
    // Check if a user with the provided email exists in the database
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
        res.send({ message: "Something went wrong!", success: false })
    } else {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (result) {
                const token = jwt.sign({ email: user.email, name: user.name, userId: user._id }, process.env.SECRET_KEY, { expiresIn: 3000 })
                res.cookie("token", token)
                res.send({ message: "Logged in successfully", success: true, token: token })
            } else {
                res.send({ message: "Something went wrong!", success: false })
            }
        });
    }
});

// Logout Account (GET Route)
app.get("/logout", (req, res) => {
    res.cookie("token", "")
    res.send({ message: "Logout successfully!", success: true })
})

// POST API
app.post("/post/:id", authMiddleware, async (req, res) => {
    const user = await userModel.findOne({ _id: req.params.id })
    const createdPost = await postModel.create({
        user: user._id,
        content: req.body.content
    });
    user.posts.push(createdPost._id)
    await user.save()
    res.send({ message: "Post created successfully!", result: createdPost, success: true })
})

// GET ALL POST API
app.get("/posts", authMiddleware, async (req, res) => {
    const allPosts = await postModel.find();
    res.send({ message: "Posts fetched successfully!", result: allPosts, success: true })
})

// GET PROFILE BY ID
app.get("/profile/:id", authMiddleware, async (req, res) => {
    const user = await userModel.findOne({ _id: req.params.id }).populate("posts")
    res.send({ message: `Hi! ${user.name}, Welcome to your profile.`, posts: user.posts, success: true })
})

// LIKE THE POST by post id API
app.post("/like/:id", authMiddleware, async (req, res) => {
    const post = await postModel.findOne({ _id: req.params.id })
    post.likes.push(req.user.userId)
    await post.save()
    res.send({ message: "Liked!" })
})

// GET TOTAL LIKES by post id
app.get("/totalLikes/:id", authMiddleware, async (req, res) => {
    const post = await postModel.findOne({ _id: req.params.id })
    res.send({ message: "Total Likes", totalLikes: post.likes.length })
})

// UPDATE POST by post id Route
app.put("/update/:id", authMiddleware, async (req, res) => {
    const updatedPost = await postModel.findOneAndUpdate(
        { _id: req.params.id },
        { content: req.body.content }
    )
    res.send({ message: "Post updated successfully!", success: true })
})

// DELETE POST by post id Route
app.delete("/delete-post/:id", authMiddleware, async (req, res) => {
    const post = await postModel.findOneAndDelete({ _id: req.params.id })
    if (!post) {
        res.send({ message: "Something went wrong!", success: false })
    } else {
        res.send({ message: "Post deleted successfully!", success: true })
    }
})

// DELETE USER by user id
app.delete("/delete-user/:id", authMiddleware, async (req, res) => {
    const user = await userModel.findOneAndDelete({ _id: req.params.id })
    if (!user) {
        res.send({ message: `Something went wrong!`, success: false })
    } else {
        res.send({ message: `Your Profile ${req.user.name} has been deleted successfully!`, success: true })
    }
})

// Start the server
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on the port ${PORT}`)
})
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

// Start the server
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on the port ${PORT}`)
})
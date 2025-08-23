import express from "express"
import userModel from "./models/user.js"
import bcrypt, { hash } from "bcrypt"
import dotenv from "dotenv"

const app = express();
app.use(express.json());
dotenv.config()

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

// Start the server
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on the port ${PORT}`)
})
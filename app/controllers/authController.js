import userModel from "../models/user.js"
import bcrypt from "bcrypt"
import { generateToken } from "../utils/jwt.js"

export class AuthController {
    // Register Account
    signupUser = async (req, res) => {
        try {
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
        }
        catch (err) {
            res.send({
                message: err.message ?? "Unknown error",
                success: false
            })
        }
    };

    // Login Account
    loginUser = async (req, res) => {
        try {
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
                        res.send({
                            message: "Logged in successfully",
                            success: true,
                            token: token
                        })
                    } else {
                        res.send({
                            message: "Something went wrong!",
                            success: false
                        })
                    }
                });
            }
        }
        catch (err) {
            res.send({
                message: err.message ?? "Unknown error",
                success: false
            })
        }
    };

    // Update password
    updatePassword = async (req, res) => {
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
    }
}
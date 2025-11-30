import userModel from "../models/user.js"
import bcrypt from "bcrypt"

export class ProfileController {
    // GET My Profile 
    getMyProfile = async (req, res) => {
        try {
            const user = await userModel.findOne({ _id: req.user.userId }).populate("posts")
            res.send({
                message: `Hi! ${user.name}, Welcome to your profile.`,
                posts: user.posts,
                success: true
            })
        }
        catch (err) {
            res.send({
                message: err.message ?? "Unknown error",
                success: false
            })
        }

    }

    // Update My Profile
    updateMyProfile = async (req, res) => {
        try {
            const updateProfile = await userModel.findOneAndUpdate(
                { _id: req.user.userId },
                {
                    $set: {
                        username: req.body.username,
                        name: req.body.name,
                        email: req.body.email
                    }
                }
            );
            if (!updateProfile) {
                return res.send({
                    message: "Profile not found",
                    success: false
                })
            }
            const user = await userModel.findOne({ _id: req.user.userId }).select("username name email")
            res.send({
                message: "Profile Updated",
                result: user,
                success: true
            })

        } catch (err) {
            res.send({
                message: err.message ?? "Unknown error",
                success: false
            })
        }
    }

    // Delete Profile
    deleteMyProfile = async (req, res) => {
        try {
            const user = await userModel.findOne({ _id: req.user.userId })
            if (!req.body || !req.body.password) {
                return res.send({
                    message: "Password is required!",
                    success: false
                })
            }
            if (!user) {
                return res.send({
                    message: "Something went wrong!",
                    success: false
                })
            }
            bcrypt.compare(req.body.password, user.password, async (err, result) => {
                if (!result) {
                    return res.send({
                        message: "Password do not match!",
                        success: false
                    })
                }
                const deletedUser = await userModel.findOneAndDelete({ _id: req.user.userId })
                res.send({
                    message: `Your Profile ${req.user.name} has been deleted successfully!`,
                    success: true
                })
            })

        }
        catch (err) {
            res.send({
                message: err.message ?? "Unknown error",
                success: false
            })
        }
    }
    
    // Visit Others Profile
    visitOthersProfile = async (req, res) => {
        try {
            const allProfiles = await userModel.find().select("username name")
            res.send({
                message: "All Profiles",
                result: allProfiles,
                success: true
            })
        } catch (err) {
            res.send({
                message: err.message ?? "Unknown error",
                success: false
            })
        }
    }
}
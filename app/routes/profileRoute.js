import express from "express"
import { jwtAuthMiddleware } from "../utils/jwt.js"
import { ProfileController } from "../controllers/profileController.js"

const profileRouter = express.Router()
const profileController = new ProfileController

profileRouter.get("/me", jwtAuthMiddleware, profileController.getMyProfile)
profileRouter.put("/update", jwtAuthMiddleware, profileController.updateMyProfile)
profileRouter.delete("/delete", jwtAuthMiddleware, profileController.deleteMyProfile)
profileRouter.get("/visit", jwtAuthMiddleware, profileController.visitOthersProfile)

export default profileRouter

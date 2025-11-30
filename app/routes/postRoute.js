import express from "express"
import { jwtAuthMiddleware } from "../utils/jwt.js"
import { PostController } from "../controllers/postController.js"

const postRouter = express.Router()
const postController = new PostController

postRouter.post("/new", jwtAuthMiddleware, postController.addNewPost)
postRouter.get("/all", jwtAuthMiddleware, postController.getAllPost)
postRouter.post("/like-unlike/:id", jwtAuthMiddleware, postController.likeUnlikeById)
postRouter.get("/user/likes/:id", jwtAuthMiddleware, postController.getTotalLikesById)
postRouter.put("/update/:id", jwtAuthMiddleware, postController.updatePostById)
postRouter.get("/my-posts", jwtAuthMiddleware, postController.viewMyPost)
postRouter.delete("/delete-post/:id", jwtAuthMiddleware, postController.deletePostById)

export default postRouter

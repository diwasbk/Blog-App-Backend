import mongoose, { mongo } from "mongoose"
mongoose.connect("mongodb://127.0.0.1:27017/blogApp");
const userSchema = mongoose.Schema({
    username: String,
    name: String,
    email: String,
    password: String,
    posts:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "posts"
        }
    ]
})

export default mongoose.model("users", userSchema)
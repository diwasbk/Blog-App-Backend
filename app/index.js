import express from "express"
import dotenv from "dotenv"
import authRouter from "./routes/authRoute.js";
import profileRouter from "./routes/profileRoute.js";
import postRouter from "./routes/postRoute.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

dotenv.config();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use("/api/auth", authRouter)
app.use("/api/profile", profileRouter)
app.use("/api/post", postRouter)

// Start The Server
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on the port ${PORT}`)
})
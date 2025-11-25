import express from "express"
import dotenv from "dotenv"
import authRouter from "./routes/authRoutes.js";

const app = express();

app.use(express.json());
dotenv.config()

app.use("/api/auth", authRouter)

// Start The Server
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on the port ${PORT}`)
})
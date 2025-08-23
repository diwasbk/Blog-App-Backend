import jwt from "jsonwebtoken"

// Generate Token
const generateToken = (payload) =>{
    return jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: 3000})
}

// Auth Middleware
const jwtAuthMiddleware = (req, res, next)=>{
    // Extract token from the request header
    const token = req.headers.authorization.split(" ")[1]
    // Verify Token 
    const data = jwt.verify(token, process.env.SECRET_KEY)
    // Attach user info to the request object
    req.user = data
    //Pass to the next phase
    next()
}

export {generateToken, jwtAuthMiddleware};
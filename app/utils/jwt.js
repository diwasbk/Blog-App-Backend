import jwt from "jsonwebtoken"

// Generate Token
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: 3000 })
}

// Auth Middleware
const jwtAuthMiddleware = (req, res, next) => {
    // Get token from cookie or Authorization header
    const token = req.cookies.auth_token || req.headers.authorization?.split(" ")[1];

    // Block request if token is missing
    if (!token) {
        return res.status(401).send({
            message: "Unauthorized: No token provided!",
            success: false
        })
    }

    try {
        // Verify token and attach user to request
        const data = jwt.verify(token, process.env.SECRET_KEY);
        req.user = data;
        next();

    } catch {
        // Invalid or expired token
        return res.status(401).send({
            message: "Unauthorized: Invalid or expired token",
            success: false
        });
    }
}

export { generateToken, jwtAuthMiddleware };
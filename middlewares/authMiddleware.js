// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendResponse } from "../helpers/responseHelper.js";

dotenv.config(); // Load environment variables from .env

const secretKey = process.env.JWT_SECRET || "your-secret-key"; // Secret key for JWT

// Middleware to protect routes that require authentication
export const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      status: false,
      message: "No token provided",
      payload: {},
    });
  }

  try {
    const decoded = jwt.verify(token, secretKey); // Verify token with the secret key
    req.user = decoded; // Attach user data to the request
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: "Invalid or expired token",
      payload: {},
    });
  }
};

// Middleware to check if the user is an admin
export const isAdmin = (req, res, next) => {
  if (req.user?.userType.toLowerCase() !== "admin") {
    return sendResponse(res, false, "Access denied. Not an admin.");
  }

  next(); // If the user is an admin, proceed to the next handler
};

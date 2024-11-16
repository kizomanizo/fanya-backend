import express from "express";
import { getUsers, createUser, updateUser, deleteUser, getUserById, loginUser } from "../controllers/userController.js";
import { registerValidator, loginValidator } from "../middlewares/userValidator.js"; // Assume we have these validators
import { authenticate, isAdmin } from "../middlewares/authMiddleware.js"; // Auth middleware to protect routes

const router = express.Router();

// Public routes
router.post("/register", registerValidator, createUser); // Register a new user
router.post("/login", loginValidator, loginUser); // Login (returns a token)

// Protected routes (require authentication)
router.use(authenticate); // Apply to all subsequent routes after login

// Admin routes (only admins should access these)
router.get("/", isAdmin, getUsers); // Get all users (admin only)
router.get("/:uuid", isAdmin, getUserById); // Get user by ID (authenticated users)
router.put("/:uuid", isAdmin, registerValidator, updateUser); // Update user details (authenticated users)
router.delete("/:uuid", isAdmin, deleteUser); // Delete a user (admin only)

export default router;

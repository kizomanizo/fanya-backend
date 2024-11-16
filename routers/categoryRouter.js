import express from "express";
import { createCategory, updateCategory, getCategories } from "../controllers/categoryController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { createCategoryValidator, updateCategoryValidator } from "../middlewares/categoryValidator.js"; // Import category validators
import { handleValidationErrors } from "../middlewares/handleValidationErrors.js"; // Import validation handler

const router = express.Router();

// Get all categories (protected)
router.get("/", authenticate, getCategories);

// Create a new category (protected, with validation)
router.post("/", authenticate, createCategoryValidator, handleValidationErrors, createCategory);

// Update an existing category (protected, with validation)
router.put("/:uuid", authenticate, updateCategoryValidator, handleValidationErrors, updateCategory);

export default router;

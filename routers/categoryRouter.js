import express from "express";
import { createCategory, updateCategory, getCategories, deleteCategory } from "../controllers/categoryController.js";
import { authenticate, isAdmin } from "../middlewares/authMiddleware.js";
import { createCategoryValidator, updateCategoryValidator } from "../middlewares/categoryValidator.js"; // Import category validators
import { handleValidationErrors } from "../middlewares/handleValidationErrors.js"; // Import validation handler

const router = express.Router();

// Get all categories (protected)
router.get("/", getCategories);

// Create a new category (protected, with validation)
router.post("/", authenticate, isAdmin, createCategoryValidator, handleValidationErrors, createCategory);

// Update an existing category (protected, with validation)
router.put("/:uuid", authenticate, isAdmin, updateCategoryValidator, handleValidationErrors, updateCategory);

// Delete category by uuid
router.delete("/:uuid", authenticate, isAdmin, deleteCategory);

export default router;

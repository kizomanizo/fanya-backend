import express from "express";
import { createTodo, getTodos, updateTodo, deleteTodo } from "../controllers/todoController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { createTodoValidator, updateTodoValidator } from "../middlewares/todoValidator.js"; // Import todo validators
import { handleValidationErrors } from "../middlewares/handleValidationErrors.js"; // Import validation handler

const router = express.Router();

// Get all todos for a user (protected)
router.get("/", authenticate, getTodos);

// Create a new todo (protected, with validation)
router.post("/", authenticate, createTodoValidator, handleValidationErrors, createTodo);

// Update a specific todo (protected, with validation)
router.put("/:uuid", authenticate, updateTodoValidator, handleValidationErrors, updateTodo);

// Delete a specific todo (protected)
router.delete("/:uuid", authenticate, deleteTodo);

export default router;

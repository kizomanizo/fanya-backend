import { body } from "express-validator";

export const createTodoValidator = [
  body("title").notEmpty().withMessage("Title is required").isLength({ max: 255 }).withMessage("Title should be less than 255 characters"),
  body("description").optional().isLength({ max: 1000 }).withMessage("Description should be less than 1000 characters"),
  body("dueDate").optional().isISO8601().withMessage("Due date must be a valid ISO8601 date"),
  body("uuid").optional().isUUID().withMessage("Category ID must be a valid UUID"),
];

export const updateTodoValidator = [
  body("title").optional().isLength({ max: 255 }).withMessage("Title should be less than 255 characters"),
  body("description").optional().isLength({ max: 1000 }).withMessage("Description should be less than 1000 characters"),
  body("dueDate").optional().isISO8601().withMessage("Due date must be a valid ISO8601 date"),
  body("uuid").optional().isUUID().withMessage("Category ID must be a valid UUID"),
];

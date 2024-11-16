import { body } from "express-validator";

export const createCategoryValidator = [body("name").notEmpty().withMessage("Category name is required").isLength({ max: 255 }).withMessage("Category name should be less than 255 characters")];

export const updateCategoryValidator = [body("name").optional().isLength({ max: 255 }).withMessage("Category name should be less than 255 characters")];

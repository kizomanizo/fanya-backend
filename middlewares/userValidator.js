import { body, validationResult } from "express-validator";

// Validator for user registration
export const registerValidator = [
  body("firstName").notEmpty().withMessage("First name is required").trim(),
  body("lastName").notEmpty().withMessage("Last name is required").trim(),
  body("email")
    .isEmail()
    .withMessage("Email is invalid") // Ensures it's a proper email structure
    .bail() // Stop running other validators if this one fails
    .custom((value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Strict regex for email
      if (!emailRegex.test(value)) {
        throw new Error("Email must be a valid format (e.g., user@example.com)");
      }
      return true; // Validation passed
    }),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    .matches(/[a-zA-Z]/)
    .withMessage("Password must contain a letter"),
];

// Middleware to check validation results
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: "Validation error",
      payload: errors.array(),
    });
  }

  next(); // If validation passes, proceed to the next middleware/route handler
};

// Validator for user login
export const loginValidator = [
  body("email")
    .isEmail()
    .withMessage("Email is invalid")
    .custom((value) => {
      // Additional regex to ensure valid email structure
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error("Email is invalid");
      }
      return true;
    }),
  body("password").notEmpty().withMessage("Password is required"),
];

import { PrismaClient } from "@prisma/client"; // Import Prisma Client
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { sendResponse } from "../helpers/responseHelper.js"; // Helper for consistent response

const prisma = new PrismaClient();

// Get all users (Admin only)
export const getUsers = async (req, res) => {
  try {
    // Extract pagination parameters from query, defaulting to no pagination
    const { page = 1, limit = 10 } = req.query;

    // Ensure the page and limit are numbers and set defaults
    const pageNumber = Math.max(1, parseInt(page)); // Minimum page is 1
    const limitNumber = Math.max(1, parseInt(limit)); // Minimum limit is 1
    const offset = (pageNumber - 1) * limitNumber;

    // Fetch users with pagination
    const users = await prisma.user.findMany({
      where: {
        deleted_at: null, // Only fetch non-deleted users
      },
      skip: offset,
      take: limitNumber,
    });

    // Count total users for pagination info
    const totalUsers = await prisma.user.count({
      where: {
        deleted_at: null,
      },
    });

    // Remove sensitive fields from each user
    const usersWithoutSensitiveData = users.map(({ id, password, salt, ...user }) => user);

    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / limitNumber);

    return sendResponse(res, true, "Users fetched successfully", {
      users: usersWithoutSensitiveData,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
      },
    });
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error fetching users");
  }
};

// Create a new user
export const createUser = async (req, res) => {
  const { first_name, last_name, email, password, user_type } = req.body;

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendResponse(res, false, "Email already in use");
    }

    var salt = bcrypt.genSaltSync(10);
    var hashedPassword = bcrypt.hashSync(password, salt);

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        first_name,
        last_name,
        email,
        password: hashedPassword, // Should be hashed before saving
        user_type: user_type || "USER", // Default to 'user' if not specified
        salt: salt,
        is_active: false,
      },
    });

    // Exclude the password field before returning
    const { id: _, password: __, salt: ___, ...userWithoutPassword } = newUser;

    return sendResponse(res, true, "User created successfully", { newUser: userWithoutPassword });
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error creating user");
  }
};

// Update user details
export const updateUser = async (req, res) => {
  const { uuid } = req.params;
  const { first_name, last_name, is_active, UserType } = req.body;

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { uuid } });
    if (!user) {
      return sendResponse(res, false, "User not found");
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { uuid },
      data: {
        first_name: first_name || user.first_name,
        last_name: last_name || user.last_name,
        user_type: UserType.toUpperCase() || user.user_type,
        is_active: !is_active ? false : true || user.is_active,
      },
    });

    // Exclude the password field before returning
    const { id: _, password: __, salt: ___, ...userWithoutPassword } = updatedUser;

    return sendResponse(res, true, "User updated successfully", { updatedUser: userWithoutPassword });
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error updating user");
  }
};

// Delete user (soft delete)
export const deleteUser = async (req, res) => {
  const { uuid } = req.params;

  try {
    // Find user to delete
    const user = await prisma.user.findUnique({ where: { uuid } });
    if (!user) {
      return sendResponse(res, false, "User not found");
    }

    // Soft delete (set deleted_at timestamp)
    await prisma.user.update({
      where: { uuid },
      data: { deleted_at: new Date() },
    });

    return sendResponse(res, true, "User deleted successfully");
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error deleting user");
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  const { uuid } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { uuid },
    });

    if (!user) {
      return sendResponse(res, false, "User not found");
    }

    // Exclude the password field before returning
    const { id: _, password: __, salt: ___, ...userWithoutPassword } = user;

    return sendResponse(res, true, "User fetched successfully", { user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error fetching user");
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return sendResponse(res, false, "User not found");
    }

    // Compare password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return sendResponse(res, false, "Invalid password");
    }

    // Generate JWT token
    const token = jwt.sign(
      { uuid: user.uuid, email: user.email, user_type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expiration time (1 hour)
    );

    return sendResponse(res, true, "Login successful", { token });
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error logging in");
  }
};

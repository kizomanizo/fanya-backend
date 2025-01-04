import { PrismaClient } from "@prisma/client"; // Import Prisma Client
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { sendResponse } from "../helpers/responseHelper.js"; // Helper for consistent response

const prisma = new PrismaClient();

// Get all users (Admin only)
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(1, parseInt(page));
    const limitNumber = Math.max(1, parseInt(limit));
    const offset = (pageNumber - 1) * limitNumber;

    const users = await prisma.user.findMany({
      select: {
        uuid: true,
        firstName: true,
        lastName: true,
        email: true,
        userType: true,
        isActive: true,
      },
      where: {
        deletedAt: null, // Fetch only non-deleted users
      },
      skip: offset,
      take: limitNumber,
    });

    const totalUsers = await prisma.user.count({
      where: {
        deletedAt: null,
      },
    });

    const totalPages = Math.ceil(totalUsers / limitNumber);

    return sendResponse(res, true, "Users fetched successfully", {
      users,
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
  const { firstName, lastName, email, password, userType } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendResponse(res, false, "Email already in use");
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        userType: userType || "USER",
        salt,
        isActive: false,
      },
    });

    // Exclude uneeded fields before returning
    const { id: _, password: __, salt: ___, joinDate: ____, isDeleted: _____, deletedAt: ______, createdAt: _______, updatedAt: ________, ...sanitizedUser } = newUser;

    return sendResponse(res, true, "User created successfully", { newUser: sanitizedUser });
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error creating user");
  }
};

// Update user details
export const updateUser = async (req, res) => {
  const { uuid } = req.params;
  const { firstName, lastName, isActive, userType } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { uuid } });
    if (!user) {
      return sendResponse(res, false, "User not found");
    }

    const updatedUser = await prisma.user.update({
      where: { uuid },
      data: {
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        userType: userType?.toUpperCase() || user.userType,
        isActive: isActive ?? user.isActive,
      },
    });

    const { password: __, salt: ___, ...userWithoutPassword } = updatedUser;

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
    const user = await prisma.user.findUnique({ where: { uuid } });
    if (!user) {
      return sendResponse(res, false, "User not found");
    }

    await prisma.user.update({
      where: { uuid },
      data: { deletedAt: new Date() },
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

    const { password: __, salt: ___, ...userWithoutPassword } = user;

    return sendResponse(res, true, "User fetched successfully", { user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error fetching user");
  }
};

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return sendResponse(res, false, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return sendResponse(res, false, "Invalid password");
    }

    const token = jwt.sign({ uuid: user.uuid, email: user.email, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return sendResponse(res, true, "Login successful", { token });
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error logging in");
  }
};

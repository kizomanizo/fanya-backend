import { PrismaClient } from "@prisma/client"; // Prisma Client
import { sendResponse } from "../helpers/responseHelper.js"; // Import response helper
const prisma = new PrismaClient();

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        deleted_at: null, // Only fetch categories that are not deleted
      },
    });

    return sendResponse(res, true, "Categories fetched successfully", { categories });
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error fetching categories");
  }
};

// Create a new category
export const createCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      return sendResponse(res, false, "Category already exists");
    }

    // Create the new category
    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    return sendResponse(res, true, "Category created successfully", { category });
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error creating category");
  }
};

// Update an existing category
export const updateCategory = async (req, res) => {
  const { uuid } = req.params;
  const { name, description } = req.body;

  try {
    // Find the category to update
    const category = await prisma.category.findUnique({
      where: { uuid },
    });

    if (!category) {
      return sendResponse(res, false, "Category not found");
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { uuid },
      data: {
        name: name || category.name,
        description: description || category.description,
      },
    });

    return sendResponse(res, true, "Category updated successfully", { updatedCategory });
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error updating category");
  }
};

// Soft delete a category (set deleted_at timestamp)
export const deleteCategory = async (req, res) => {
  const { uuid } = req.params;

  try {
    // Find the category to delete
    const category = await prisma.category.findUnique({
      where: { uuid },
    });

    if (!category) {
      return sendResponse(res, false, "Category not found");
    }

    // Soft delete by setting deleted_at field
    await prisma.category.update({
      where: { uuid },
      data: { deleted_at: new Date() },
    });

    return sendResponse(res, true, "Category deleted successfully");
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error deleting category");
  }
};

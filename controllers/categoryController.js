import { PrismaClient } from "@prisma/client"; // Prisma Client
import { sendResponse } from "../helpers/responseHelper.js"; // Import response helper
const prisma = new PrismaClient();

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      select: { uuid: true, name: true, description: true },
      where: {
        deletedAt: null, // Only fetch categories that are not deleted
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
    const newCategory = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    // Exclude uneeded fields before returning
    const { id: _, isDeleted: _____, deletedAt: ______, createdAt: _______, updatedAt: ________, ...sanitizedNewCategory } = newCategory;

    return sendResponse(res, true, "Category created successfully", { newCategory: sanitizedNewCategory });
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
    const cwategory = await prisma.category.findUnique({
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

    // Exclude uneeded fields before returning
    const { id: _, isDeleted: _____, deletedAt: ______, createdAt: _______, updatedAt: ________, ...sanitizedUpdatedCategory } = updatedCategory;

    return sendResponse(res, true, "Category updated successfully", { updatedCategory: sanitizedUpdatedCategory });
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error updating category");
  }
};

// Soft delete a category (set deletedAt timestamp)
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

    // Soft delete by setting deletedAt field
    await prisma.category.update({
      where: { uuid },
      data: { deletedAt: new Date() },
    });

    return sendResponse(res, true, "Category deleted successfully");
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error deleting category");
  }
};

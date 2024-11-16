import { PrismaClient } from "@prisma/client"; // Assuming you're using Prisma client
import { sendResponse } from "../helpers/responseHelper.js"; // Import the helper
const prisma = new PrismaClient();

// Get all todos for a user
export const getTodos = async (req, res) => {
  const userUuid = req.user.uuid; // Assuming user is added to request by the auth middleware

  try {
    const todos = await prisma.todo.findMany({
      where: {
        user_uuid: userUuid,
        deleted_at: null, // Exclude deleted todos
      },
      include: {
        category: true, // Include category details
        tags: true, // Include tags details
      },
    });

    return sendResponse(res, true, "Todos fetched successfully", { todos });
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error fetching todos");
  }
};

// Create a new todo
export const createTodo = async (req, res) => {
  const { title, description, due_date, category_uuid, tags } = req.body;
  const userUuid = req.user.uuid; // Assuming user is added to request by auth middleware

  try {
    // Find the category (if provided) or default to "General"
    const category = category_uuid ? await prisma.category.findUnique({ where: { uuid: category_uuid } }) : await prisma.category.findUnique({ where: { name: "General" } });

    if (!category) {
      return sendResponse(res, false, "Category not found");
    }

    // Create the new todo
    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        due_date,
        category_uuid: category_uuid,
        user_uuid: userUuid,
      },
    });

    // If tags are provided, associate them with the todo (many-to-many relationship)
    if (tags && tags.length > 0) {
      await prisma.todo.update({
        where: { uuid: todo.uuid },
        data: {
          tags: {
            connect: tags.map((tagUuid) => ({ uuid: tagUuid })),
          },
        },
      });
    }

    return sendResponse(res, true, "Todo created successfully", { todo });
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error creating todo");
  }
};

// Update an existing todo
export const updateTodo = async (req, res) => {
  const { uuid } = req.params;
  const { title, description, due_date, category_uuid, tags } = req.body;
  const userUuid = req.user.uuid; // Assuming user is added to request by the auth middleware

  try {
    // Find the todo to update
    const todo = await prisma.todo.findUnique({
      where: { uuid },
      include: { tags: true },
    });

    if (!todo || todo.user_uuid !== userUuid) {
      return sendResponse(res, false, "Todo not found or not authorized to update this todo");
    }

    // Find the category (if provided)
    const category = category_uuid ? await prisma.category.findUnique({ where: { uuid: category_uuid } }) : null;

    // Update the todo
    const updatedTodo = await prisma.todo.update({
      where: { uuid },
      data: {
        title: title || todo.title,
        description: description || todo.description,
        due_date: due_date || todo.due_date,
        category_uuid: category ? category_uuid : todo.category_uuid,
      },
    });

    // If tags are provided, update the tags (many-to-many relationship)
    if (tags && tags.length > 0) {
      await prisma.todo.update({
        where: { uuid },
        data: {
          tags: {
            connect: tags.map((tagId) => ({ uuid: tagUuid })),
          },
        },
      });
    }

    return sendResponse(res, true, "Todo updated successfully", { updatedTodo });
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error updating todo");
  }
};

// Soft delete a todo (set deleted_at timestamp)
export const deleteTodo = async (req, res) => {
  const { uuid } = req.params;
  const userUuid = req.user.uuid; // Assuming user is added to request by auth middleware

  try {
    // Find the todo to delete
    const todo = await prisma.todo.findUnique({
      where: { uuid },
      include: { tags: true },
    });

    if (!todo || todo.user_uuid !== userUuid) {
      return sendResponse(res, false, "Todo not found or not authorized to delete this todo");
    }

    // Soft delete by setting deleted_at field
    await prisma.todo.update({
      where: { uuid },
      data: { deleted_at: new Date() },
    });

    return sendResponse(res, true, "Todo deleted successfully");
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error deleting todo");
  }
};

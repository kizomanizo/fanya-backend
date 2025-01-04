import { PrismaClient } from "@prisma/client"; // Assuming you're using Prisma client
import { sendResponse } from "../helpers/responseHelper.js"; // Import the helper
const prisma = new PrismaClient();

// Get all todos for a user with pagination
export const getTodos = async (req, res) => {
  const userUuid = req.user.uuid; // Assuming user is added to request by the auth middleware
  const { page = 1, limit = 10 } = req.query; // Retrieve page and limit from query params (defaults to 1 and 10)

  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);

  try {
    // Get paginated todos for the user
    const todos = await prisma.todo.findMany({
      select: {
        uuid: true,
        title: true,
        description: true,
        completed: true,
        dueDate: true,
        category: { select: { name: true, uuid: true } },
      },
      where: {
        userUuid: userUuid,
        deletedAt: null, // Exclude deleted todos
      },
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    });

    // Send response with todos
    sendResponse(res, 200, "Todos retrieved successfully", todos);
  } catch (error) {
    // Handle error and send response
    sendResponse(res, 500, "An error occurred while retrieving todos", error.message);
  }
};

// Create a bew todo and attach its tags
export const createTodo = async (req, res) => {
  const { title, description, dueDate, categoryUuid, tags } = req.body;
  const userUuid = req.user.uuid; // Assuming user is added to request by auth middleware

  try {
    // Find the category (if provided) or default to "General"
    const category = categoryUuid ? await prisma.category.findUnique({ where: { uuid: categoryUuid } }) : await prisma.category.findUnique({ where: { name: "General" } });

    if (!category) {
      return sendResponse(res, false, "Category not found");
    }

    // Create the new todo
    const newTodo = await prisma.todo.create({
      data: {
        title,
        description,
        dueDate,
        categoryUuid: categoryUuid,
        userUuid: userUuid,
        tags: {
          create: tags.map((tagName, tagId) => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName },
              },
            },
          })),
        },
      },
    });

    // Exclude unneeded fields before returning
    const { id: _, isDeleted: _____, deletedAt: ______, createdAt: _______, updatedAt: ________, ...sanitizedNewTodo } = newTodo;

    return sendResponse(res, true, "Todo created successfully", { newTodo: sanitizedNewTodo });
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error creating todo");
  }
};

// Update an existing todo
export const updateTodo = async (req, res) => {
  const { uuid } = req.params;
  const { title, description, dueDate, categoryUuid, tags } = req.body;
  const userUuid = req.user.uuid; // Assuming user is added to request by the auth middleware

  try {
    // Find the todo to update
    const todo = await prisma.todo.findUnique({
      where: { uuid },
      include: { tags: true },
    });

    if (!todo || todo.userUuid !== userUuid) {
      return sendResponse(res, false, "Todo not found or not authorized to update this todo");
    }

    // Find the category (if provided)
    const category = categoryUuid ? await prisma.category.findUnique({ where: { uuid: categoryUuid } }) : null;

    // Update the todo
    const updatedTodo = await prisma.todo.update({
      where: { uuid },
      data: {
        title: title || todo.title,
        description: description || todo.description,
        dueDate: dueDate || todo.dueDate,
        categoryUuid: category ? categoryUuid : todo.categoryUuid,
      },
    });

    // If tags are provided, update the tags (many-to-many relationship)
    if (tags && tags.length > 0) {
      await prisma.todo.update({
        where: { uuid },
        data: {
          tags: {
            connect: tags.map((tagUuid) => ({ uuid: tagUuid })),
          },
        },
      });
    }

    // Exclude uneeded fields before returning
    const { id: _, isDeleted: _____, deletedAt: ______, createdAt: _______, updatedAt: ________, ...sanitizedUpdatedTodo } = updatedTodo;

    return sendResponse(res, true, "Todo updated successfully", { updatedTodo: sanitizedUpdatedTodo });
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error updating todo");
  }
};

// Soft delete a todo (set deletedAt timestamp)
export const deleteTodo = async (req, res) => {
  const { uuid } = req.params;
  const userUuid = req.user.uuid; // Assuming user is added to request by auth middleware

  try {
    // Find the todo to delete
    const todo = await prisma.todo.findUnique({
      where: { uuid },
      include: { tags: true },
    });

    if (!todo || todo.userUuid !== userUuid) {
      return sendResponse(res, false, "Todo not found or not authorized to delete this todo");
    }

    // Soft delete by setting deletedAt field
    await prisma.todo.update({
      where: { uuid },
      data: { deletedAt: new Date() },
    });

    return sendResponse(res, true, "Todo deleted successfully");
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error deleting todo");
  }
};

// Get many todos by a tag name
export const getTodosByTagName = async (req, res) => {
  const { tagName } = req.params; // Retrieve tag name from request params
  const { page = 1, limit = 10 } = req.query; // Retrieve page and limit from query params (defaults to 1 and 10)
  const userUuid = req.user.uuid; // User UUID from auth middleware

  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);

  try {
    // Find todos with a matching tag name and apply pagination
    const todos = await prisma.todo.findMany({
      where: {
        tags: {
          some: {
            tag: {
              name: tagName,
            },
          },
        },
        userUuid: userUuid,
      },
      include: {
        tags: {
          include: {
            tag: {
              select: {
                name: true,
                uuid: true,
              },
            },
          },
        },
      },
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    });

    // Get the total count of todos for the given tag (used for pagination metadata)
    const totalTodos = await prisma.todo.count({
      where: {
        tags: {
          some: {
            tag: {
              name: tagName,
            },
          },
        },
        userUuid: userUuid,
      },
    });

    // Check if any todos were found
    if (todos.length === 0) {
      return sendResponse(res, false, `No todos found with tag: ${tagName}`);
    }

    // Sanitize the todos and their tags
    const sanitizedTodos = todos.map((todo) => {
      const sanitizedTags = todo.tags.map((todoTag) => ({
        name: todoTag.tag.name,
        uuid: todoTag.tag.uuid,
      }));
      const { id: _, isDeleted: _____, deletedAt: ______, createdAt: _______, updatedAt: ________, ...sanitizedTodo } = todo;
      return {
        ...sanitizedTodo,
        tags: sanitizedTags,
      };
    });

    // Pagination metadata
    const pagination = {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalTodos / pageSize),
      pageSize,
      totalItems: totalTodos,
    };

    return sendResponse(res, true, `Found todos with tag: ${tagName}`, {
      todos: sanitizedTodos,
      pagination,
    });
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error fetching todos");
  }
};

// Get a single todo by its uuid
export const getTodoByUuid = async (req, res) => {
  const { uuid } = req.params; // Assuming todo uuid is passed in the route params
  const userUuid = req.user.uuid; // From authMiddleware

  try {
    // Fetch the todo with the given uuid
    const todo = await prisma.todo.findUnique({
      where: {
        uuid,
        userUuid: userUuid,
      },
      select: {
        uuid: true,
        title: true,
        description: true,
        completed: true,
        dueDate: true,
        category: { select: { name: true, uuid: true } },
        tags: {
          select: {
            tag: {
              // Access the related Tag model
              select: {
                name: true,
                uuid: true,
              },
            },
          },
        },
      },
    });

    // Check if the todo was found
    if (!todo) {
      return sendResponse(res, false, `Todo with uuid ${uuid} not found`);
    }

    // Return the todo
    return sendResponse(res, true, "Todo fetched successfully", { todo });
  } catch (err) {
    console.error(err);
    return sendResponse(res, false, "Error fetching todo");
  }
};

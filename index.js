// Import necessary modules
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

// Import routes
import userRoutes from "./routers/userRouter.js";
import todoRoutes from "./routers/todoRouter.js";
import categoryRoutes from "./routers/categoryRouter.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

const PORT = process.env.NODE_PORT || 5000;

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(morgan("dev")); // Log HTTP requests

// Define API routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/todos", todoRoutes);
app.use("/api/v1/categories", categoryRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).send(
    "<div style='text-align: center; color: brown; height: 100%; width: 100%; margin: 0; padding: 10px;'> \
        <h2>Welcome to Fanya API!</h2> \
        <br> \
        <p>Please append <strong>/api/v1/</strong> in your requests.</p> \
    </div>"
  );
});

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Resource not found", payload: null });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error", payload: null });
});

// Start the server
app.listen(PORT, () => {
  console.log("PORT", PORT);
  console.log(`Server running on port ${PORT}`);
});

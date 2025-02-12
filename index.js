const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const next = require("next"); // Next.js must be initialized before express
const cookieParser = require("cookie-parser");
const path = require("path");

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Import routes
const authRoute = require("./Api/routes/auth");
const userRoute = require("./Api/routes/users");
const postRoute = require("./Api/routes/posts");
const commentRoute = require("./Api/routes/comments");
const storyRoute = require("./Api/routes/stories");
const conversationRoute = require("./Api/routes/conversations");
const messageRoute = require("./Api/routes/messages");

// Import middlewares
const { errorHandler } = require("./Api/middlewares/error");
const verifyToken = require("./Api/middlewares/verifyToken");

// Initialize Next.js
const dev = process.env.NODE_ENV !== "production";
const nextServer = next({ dev });
const handle = nextServer.getRequestHandler();

// **Use the correct MongoDB connection**
const databaseUrl = process.env.MONGO_URI; // ✅ Ensure this is correct!

// Connect to MongoDB
mongoose
  .connect(databaseUrl)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => console.error("DB connection failed:", err));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/user", verifyToken, userRoute);
app.use("/api/post", verifyToken, postRoute);
app.use("/api/comment", verifyToken, commentRoute);
app.use("/api/story", verifyToken, storyRoute);
app.use("/api/conversation", verifyToken, conversationRoute);
app.use("/api/message", verifyToken, messageRoute);

// Error handling middleware
app.use(errorHandler);

// Prepare Next.js and start the server
nextServer.prepare().then(() => {
  // Handle all requests with Next.js
  app.all("*", (req, res) => {
    return handle(req, res);
  });

  // Start the server
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Prevent process exit in Railway
  process.on("SIGTERM", () => {
    console.log("Process terminated! Restarting...");
  });

  process.on("SIGINT", () => {
    console.log("Process interrupted! Restarting...");
  });
});

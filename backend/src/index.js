import express from "express";
import authRoutes from "./routes/authRoutes.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import messagesRoutes from "./routes/messagesRoutes.js";
import cors from "cors";
import { app, server } from "./lib/socket.js";
import path from "path";
import fs from "fs";

// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // change to your frontend prod URL later
    credentials: true,
  })
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messagesRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "frontend-dist");

  if (fs.existsSync(staticPath)) {
    app.use(express.static(staticPath));

    // Catch-all for React Router
    app.get("*", (req, res) => {
      res.sendFile(path.join(staticPath, "index.html"));
    });
  } else {
    app.get("*", (req, res) => {
      res.status(500).json({
        error: "Frontend not built",
        message: "Please run the build process",
      });
    });
  }
} else {
  // Development mode route
  app.get("/", (req, res) => {
    res.json({ message: "API is running in development mode" });
  });
}

// Start server
server.listen(PORT, () => {
  console.log("✅ Server listening on port: " + PORT);
  connectDB();
});

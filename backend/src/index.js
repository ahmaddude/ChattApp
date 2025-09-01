import express from "express";
import authRoutes from "./routes/authRoutes.js";
import dotenv from "dotenv";
import {connectDB}from "./lib/db.js"
import cookieParser from "cookie-parser";
import messagesRoutes from "./routes/messagesRoutes.js";
import cors from "cors";
import {app,server} from "./lib/socket.js"
import path from "path";




dotenv.config();
const PORT=process.env.PORT || 5000;
const __dirname=path.resolve();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))


app.use("/api/auth",authRoutes);
app.use("/api/messages",messagesRoutes);

if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "frontend", "dist");
  
  // Check if build files exist
  if (fs.existsSync(staticPath)) {
    app.use(express.static(staticPath));
    
    // Serve React app for all non-API routes
    app.get(/^(?!\/api).*/, (req, res) => {
      const indexPath = path.join(staticPath, "index.html");
      
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Frontend build files not found");
      }
    });
  } else {
    // Fallback if build directory doesn't exist
    app.get("*", (req, res) => {
      res.status(500).json({
        error: "Frontend not built",
        message: "Please run the build process"
      });
    });
  }
} else {
  // Development mode - simple API status
  app.get("/", (req, res) => {
    res.json({ message: "API is running in development mode" });
  });
}


server.listen(PORT,()=>{
    console.log("Server is listening on port: "+PORT);
    connectDB()
});
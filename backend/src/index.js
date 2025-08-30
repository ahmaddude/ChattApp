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

if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));

    app.get("*",(req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend","dist","index.html"))
    })
}


server.listen(PORT,()=>{
    console.log("Server is listening on port: "+PORT);
    connectDB()
});
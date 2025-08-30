import express from "express";
import {protectRoute} from "../middleware/auth.middleware.js"
import { searchUsers, sendMessage } from "../controllers/messageController.js";
import { addFriend } from "../controllers/messageController.js";
import { getFriends } from "../controllers/messageController.js";
import { getMessages } from "../controllers/messageController.js";
import multer from "multer";



const router=express.Router();


router.get("/search-users",protectRoute,searchUsers)

router.post("/add-friend/:friendId",protectRoute,addFriend)

router.get("/friends",protectRoute,getFriends )

router.get("/get-messages/:id",protectRoute,getMessages)

const upload = multer({ storage: multer.memoryStorage() });

// Route
router.post(
  "/send/:id",
  protectRoute,
  upload.single("file"), // this must match frontend FormData key
  sendMessage
);

export default router;
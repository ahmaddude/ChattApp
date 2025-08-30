import express from 'express';
import { signup, login, logout, updateProfile, checkAuth, verifyEmail } from '../controllers/authController.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import multer from "multer"
const router = express.Router();

// Setup multer (store in memory so we can send buffer to Supabase)
const upload = multer({ storage: multer.memoryStorage() });

router.post('/signup', signup);
router.post('/verify-email', verifyEmail);

router.post('/login', login);
router.post('/logout', logout);

// 👇 fixed typo + added multer
router.put('/update-profile', protectRoute, upload.single("profilePic"), updateProfile);

router.get('/check-auth', protectRoute,checkAuth); 

export default router;

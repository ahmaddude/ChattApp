import { generateToken } from '../lib/utils.js';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { supabase } from "../lib/supabaseClient.js";
import crypto from "crypto";
import { sendMail } from "../lib/mailer.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a random 6-digit code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpires,
    });

    await newUser.save();

    // Send verification email
    await sendMail({
      to: email,
      subject: "Verify your ChatApp account",
      text: `Your verification code is ${verificationCode}`,
      html: `<p>Your verification code is <b>${verificationCode}</b>. It expires in 15 minutes.</p>`,
    });
    generateToken(newUser._id,res);
res.status(201).json({ 
  message: "User created. Please verify your email.",
  user: {
    ...newUser._doc,
    password: undefined
  }
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid email" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified" });

    if (
      user.verificationCode !== code ||
      Date.now() > user.verificationCodeExpires
    ) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;

    await user.save();

    res.json({ success:true,message: "Email verified successfully",user: {
    ...user._doc,
    password: undefined
  } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", });
  }
};


export const login=async(req, res) => {
    const{email,password}=req.body;

    try {
        if(!email || !password){
            return res.status(400).json({message:"Please provide all required fields"});
        }

        const user=await User.findOne({email});
        if (!user.isVerified) {
            return res.status(400).json({ message: "Please verify your email first" });
        }
        if(!user){
            return res.status(400).json({message:"Invalid credentials"});
        }
        const isPasswordCorrect= await bcrypt.compare(password,user.password);

        if(!isPasswordCorrect){
        return res.status(400).json({message:"Invalid credentials"});
        }

        generateToken(user._id,res);

        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic: user.profilePic,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Server error"});
    }
}

export const logout=(req, res) => {
    try {
        res.cookie("jwt","",{
        maxAge:0});
    res.status(200).json({message:"Logged out successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Server error"})
    }
}

export const updateProfile = async (req, res) => {
  try {
    const { fullName } = req.body;
    const userId = req.user._id; // assuming you set req.user in auth middleware
    const file = req.file; // image uploaded via multer

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profilePicUrl = user.profilePic; // keep old one if no upload

    // === Handle image upload ===
    if (file) {
      const fileName = `avatars/${userId}-${Date.now()}-${file.originalname}`;

      // Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from("chat-images")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error(uploadError);
        return res.status(500).json({ message: "Image upload failed" });
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from("chat-images")
        .getPublicUrl(fileName);

      profilePicUrl = publicUrlData.publicUrl;
    }

    // === Update user fields ===
    if (fullName) user.fullName = fullName;
    user.profilePic = profilePicUrl;

    await user.save();

    // Return updated user to frontend
    res.json({
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkAuth = (req, res) => {
    try {
        
        res.status(200).json(req.user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "error in checkAuth " });
    }
}
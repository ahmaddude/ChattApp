import User from "../models/userModel.js";
import Message from "../models/messageModel.js";
import { supabase } from "../lib/supabaseClient.js";
import { getReceiverSocketId,io } from "../lib/socket.js";


export const searchUsers=async(req,res)=>{
      try {
    const { name } = req.query;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Search term must be a string" });
    }

    const users = await User.find({
      fullName: { $regex: name, $options: "i" },
    }).select("-password");

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addFriend=async(req,res)=>{
  const userId = req.user._id;
  const friendId = req.params.friendId;

  if (userId.toString() === friendId) {
    return res.status(400).json({ message: "You cannot add yourself" });
  }

  // add friend to both users
  try {
    await User.findByIdAndUpdate(userId, { $addToSet: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $addToSet: { friends: userId } });
  
    res.json({ message: "Friend added successfully" }); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export const getFriends=async(req,res)=>{
   const user = await User.findById(req.user._id)
    .populate("friends", "fullName email profilePic")
    .select("friends");
  res.json(user.friends);
}

export const getMessages=async(req,res)=>{
try {
  const {id}=req.params;
  const myId=req.user._id;

  const messages=await Message.find({
    $or:[
      {senderId: id,receiverId:myId},
      {senderId:myId,receiverId:id}
    ]
  })
  res.status(200).json(messages)
} catch (error) {
  console.error(error);
  res.status(500).json({message:"Server error"})
}
}

export const sendMessage=async(req,res)=>{
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;

    // 1. If image is included in request
    if (req.file) {
      const file = req.file;
      const fileName = `chat-${senderId}-${Date.now()}-${file.originalname}`;

      const { error } = await supabase.storage
        .from("chat-images")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        return res.status(400).json({ message: "Image upload failed" });
      }

      const { data } = supabase.storage
        .from("chat-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    // 2. Save message in MongoDB
    const message = await Message.create({
      senderId: senderId,
      receiverId: receiverId,
      text,
      image: imageUrl || "",
    });

    const receiverSocketId=getReceiverSocketId(receiverId);
    if(receiverSocketId){
      io.to(receiverSocketId).emit("newMessage",message);
    }

    res.status(201).json(message);
    console.log("Message sent:", message);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
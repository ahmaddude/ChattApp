import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
  users: [],
  messages:[],
  selectedUser: null,
  friends: [],
  isUsersLoading: false,
  isMessagesLoading: false,

  // Fetch friends
  getfriends: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/friends", { withCredentials: true });
      set({ friends: res.data, isUsersLoading: false });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load friends");
      set({ isUsersLoading: false });
    }
  },

  // Search users by name
  searchUsers: async (name) => {
    if (!name) return set({ users: [] });
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/search-users?name=${name}`, {
        withCredentials: true,
      });
      set({ users: res.data, isUsersLoading: false });
    } catch (err) {
      console.error(err);
      toast.error("Search failed");
      set({ isUsersLoading: false });
    }
  },

  // Add a friend
  addFriend: async (friendId) => {
    try {
      await axiosInstance.post(`/messages/add-friend/${friendId}`, {}, { withCredentials: true });
      toast.success("Friend added");
      get().getfriends(); // refresh friends list
    } catch (err) {
      console.error(err);
      toast.error("Failed to add friend");
    }
  },

  getMessages: async (userId) => {
      set({ isMessagesLoading: true });
      try {
        // Make sure userId is a string
        const res = await axiosInstance.get(
          `/messages/get-messages/${String(userId)}`,
          { withCredentials: true }
        );
        set({ messages: res.data, isMessagesLoading: false });
        console.log(res.data); // should now log messages
      } catch (error) {
        console.error(error);
        toast.error("Failed to load messages");
        set({ isMessagesLoading: false });
      }
  },

    sendMessage: async ({ text = "", imageFile = null }) => {
  const { messages, selectedUser } = get();

  try {
   const formData = new FormData();
formData.append("text", text);
if (imageFile) formData.append("file", imageFile); // must match Multer field
const res=await axiosInstance.post(
  `/messages/send/${selectedUser._id}`,
  formData,
  { withCredentials: true }
);


    set({ messages: [...messages, res.data] });
    console.log(res.data);
  } catch (err) {
    console.error(err);
    toast.error("Failed to send message");
  }
},

    subscribeToMessages:()=>{
      const {selectedUser}=get()
      if(!selectedUser)return;

      const socket=useAuthStore.getState().socket;

      socket.on("newMessage",(message)=>{
        if(message.senderId!==selectedUser._id) return;
        set({
          messages:[...get().messages,message],
        })
      })
    },

    unSubscribeFromMessages:()=>{
      const socket=useAuthStore.getState().socket;
      socket.off("newMessage");

    },


  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));

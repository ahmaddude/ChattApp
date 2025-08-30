import {create} from 'zustand';
import {axiosInstance} from '../lib/axios.js';
import toast from 'react-hot-toast';
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";


export const useAuthStore = create((set,get) => ({

    authUser:null,
    isAuthintecated:false,
    isSigningUp:false,
    isLoggingIn:false,
    isUpdatingProfile:false,
    isCheckingAuth:true,
    isVerified:false,
    onlineUsers:[],
    socket:null,

    checkAuth: async () => {
        try {
            const res=await axiosInstance.get('/auth/check-auth',{withCredentials:true});
            set({authUser:res.data,isCheckingAuth:false,isAuthintecated:true,isVerified:res.data.isVerified})
            get().connectSocket();
        } catch (error) {
            
    if (error.response?.status !== 401) console.log("error in check auth", error);
    set({authUser: null, isCheckingAuth: false, isAuthintecated: false, isVerified: false})

        }
    },

    signUp:async(data)=>{
        set({isSigningUp:true})
        try {
            const res=await axiosInstance.post('/auth/signup',data,{withCredentials:true});
            set({authUser:res.data,isSigningUp:false,isAuthintecated:true})
            toast.success("Signup successful");
            get().connectSocket();

        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed");
            set({isSigningUp:false})
        }
    },

    verifyEmail: async (email, code) => {
  try {
    const res = await axiosInstance.post(
      "/auth/verify-email",
      { email, code },
      { withCredentials: true }
    );
    toast.success(res.data.message);
    
    set({authUser:res.data.user,isVerified:true})

  } catch (error) {
    toast.error(error.response?.data?.message || "Verification failed");
  }
},

    login:async(data)=>{
        set({isLoggingIn:true})
        try {
            set({isLoggingIn:true})
            const res=await axiosInstance.post('/auth/login',data,{withCredentials:true});
            set({authUser:res.data,isLoggingIn:false,isAuthintecated:true,isVerified:res.data.isVerified});
            toast.success("Login successful");
            get().connectSocket();
        } catch (error) {
            set({isLoggingIn:false})
            toast.error(error.response?.data?.message || "Login failed");

        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout',{}, { withCredentials: true });
            set({authUser:null,isAuthintecated:false})
            toast.success("Logged out successfully")
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed");
        }
    },

    updateProfile: async (data) => {
  set({ isUpdatingProfile: true });
  try {
    let formData;

    if (data.profilePic instanceof File) {
      formData = new FormData();
      formData.append("profilePic", data.profilePic);
      if (data.fullName) formData.append("fullName", data.fullName);

      const res = await axiosInstance.put("/auth/update-profile", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      set((state) => ({ authUser: { ...state.authUser, ...res.data }, isUpdatingProfile: false }));
      toast.success("Profile updated successfully");
    } else {
      // for text-only updates
      const res = await axiosInstance.put("/auth/update-profile", data, { withCredentials: true });
      set((state) => ({ authUser: { ...state.authUser, ...res.data }, isUpdatingProfile: false }));
      toast.success("Profile updated successfully");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Profile update failed");
    set({ isUpdatingProfile: false });
  }
},

    updateName: async (fullName) => {
  set({ isUpdatingProfile: true });
  try {
    const res = await axiosInstance.put("/users/update-profile", { fullName }, { withCredentials: true });
    set({ authUser: res.data.user, isUpdatingProfile: false });
    toast.success("Name updated successfully!");
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Failed to update name");
    set({ isUpdatingProfile: false });
  }
},

    connectSocket: () => {
      const {authUser}=get()
      if(!authUser || get().socket?.connected)return ;
        const socket =io(BASE_URL,{
          query:{
            userId:authUser._id,
          }
        })
        socket.connect();
        set({socket:socket});

        socket.on("getOnlineUsers",(userIds)=>{
          set({onlineUsers:userIds})
        })
    },

    disconnectSocket: () => {
        if(get().socket?.connected)get().socket.disconnect();
    },

}))
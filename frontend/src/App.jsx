// import Navbar from "./components/Navbar.jsx";
// import { Routes, Route, Navigate } from "react-router-dom";
// import HomePage from "./pages/HomePage.jsx";
// import SignUpPage from "./pages/SignUpPage.jsx";
// import LoginPage from "./pages/LoginPage.jsx";
// import SittingsPage from "./pages/SittingsPage.jsx";
// import ProfilePage from "./pages/ProfilePage.jsx";
// import SearchFriendsPage from "./pages/SearchFriendsPage.jsx";
// import VerifyPage from "./pages/VerifyAccountPage.jsx";
// import { useAuthStore } from "./store/useAuthStore.js";
// import { useEffect } from "react";
// import { Loader } from "lucide-react";
// import { Toaster } from "react-hot-toast";
// import { useThemeStore } from "./store/useThemeStore.js";

// const App = () => {
//   const isCheckingAuth = useAuthStore(state => state.isCheckingAuth);
//   const isAuthintecated = useAuthStore(state => state.isAuthintecated);
//   const isVerified = useAuthStore(state => state.isVerified);
//   const checkAuth = useAuthStore(state => state.checkAuth);
//   const {theme}=useThemeStore()
  

//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   if (isCheckingAuth) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Loader className="size-10 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div data-theme={theme}>
//       <Navbar />
          


//       <Routes>
//         <Route
//           path="/"
//           element={
//             !isAuthintecated ? (
//               <Navigate to="/login" replace />
//             ) : !isVerified ? (
//               <Navigate to="/verify-account" replace />
//             ) : (
//               <HomePage />
//             )
//           }
//         />
        
//         <Route
//           path="/signup"
//           element={
//             isAuthintecated ? (
//               <Navigate to={isVerified ? "/" : "/verify-account"} replace />
//             ) : (
//               <SignUpPage />
//             )
//           }
//         />
        
//         <Route
//           path="/login"
//           element={
//             isAuthintecated ? (
//               <Navigate to={isVerified ? "/" : "/verify-account"} replace />
//             ) : (
//               <LoginPage />
//             )
//           }
//         />
        
//         <Route
//           path="/verify-account"
//           element={
//             !isAuthintecated ? (
//               <Navigate to="/login" replace />
//             ) : isVerified ? (
//               <Navigate to="/" replace />
//             ) : (
//               <VerifyPage />
//             )
//           }
//         />
        
//         <Route
//           path="/settings"
//           element={
//             !isAuthintecated ? (
//               <Navigate to="/login" replace />
//             ) : !isVerified ? (
//               <Navigate to="/verify-account" replace />
//             ) : (
//               <SittingsPage />
//             )
//           }
//         />

//         <Route
//           path="/search"
//           element={
//             !isAuthintecated ? (
//               <Navigate to="/login" replace />
//             ) : !isVerified ? (
//               <Navigate to="/verify-account" replace />
//             ) : (
//               <SearchFriendsPage />
//             )
//           }
//         />
        
//         <Route
//           path="/profile"
//           element={
//             !isAuthintecated ? (
//               <Navigate to="/login" replace />
//             ) : !isVerified ? (
//               <Navigate to="/verify-account" replace />
//             ) : (
//               <ProfilePage />
//             )
//           }
//         />
//       </Routes>

//       <Toaster />
//     </div>
//   );
// };

// export default App;

import React, { useEffect } from 'react'
import Navbar from './components/Navbar'
import { Routes,Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LogInPage from './pages/LogInPage'
import SettingsPage from './pages/SittingsPage'
import ProfilePage from './pages/ProfilePage'
import VerifyAccountPage from './pages/VerifyAccountPage'
import {Loader} from "lucide-react";
import { useAuthStore } from './store/useAuthStore'
import {Toaster} from 'react-hot-toast'
import { useThemeStore } from './store/useThemeStore'
import SearchFriendsPage from './pages/SearchFriendsPage'
const App = () => {
  const {authUser,checkAuth,isCheckingAuth, onlineUsers}=useAuthStore()
const {theme}=useThemeStore()

console.log("online users:",{onlineUsers});

  useEffect(()=>{
    checkAuth()
  },[checkAuth]);
  console.log({authUser});

  if( isCheckingAuth && !authUser)
    return(
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin"/> 
    </div>
  )


  return (
    <div data-theme={theme}>
      
      <Navbar/>
     <div className='mt-15'>
       <Routes>
        <Route path="/"element={authUser?<HomePage/>:<Navigate to="/login"/> }/>
        <Route path="/signup"element={!authUser?<SignUpPage/>:<Navigate to="/"/> }/>
        <Route path="/login"element={!authUser?<LogInPage/>:<Navigate to="/"/> }/>
        <Route path="/verify-account"element={<VerifyAccountPage/> }/>
        <Route path="/search"element={authUser?<SearchFriendsPage/>:<Navigate to="/login"/>  }/>
        <Route path="/settings"element={<SettingsPage/> }/>
        <Route path="/profile"element={authUser?<ProfilePage/>:<Navigate to="/login"/>  }/>

      </Routes>
     </div>
      <Toaster/>
    </div>
  )
}

export default App

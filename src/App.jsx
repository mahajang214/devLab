import React from "react";
import { createBrowserRouter, RouterProvider, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Singup from "./component/singup/Singup";
import Login from "./component/login/login";
import ProtectedRoute from "./component/protection/ProtectedRoute";
import HomePage from "./component/home/HomePage";
import Followings from "./component/followings/Followings";
import Coders from "./component/coders/Coders";
import Projects from "./component/projects/Projects";
import Followers from "./component/followers/Followers";
import Code from "./component/codingEnv/Code";

const router = createBrowserRouter(
  [
    {
      path: "/signup",
      element: <Singup />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      ),
    },
    {
      path: "/followings",
      element: (
        <ProtectedRoute>
          <Followings />
        </ProtectedRoute>
      ),
    },
    {
      path: "/coders",
      element: (
        <ProtectedRoute>
          <Coders />
        </ProtectedRoute>
      ),
    },
    {
      path: "/projects",
      element: (
        <ProtectedRoute>
          <Projects />
        </ProtectedRoute>
      ),
    },
    {
      path: "/followers",
      element: (
        <ProtectedRoute>
          <Followers />
        </ProtectedRoute>
      ),
    },
    {
      path: "/code",
      element: (
        <ProtectedRoute>
          <Code />
        </ProtectedRoute>
      ),
    },
  ],
  { basename: "/devLab",
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

function App() {
  // return (

  //   <GoogleOAuthProvider clientId="743381597720-re5o31017c6lvqbr3mgge0h5vaqmklqj.apps.googleusercontent.com">
  //     <BrowserRouter  future={{ v7_relativeSplatPath: true }}>
  //       <Routes>
  //         <Route path="/singup" element={<Singup />} />
  //         <Route path="/login" element={<Login />} />
  //         {/* security */}

  //             <Route path="/" element={
  //               <ProtectedRoute>
  //                 <HomePage />
  //               </ProtectedRoute>
  //             } />
  //             <Route path="/followings" element={
  //               <ProtectedRoute>
  //                 <Followings />
  //               </ProtectedRoute>
  //             } />
  //             <Route path="/coders" element={
  //               <ProtectedRoute>
  //                 <Coders />
  //               </ProtectedRoute>
  //             } />
  //             <Route path="/projects" element={
  //               <ProtectedRoute>
  //                 <Projects />
  //               </ProtectedRoute>
  //             } />
  //             <Route path="/followers" element={
  //               <ProtectedRoute>
  //                 <Followers />
  //               </ProtectedRoute>
  //             } />
  //             <Route path="/code" element={
  //               <ProtectedRoute>
  //                 <Code />
  //               </ProtectedRoute>
  //             } />

  //       </Routes>
  //     </BrowserRouter>
  //   </GoogleOAuthProvider>
  // );
  
  return (
    <GoogleOAuthProvider clientId="743381597720-re5o31017c6lvqbr3mgge0h5vaqmklqj.apps.googleusercontent.com">
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  );
}

export default App;

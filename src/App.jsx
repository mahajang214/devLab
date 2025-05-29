import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Singup from "./component/singup/Singup";
import Login from "./component/login/login";
import ProtectedRoute from "./component/protection/ProtectedRoute";
import HomePage from "./component/home/HomePage";

function App() {
  return (
    <GoogleOAuthProvider clientId="743381597720-re5o31017c6lvqbr3mgge0h5vaqmklqj.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          <Route path="/singup" element={<Singup />} />
          <Route path="/login" element={<Login />} />
          {/* security */}
          <Route element={<ProtectedRoute/>}>
              <Route path="/" element={<HomePage/>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;

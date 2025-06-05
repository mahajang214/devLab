import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Loading from "./component/loading/Loading";
import MonacoEditor from "./component/codingEnv/MonacoEditor";

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
              <Route path="/followings" element={<Followings/>}/>
              <Route path="/coders" element={<Coders/>}/>
              <Route path="/projects" element={<Projects/>}/>
              <Route path="/followers" element={<Followers/>}/>
              <Route path="/code" element={<Code/>}/>
              <Route path="/loading" element={<Loading/>} />
              <Route path="/monaco" element={<MonacoEditor/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;

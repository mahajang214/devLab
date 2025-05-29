import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import {Link, useNavigate} from 'react-router-dom'

function Login() {
  const [user, setUser] = useState(null);
    const navigete=useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      // console.log("google credentials: ", idToken);

      // Send to backend
      const res = await axios.post("http://localhost:3001/auth/google", {
        token: idToken,
      });

      // Save your JWT or session token
      localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    navigete("/");
  
    } catch (error) {
      console.log("error :", error.message);
    alert("Authentication failed. Please try again.");
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => console.log("Login Failed")}
        >
          <button className="mt-4 w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 cursor-pointer rounded-md hover:bg-gray-200 transition duration-200">
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5"
            />
           login with Google
          </button>
        </GoogleLogin>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/singup" className="text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

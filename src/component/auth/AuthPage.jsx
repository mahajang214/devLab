import React, { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import GoogleLogin from "../login/GoogleLogin"

const AuthPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwt_decode(token);
      setUser(decoded);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm w-full">
        {user ? (
          <>
            <h2 className="text-2xl font-bold mb-2">Hello, {user.name}</h2>
            <p className="text-gray-500 mb-4">{user.email}</p>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-full"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">Login with Google</h2>
            <GoogleLogin onLogin={setUser} />
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;

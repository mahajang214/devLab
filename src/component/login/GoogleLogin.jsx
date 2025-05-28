import React, { useEffect } from "react";
import jwt_decode from "jwt-decode";

const GoogleLogin = ({ onLogin }) => {
  // useEffect(() => {
  //   /* global google */
  //   window.google.accounts.id.initialize({
  //     client_id: "YOUR_GOOGLE_CLIENT_ID",
  //     callback: handleGoogleResponse,
  //   });

  //   window.google.accounts.id.renderButton(
  //     document.getElementById("google-button"),
  //     { theme: "outline", size: "large" }
  //   );
  // }, []);

  // const handleGoogleResponse = async (response) => {
  //   try {
  //     const googleToken = response.credential;

  //     // Send the token to your backend
  //     const res = await fetch("http://localhost:5000/api/auth/google", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ token: googleToken }),
  //     });

  //     const data = await res.json();

  //     if (res.ok) {
  //       localStorage.setItem("token", data.jwt); // Store JWT
  //       const decoded = jwt_decode(data.jwt);
  //       onLogin(decoded); // Update parent state
  //     } else {
  //       console.error("Login failed", data.message);
  //     }
  //   } catch (err) {
  //     console.error("Google auth error:", err);
  //   }
  // };

  return <div id="google-button"></div>;
};

export default GoogleLogin;

// src/components/Login.js
import React, { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory();
  const host = "http://localhost:3001";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${host}/api/v1/auth/email/login`, {
        email,
        password,
      });
      const token = response.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("userID", response.data.user.id);
      localStorage.setItem("username", response.data.user.firstName);
      history.push("/rooms");
      // You can redirect the user to another page after successful login.
      // For example: history.push("/dashboard");
      console.log("Login Successful!");
    } catch (error) {
      console.error("Login failed. Please check your credentials.");
    }
  };

  return (
    <div>
      <h2>Login Page</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;

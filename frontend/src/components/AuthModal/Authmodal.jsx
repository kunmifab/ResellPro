import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Authmodal.css";
import GoogleIcon from "../../assets/google.png";
import FacebookIcon from "../../assets/facebook.png";
import { useAuth } from "../../App.jsx";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const apiURL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const AuthModal = ({ close }) => {
  const { setAuth } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [userType, setUserType] = useState("buyer");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    phone: "",
    description: "",
    role: "buyer",
  });

  const navigate = useNavigate();

  useEffect(() => {
    setFormData((prev) => ({ ...prev, role: userType }));
  }, [userType]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isSignUp ? "/api/auth/signup" : "/api/auth/login";
      const payload = isSignUp
        ? userType === "buyer"
          ? { name: formData.name, email: formData.email, password: formData.password, role: userType }
          : formData
        : { email: formData.email, password: formData.password, role: userType };

      const response = await axios.post(`${apiURL}${url}`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (isSignUp) {
        toast.success("Sign-up successful! Please log in.");
        setTimeout(() => setIsSignUp(false), 1000);
      } else {
        toast.success("User login successful!");
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("userType", userType); // Store user type in localStorage
        const storedToken = localStorage.getItem("token");
        const decodedToken = jwtDecode(storedToken);
        let isSeller = false;
        let isBuyer = false;
        let isAdmin = false;
        if (decodedToken.roles.includes("seller")) {
          isSeller = true;
        }
        if (decodedToken.roles.includes("buyer")) {
          isBuyer = true;
        }
        if (decodedToken.roles.includes("admin")) {
          isAdmin = true;
        }
        setAuth({ token: storedToken, isAuthenticated: true, isSeller, isBuyer, isAdmin });

        if (userType === "seller" || userType === "buyer") {
          setTimeout(() => (window.location.href = "/"), 2000);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      localStorage.removeItem("token");
      localStorage.removeItem("userType"); // Remove userType on error
      setAuth({ token: null, isAuthenticated: false, isSeller: false, isBuyer: false, isAdmin: false });
    }
  };

  const handleForgotPassword = () => {
    close(); 
    navigate("/forgot-password"); 
  };

  return (
    <div className="auth-modal">
      <ToastContainer />
      <div className="auth-container">
        <button className="close-btn" onClick={close}>×</button>

        <h2>{isSignUp ? "Create an Account" : "Log In"}</h2>
        <p>{isSignUp ? "Join us and start ordering" : "Welcome back! Log into your account"}</p>

        <div className="toggle-container">
          <button className={userType === "buyer" ? "active" : ""} onClick={() => setUserType("buyer")}>
            Buyer
          </button>
          <button className={userType === "seller" ? "active" : ""} onClick={() => setUserType("seller")}>
            Seller
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {isSignUp && userType === "buyer" && (
            <>
              <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
              <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
              <div className="password">
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                {!isSignUp && (
                  <p className="forgot-password" onClick={handleForgotPassword}>
                    Forgot Password?
                  </p>
                )}
              </div>
            </>
          )}
          {isSignUp && userType === "seller" && (
            <>
              <div className="flex-container">
                <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
                <input type="text" name="businessName" placeholder="Business Name" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
              </div>
              <div className="flex-container">
                <input type="tel" name="phone" placeholder="Phone Number" onChange={handleChange} required />
                <div className="password">
                  <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                  {!isSignUp && (
                    <p className="forgot-password" onClick={handleForgotPassword}>
                      Forgot Password?
                    </p>
                  )}
                </div>
              </div>
              <textarea name="description" id="description" placeholder="Description" onChange={handleChange} required></textarea>
            </>
          )}
          {!isSignUp && (
            <>
              <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
              <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
              {!isSignUp && (
                <p className="forgot-password" onClick={handleForgotPassword}>
                  Forgot Password?
                </p>
              )}
            </>
          )}

          <button className="auth-btn" type="submit">{isSignUp ? "Create Account" : "Login"}</button>

          <div className="or-divider">— Other sign-up options —</div>
          <div className="social-login">
            <a href={`${apiURL}/api/auth/google`}>
              <img className="google-icon" src={GoogleIcon} alt="Google" />
            </a>
            <a href={`${apiURL}/api/auth/facebook`}>
              <img className="facebook-icon" src={FacebookIcon} alt="Facebook" />
            </a>
          </div>
        </form>

        <p className="auth-footer">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <span onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? "Login here" : "Sign up"}</span>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
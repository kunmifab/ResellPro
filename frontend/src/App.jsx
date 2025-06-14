import React, { createContext, useState, useEffect, useContext } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import Navbar from "./components/Navbar/Navbar";
import HomePage from "./Pages/Home/Home";
import RecycledPage from "./Pages/Recycled/recycled";
import CategoriesPage from "./Pages/featuredCategories/Categories";
import ProductDetail from "./Pages/ProductDetail/ProductDetail";
import Cart from "./Pages/Cart/Cart";
import AboutUs from "./Pages/About/About";
import ProtectedRoute from "./components/RouteProtection/ProtectedRoute";
import Page403 from "./Pages/403/403";
import SellerProfile from "./Pages/SellerProfile/SellerProfile";
import ProtectedSellerRoute from "./components/RouteProtection/ProtectedSellerRoute";
import ProtectedBuyerRoute from "./components/RouteProtection/ProtectedBuyerRoute";
import { jwtDecode } from "jwt-decode";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword/ResetPassword";
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const App = () => {
  const [auth, setAuth] = useState({ token: "loading", isAuthenticated: false, isSeller: false, isBuyer: false });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        try {
          const decodedToken = jwtDecode(storedToken);
          const currentTime = Date.now() / 1000;
          if (decodedToken.exp < currentTime) {
            localStorage.removeItem("token");
            setAuth({ token: null, isAuthenticated: false, isSeller: false, isBuyer: false });
            window.location.reload();
          } else {
            let isSeller = false;
            let isBuyer = false;
            let isAdmin = false;
            if(decodedToken.roles.includes("seller")){
              isSeller = true;
            }
            if(decodedToken.roles.includes("buyer")){
              isBuyer = true;
            }
            if(decodedToken.roles.includes("admin")){
              isAdmin = true;
            }
            setAuth({ token: storedToken, isAuthenticated: true, isSeller, isBuyer, isAdmin });
          }
        } catch (error) {
          localStorage.removeItem("token");
          setAuth({ token: null, isAuthenticated: false, isSeller: false, isBuyer: false, isAdmin: false });
        }
      } else {
        setAuth({ token: null, isAuthenticated: false, isSeller: false, isBuyer: false, isAdmin: false });
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <ToastContainer /> 
      { location.pathname !== "/admin-dashboard" && <Navbar />}
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/recycled" element={<RecycledPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/product-detail" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/403" element={<Page403 />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        
        <Route element={<ProtectedRoute />}>

         
          <Route element={<ProtectedSellerRoute />}>
            <Route path="/seller-profile" element={<SellerProfile />} />
          </Route>

          
          <Route element={<ProtectedBuyerRoute />}>
          
          </Route>
        </Route>
      </Routes>
    </AuthContext.Provider>
  );
};

export default App;

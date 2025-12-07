import React, { useState, useEffect } from "react"; 
import API_BASE_URL from "./config.js"; 
import Navbar from "./Components/Essentaial/Navbar.jsx";
import Landing from "./Components/PreLogin/Landing.jsx";
import Footer from "./Components/Essentaial/Footer.jsx";
import Al_landing from "./Components/AfterLogIn/Al_landing.jsx";
import Profile from "./Components/AfterLogIn/Profile.jsx";
import Cart from "./Components/AfterLogIn/Cart.jsx";
import Chatbot from "./Components/AfterLogIn/Chatbot.jsx";
import OrderSummary from "./Components/AfterLogIn/OrderSummary.jsx";
import AdminDashboard from "./Components/Admin/AdminDashboard.jsx";

export default function App() {
  const [showProfile, setShowProfile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [buyNowProduct, setBuyNowProduct] = useState(null);

  // Check for token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setIsLoggedIn(true);
            setIsAdmin(userData.isAdmin || false);
          } else {
            // Token invalid
            localStorage.removeItem('token');
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem('token');
        }
      }
    };
    checkAuth();
  }, []);

  // Handlers
  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    if (userData && userData.isAdmin) {
      setIsAdmin(true);
    }
    console.log("User Logged In!", userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear token
    setIsLoggedIn(false);
    setIsAdmin(false);
    setShowProfile(false);
    console.log("User Logged Out!");
  };

  const handleProfileView = (show) => {
    setShowProfile(show);
  };
  //  This is the main checkout handler (App level)
  const handleCheckout = (product = null) => {
    setCartOpen(false);   // close cart drawer
    setBuyNowProduct(product); // Set specific product if Buy Now was clicked
    setCheckout(true);    // show payment component
  };
  // ✅ Handle cart open/close
  const handleCartClick = () => {
    setCartOpen(true);
  };
  const handleCartClose = () => {
    setCartOpen(false);
  };

  const renderLoggedInContent = () => {
    if (isAdmin) return <AdminDashboard handleLogout={handleLogout} />;
    if (checkout) return <OrderSummary onClose={() => setCheckout(false)} buyNowProduct={buyNowProduct} />;
    if (showProfile) {
      return <Profile onClose={() => setShowProfile(false)} handleCheckout={() => handleCheckout(null)} />;
    } else {
      return <Al_landing handleProfile={handleProfileView} handleCheckout={handleCheckout} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        isLoggedIn={isLoggedIn}
        handleProfile={handleProfileView}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        handleCartClick={handleCartClick} 
      />

      <main className="flex-grow">
        <div className="w-full mx-auto">
          {isLoggedIn ? renderLoggedInContent() : <Landing handleLogin={handleLogin} />}
        </div>
       
      </main>

      <Footer />

      
      {cartOpen && (
        <Cart
          open={cartOpen}
          onClose={handleCartClose}
          onCheckout={handleCheckout}   // 👈 Passed properly here
        />
      )}

    </div>
  );
}

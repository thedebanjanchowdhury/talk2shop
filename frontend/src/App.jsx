import React, { useState } from "react"; 
import Navbar from "./Components/Essentaial/Navbar.jsx";
import Landing from "./Components/PreLogin/Landing.jsx";
import Footer from "./Components/Essentaial/Footer.jsx";
import Al_landing from "./Components/AfterLogIn/Al_landing.jsx";
// NEW: Import the Profile component (assuming this is where the profile view is rendered)
import Profile from "./Components/AfterLogIn/Profile.jsx";

export default function App() {
    const [showProfile, setShowProfile] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false); 

    // Handlers for App.js
    const handleLogin = () => {
        setIsLoggedIn(true);
        console.log("User Logged In!");
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setShowProfile(false); // Hide profile view on logout
        console.log("User Logged Out!");
    };

    // Corrected function to control the Profile view based on a boolean
    const handleProfileView = (show) => {
        setShowProfile(show);
        // Note: The Navbar handleHomeClick will call handleProfileView(false)
    };

    // Conditional Content Render
    const renderLoggedInContent = () => {
        if (showProfile) {
            // RENDER PROFILE VIEW when user clicks 'Profile' in Navbar
            return <Profile />;
        } else {
            // RENDER MAIN LOGGED-IN LANDING/HOME VIEW when user clicks 'Home' or initially logs in
            return <Al_landing handleProfile={handleProfileView} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar
                isLoggedIn={isLoggedIn}
                handleProfile={handleProfileView} 
                handleLogin={handleLogin}
                handleLogout={handleLogout}
            />
            
            <main className="flex-grow">
                <div className="w-full mx-auto"> 
                    {/* Main Content Area */}
                    {isLoggedIn ? (
                        // FIX: Use the new function to conditionally render Profile or Al_landing
                        renderLoggedInContent()
                    ) : (
                        <Landing 
                            handleLogin={handleLogin}
                        />
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
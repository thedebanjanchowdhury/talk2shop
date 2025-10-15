import React, { useState } from 'react';
// Correct path assuming Landing.jsx and SignInDialog.jsx are siblings in 'src/Components'
import SignInDialog from '../Essentaial/SignInDialog ';
import CategorySlider from '../AfterLogIn/CategorySlider';

export default function Landing() {
    // State to control the visibility and initial tab of the Auth dialog
    const [showAuthDialog, setShowAuthDialog] = useState(null);
    
    // Handler for successful authentication (called by SignInDialog)
    const handleAuthSuccess = () => {
        setShowAuthDialog(null);
        console.log("Authentication successful! Landing page should now redirect/hide.");
    }
    
    // Opens the SignInDialog with the 'signin' tab active
    const handleOpenLogin = () => {
        setShowAuthDialog('signin');
    }

    // Handler for the Try Demo button
    const handleTryDemo = () => {
        console.log("Try Demo clicked!");
    }

    return (
        // Main container with light background, matching the image design
        <div className="bg-amber-50 text-stone-900 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-8 relative overflow-hidden">
            
            {/* Background Dots Pattern */}
            <div 
                className="absolute inset-0 opacity-10" 
                style={{
                    backgroundImage: `radial-gradient(#a1a1aa 1px, transparent 1px)`, // Subtle gray dots
                    backgroundSize: '20px 20px', // Spacing
                }}
            ></div>

            {/* HERO CONTENT SECTION */}
            {/* FIX 3: Removed invalid <li> tag. */}
            <div className="relative z-10 text-center max-w-4xl mx-auto">
                {/* Main Heading */}
                <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-stone-900">
                    Shop Smarter, Build Faster, Talk to Your Tech _
                </h1>

                {/* Sub-heading/Description */}
                <p className="text-lg md:text-xl text-stone-700 mb-10 leading-relaxed">
                    Get the right computer parts instantly with Talk2Shop — an AI-powered eCommerce app that helps you 
                    find, compare, and buy components through natural conversation.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                    {/* Get Started Button - Opens Sign In Dialog */}
                    <button className="flex items-center gap-2 px-8 py-3 rounded-full text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg hover:from-purple-700 hover:to-pink-600 transition duration-300"
                        onClick={handleOpenLogin}
                    >
                        <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                        Get Started
                    </button>

                    {/* Try Demo Button */}
                    <button 
                        className="flex items-center gap-2 px-8 py-3 rounded-full text-lg font-semibold border-2 border-stone-400 text-stone-800 hover:bg-stone-100 transition duration-300 relative overflow-hidden"
                        onClick={handleTryDemo}
                    >
                        Try Demo
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-pulse-light"></div>
                    </button>
                </div>
            </div>
            
            {/* CATEGORY SLIDER SECTION */}
            {/* FIX 3: Removed invalid <li> tag. */}
            {/* This div centers the CategorySlider horizontally. */}
            <div className='w-full bg-red-50 flex justify-center mt-10 p-4'>
                <CategorySlider />
            </div>

            {/* Conditional Rendering of the Sign In Dialog */}
            {showAuthDialog && (
                <SignInDialog
                    onClose={() => setShowAuthDialog(null)}
                    onSuccess={handleAuthSuccess}
                    initialTab={showAuthDialog}
                />
            )}
        </div>
    );
}
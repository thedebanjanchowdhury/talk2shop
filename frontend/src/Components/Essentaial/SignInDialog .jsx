import React, { useState } from "react";
import { FaGoogle, FaGithub } from 'react-icons/fa'; // Import social icons

export default function SignInDialog({ onClose, onSuccess, initialTab }) {
    // The design you provided primarily focuses on a Sign Up form.
    // I'll make 'signup' the default and allow switching to a simplified 'signin'
    // via a text link as shown in the prompt.
    const [activeTab, setActiveTab] = useState(initialTab || "signup"); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [message, setMessage] = useState({ text: "", type: "" });

    // Demo credentials for sign-in (if we decide to keep a separate sign-in form)
    const demoEmail = "user@example.com";
    const demoPassword = "password";

    const handleSignIn = (e) => {
        e.preventDefault();
        setMessage({ text: "", type: "" }); 
        // This simplified sign-in will only be accessible via the 'Sign In' link if activeTab is 'signin'
        if (email === demoEmail && password === demoPassword) {
            setMessage({ text: "Login Successful! Redirecting...", type: "success" });
            setTimeout(() => {
                onSuccess(); 
            }, 1000);
        } else {
            setMessage({ text: "Invalid credentials. Try: user@example.com / password", type: "error" });
        }
    };

    const handleSignUp = (e) => {
        e.preventDefault();
        setMessage({ text: "", type: "" }); 
        // Simplified sign-up simulation
        if (firstName && lastName && email && password) {
            setMessage({ text: "Signed up! Please proceed to sign in.", type: "success" });
            // Optionally switch to sign-in tab after successful signup
            setTimeout(() => {
                setActiveTab("signin");
                setMessage({ text: "", type: "" });
                // Clear form fields
                setFirstName('');
                setLastName('');
                setEmail('');
                setPassword('');
            }, 1500);
        } else {
            setMessage({ text: "Please fill in all fields.", type: "error" });
        }
    };

    const isSignInTab = activeTab === "signin";

    // Reusing the Navbar's dark background for the overlay, and a slightly lighter dark for the dialog.
    // Using deep purple and pink gradients as seen in the image.
    const dialogBgColor = "bg-stone-800"; // Slightly lighter than Navbar's bg-stone-900
    const inputStyle = "w-full p-3 rounded-lg bg-stone-700 border border-stone-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500";
    const gradientButton = "w-full py-3 rounded-lg font-semibold text-white transition duration-200 shadow-md";

    return (
          <div className="fixed inset-0 backdrop-filter backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl p-8 relative transform transition-all duration-300 scale-100 ${dialogBgColor}`}>
                {/* Close Button */}
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-400 text-2xl transition"
                    onClick={onClose}
                >
                    &times;
                </button>

                <h2 className="text-3xl font-bold mb-2 text-center text-white">
                    Login to Talk2Shop!
                </h2>
                <p className="text-gray-400 text-center mb-6">
                    {isSignInTab ? (
                        "Don't have an account? "
                    ) : (
                        "If you already have an account, "
                    )}
                    <button 
                        onClick={() => setActiveTab(isSignInTab ? "signup" : "signin")} 
                        className="text-yellow-200 hover:text-orange-400 underline font-semibold focus:outline-none"
                    >
                        {isSignInTab ? "Sign Up" : "Sign In"}
                    </button>
                    {isSignInTab ? "" : " here."}
                </p>

                {/* Message Box */}
                {message.text && (
                    <div className={`p-3 mb-4 rounded-lg text-sm font-medium ${
                        message.type === 'success' ? 'bg-green-700 text-white' : 
                                                    'bg-red-700 text-white'
                    } border border-opacity-30`}>
                        {message.text}
                    </div>
                )}

                {/* Forms */}
                {isSignInTab ? (
                    // Simplified Sign In form based on the prompt's implied design
                    <form className="space-y-4" onSubmit={handleSignIn}>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputStyle}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputStyle}
                            required
                        />
                        <button
                            type="submit"
                            className={`${gradientButton} bg-gradient-to-r from-amber-500 to-pink-500 hover:from-orange-500 hover:to-pink-600`}
                        >
                            Sign In →
                        </button>
                    </form>
                ) : (
                    // Sign Up form matching the image
                    <form className="space-y-4" onSubmit={handleSignUp}>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="First Name *"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className={inputStyle}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Last Name *"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className={inputStyle}
                                required
                            />
                        </div>
                        <input
                            type="email"
                            placeholder="Email Address *"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputStyle}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password *"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputStyle}
                            required
                        />
                        <button
                            type="submit"
                            className={`${gradientButton}  bg-gradient-to-r from-amber-500 to-pink-500 hover:from-orange-500 hover:to-pink-600`}
                        >
                            Sign Up →
                        </button>
                    </form>
                )}

                {/* Social Login Options 
                <div className="mt-8 space-y-3">
                    <button className={`${gradientButton} flex items-center justify-center gap-2 bg-stone-700 hover:bg-stone-600`}>
                        <FaGoogle className="w-5 h-5" />
                        Google
                    </button>
                    <button className={`${gradientButton} flex items-center justify-center gap-2 bg-stone-700 hover:bg-stone-600`}>
                        <FaGithub className="w-5 h-5" />
                        Github
                    </button>
                </div>*/}
            </div>
        </div>
    );
}
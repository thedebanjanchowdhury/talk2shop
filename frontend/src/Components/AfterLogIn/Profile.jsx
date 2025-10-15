import React, { useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import user from "../../Data/user_details.jsx";
import CategorySlider from "./CategorySlider.jsx";
import ProductView from "./productView.jsx";

export default function Profile({ onClose }) {
  const [activeSection, setActiveSection] = useState("placeholder");
  // "placeholder" | "profile" | "wishlist" | "orders"

  return (
    <>
      
      <div className="relative p-4 bg-gray-100 min-h-full">
        {/* Close button (Mobile only) */}
        <button
          className="absolute top-4 right-4 text-gray-600 text-3xl hover:text-red-500 md:hidden"
          onClick={onClose}
        >
          <IoClose />
        </button>

        <div className="w-full bg-white shadow-lg rounded-2xl p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <FaRegUserCircle className="text-blue-500 w-24 h-24 md:w-28 md:h-28 border-4 border-blue-400 rounded-full shadow-md" />

            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-500 text-sm md:text-base">{user.email}</p>
              <p className="text-gray-500 text-sm md:text-base">{user.mobile}</p>
            </div>
          </div>

          {/* Sections */}
          {activeSection === "placeholder" && (
            <div className="mt-6 space-y-4">
              {/* Profile Button */}
              <button
                className="w-full text-left bg-gray-50 p-5 rounded-xl shadow-sm hover:bg-gray-100 transition"
                onClick={() => setActiveSection("profile")}
              >
                <h3 className="text-lg font-semibold text-gray-700">Profile</h3>
                <p className="text-gray-600 mt-2 text-sm md:text-base">
                  Personal details of user
                </p>
              </button>

              {/* Wishlist Button */}
              <button
                className="w-full text-left bg-gray-50 p-5 rounded-xl shadow-sm hover:bg-gray-100 transition"
               
              >
                <h3 className="text-lg font-semibold text-gray-700">Wishlist</h3>
                <p className="text-gray-600 mt-2 text-sm md:text-base">Items you wish to purchase</p>
              </button>

              {/* Orders Button */}
              <button
                className="w-full text-left bg-gray-50 p-5 rounded-xl shadow-sm hover:bg-gray-100 transition"
                
              >
                <h3 className="text-lg font-semibold text-gray-700">My Orders</h3>
                <p className="text-gray-600 mt-2 text-sm md:text-base">Check your order history</p>
              </button>

              {/* Logout Button */}
              <button className="w-full text-left bg-gray-50 p-5 rounded-xl shadow-sm hover:bg-gray-100 transition">
                <h3 className="text-lg font-semibold text-gray-700">Logout</h3>
                <p className="text-gray-600 mt-2 text-sm md:text-base">
                  Sign out of your account
                </p>
              </button>
            </div>
          )}

          {/* Profile Details */}
          {activeSection === "profile" && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-700">Address</h3>
                  <p className="text-gray-600 mt-2 text-sm md:text-base">{user.address}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-700">Date of Birth</h3>
                  <p className="text-gray-600 mt-2 text-sm md:text-base">{user.dob}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-700">Gender</h3>
                  <p className="text-gray-600 mt-2 text-sm md:text-base">{user.gender}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-700">Joined</h3>
                  <p className="text-gray-600 mt-2 text-sm md:text-base">{user.joined}</p>
                </div>
              </div>

              {/* Profile Actions */}
              <div className="flex flex-col md:flex-row gap-3 mt-6">
                <button className="px-6 py-2 bg-blue-500 text-white font-medium rounded-xl shadow hover:bg-blue-600 transition">
                  Edit Profile
                </button>
                <button
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl transition"
                  onClick={() => setActiveSection("placeholder")}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          
        </div>
      </div>
     
  </>
  );
}

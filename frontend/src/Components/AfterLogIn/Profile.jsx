import React, { useState, useEffect } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import Cart from "../AfterLogIn/Cart.jsx";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react' // Reuse Headless UI
import { useNavigate } from 'react-router-dom';

export default function Profile({ onClose, handleCheckout }) {
  const [activeSection, setActiveSection] = useState("placeholder");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', mobile: '', address: '' });

  // Fetch User Data
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        setEditForm({
            name: data.name || '',
            mobile: data.mobile || '',
            address: data.address || ''
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Fetch Orders
  const fetchOrders = async () => {
    try {
        setLoadingOrders(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/orders/my-orders', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            setOrders(data);
        }
    } catch (error) {
        console.error("Error fetching orders:", error);
    } finally {
        setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeSection === "orders") {
        fetchOrders();
    }
  }, [activeSection]);

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users/me', {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(editForm)
        });

        if (response.ok) {
            const updatedUser = await response.json();
            setUserData(updatedUser);
            setIsEditOpen(false);
            alert("Profile updated successfully!");
        } else {
            alert("Failed to update profile.");
        }
    } catch (error) {
        console.error("Update error:", error);
        alert("Error updating profile.");
    }
  };

  const handleInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="p-10 text-center text-lg font-medium text-gray-500">Loading profile...</div>;

  return (
    <>
      <div className="relative p-4 md:p-6 bg-gray-50 min-h-full">
        {/* Close button (Mobile only) */}
        <button
          className="absolute top-4 right-4 text-gray-400 text-2xl hover:text-red-500 transition md:hidden"
          onClick={onClose}
        >
          <IoClose />
        </button>

        <div className="w-full bg-white shadow-xl rounded-2xl p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border-b pb-6 mb-6">
            <FaRegUserCircle className="text-blue-500 w-20 h-20 md:w-24 md:h-24 border-4 border-blue-100 rounded-full shadow-sm" />
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{userData?.name || "User"}</h2>
              <p className="text-gray-500 md:text-lg">{userData?.email}</p>
              <p className="text-gray-400 text-sm">{userData?.mobile || "No mobile number"}</p>
            </div>
            
            <div className="flex gap-2">
                {activeSection !== "placeholder" ? (
                     <button
                     className="hidden md:block px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                     onClick={() => setActiveSection("placeholder")}
                   >
                     Back to Menu
                   </button>
                ) : (
                    <button
                     className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-sm font-medium border border-indigo-100"
                     onClick={() => navigate('/')}
                   >
                     Back to Home
                   </button>
                )}
            </div>
          </div>

          {/* --- Placeholder Section --- */}
          {activeSection === "placeholder" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Profile Button */}
              <button
                className="group p-6 text-left bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300"
                onClick={() => setActiveSection("profile")}
              >
                <div className="mb-3 text-blue-500 bg-blue-50 w-12 h-12 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform">
                    <FaRegUserCircle size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Profile Details</h3>
                <p className="text-gray-500 mt-1 text-sm">
                  View and edit your personal information
                </p>
              </button>

              {/* Wishlist / Cart Button */}
              <button
                className="group p-6 text-left bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300"
                onClick={() => setActiveSection("wishlist")}
              >
                <div className="mb-3 text-indigo-500 bg-indigo-50 w-12 h-12 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">Cart</h3>
                <p className="text-gray-500 mt-1 text-sm">
                  View items in your shopping cart
                </p>
              </button>

              {/* Orders Button */}
              <button
                className="group p-6 text-left bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-300"
                onClick={() => setActiveSection("orders")}
              >
                <div className="mb-3 text-green-500 bg-green-50 w-12 h-12 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition-colors">My Orders</h3>
                <p className="text-gray-500 mt-1 text-sm">
                  Track and view your order history
                </p>
              </button>

              {/* Logout Button */}
              <button className="group p-6 text-left bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300">
                <div className="mb-3 text-red-500 bg-red-50 w-12 h-12 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-600 transition-colors">Logout</h3>
                <p className="text-gray-500 mt-1 text-sm">
                  Sign out of your account
                </p>
              </button>
            </div>
          )}

          {/* --- Profile Details Section --- */}
          {activeSection === "profile" && (
            <div className="animate-fade-in-up">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Profile Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">My Address</h4>
                  <p className="text-gray-800 font-medium">{userData?.address || "Not set"}</p>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Account Type</h4>
                  <p className="text-gray-800 font-medium badge inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {userData?.isAdmin ? "Admin" : "Customer"}
                  </p>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Joined On</h4>
                  <p className="text-gray-800 font-medium">{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "-"}</p>
                </div>
              </div>

              {/* Profile Actions */}
              <div className="flex gap-4 mt-8">
                <button 
                    onClick={() => setIsEditOpen(true)}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl transition-all"
                >
                  Edit Profile
                </button>
                <button
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition md:hidden"
                  onClick={() => setActiveSection("placeholder")}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* --- Wishlist / Cart Section --- */}
          {activeSection === "wishlist" && (
             <div className="animate-fade-in-up">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Shopping Cart</h3>
                     <button
                        className="md:hidden text-sm text-gray-500 underline"
                        onClick={() => setActiveSection("placeholder")}
                    >
                        Back
                    </button>
                 </div>
               <Cart 
                   open={true} 
                   onClose={() => setActiveSection("placeholder")} 
                   onCheckout={handleCheckout} 
                   isEmbedded={true} 
               />
             </div>
          )}

          {/* --- Orders Section --- */}
          {activeSection === "orders" && (
            <div className="animate-fade-in-up">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Order History</h3>
                     <button
                        className="md:hidden text-sm text-gray-500 underline"
                        onClick={() => setActiveSection("placeholder")}
                    >
                        Back
                    </button>
                 </div>
              
              {loadingOrders ? (
                  <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                    </div>
                  <p className="text-gray-500 font-medium">No orders found.</p>
                  <p className="text-gray-400 text-sm mt-1">Start shopping to see your orders here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition duration-200">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-gray-50 mb-4 gap-2">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Order ID: <span className="text-gray-600 font-mono text-sm">#{order._id.slice(-6).toUpperCase()}</span></p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                     <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wide ${
                                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                     }`}>
                                        {order.status}
                                     </span>
                                     <span className="font-bold text-gray-800 text-lg">₹{order.totalAmount}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.product?.imageUrl ? (
                                                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{item.product?.name || "Unknown Product"}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Shipping Details */}
                            <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <p className="font-semibold text-gray-700">Shipping To:</p>
                                    <p>{order.shippingDetails?.fullName}</p>
                                    <p>{order.shippingDetails?.address}, {order.shippingDetails?.city}</p>
                                    <p>{order.shippingDetails?.zip}, {order.shippingDetails?.country}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-700">Contact:</p>
                                    <p>{order.shippingDetails?.email}</p>
                                    <p>{order.shippingDetails?.phone}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- Edit Profile Modal --- */}
      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <DialogPanel className="max-w-lg space-y-4 border bg-white p-6 rounded-xl shadow-2xl w-full">
                <DialogTitle className="font-bold text-xl">Edit Profile</DialogTitle>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={editForm.name} 
                            onChange={handleInputChange} 
                            className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mobile</label>
                        <input 
                            type="text" 
                            name="mobile" 
                            value={editForm.mobile} 
                            onChange={handleInputChange} 
                            className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea 
                            name="address" 
                            value={editForm.address} 
                            onChange={handleInputChange} 
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Changes</button>
                    </div>
                </form>
            </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}

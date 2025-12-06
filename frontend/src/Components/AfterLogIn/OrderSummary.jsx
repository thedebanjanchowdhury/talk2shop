import React, { useState, useEffect, useMemo } from 'react';
import { Truck, DollarSign, Package as PackageIcon, X } from 'lucide-react';

// Reusable input component
const InputField = ({ label, id, type = 'text', value, onChange, placeholder, required = false, disabled = false }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
        />
    </div>
);

// PaymentOption component
const PaymentOption = ({ icon: Icon, title, description, isSelected, onClick }) => (
    <div
        className={`p-4 mb-3 border-2 rounded-xl cursor-pointer transition ${
            isSelected ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300'
        }`}
        onClick={onClick}
    >
        <div className="flex items-center">
            <Icon className={`w-6 h-6 mr-3 ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`} />
            <div className="flex-grow">
                <h3 className="font-semibold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            <input type="radio" checked={isSelected} readOnly className="h-4 w-4 text-indigo-600" />
        </div>
    </div>
);

const ShippingDetailsForm = ({ shippingDetails, onChange }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-indigo-100">
        <h2 className="text-2xl font-bold flex items-center mb-6 text-gray-900">
            <Truck className="w-6 h-6 mr-3 text-indigo-500" /> 1. Shipping Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField 
                label="Full Name" 
                id="fullName" 
                required 
                value={shippingDetails.fullName} 
                onChange={onChange} 
                placeholder="John Doe" 
                disabled={true} 
            />
            <InputField 
                label="Email Address" 
                id="email" 
                type="email" 
                required 
                value={shippingDetails.email} 
                onChange={onChange} 
                placeholder="john@example.com" 
                disabled={true} 
            />
        </div>
        <InputField label="Phone" id="phone" value={shippingDetails.phone} onChange={onChange} />
        <InputField label="Address" id="address" required value={shippingDetails.address} onChange={onChange} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField label="City" id="city" required value={shippingDetails.city} onChange={onChange} />
            <InputField label="ZIP Code" id="zip" required value={shippingDetails.zip} onChange={onChange} />
            <InputField label="Country" id="country" required value={shippingDetails.country} onChange={onChange} />
        </div>
    </div>
);

const PaymentDetailsForm = ({ paymentMethod, setPaymentMethod }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold flex items-center mb-6 text-gray-900">
            <DollarSign className="w-6 h-6 mr-3 text-indigo-500" /> 2. Payment Method
        </h2>

        <PaymentOption
            icon={PackageIcon}
            title="Cash on Delivery (COD)"
            description="Pay when the order arrives."
            isSelected={paymentMethod === "cod"}
            onClick={() => setPaymentMethod("cod")}
        />
    </div>
);

export default function OrderSummary({ onClose, buyNowProduct }) {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form and Payment State
    const [shippingDetails, setShippingDetails] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zip: '',
        country: 'India',
    });
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch User Profile (in parallel with cart if needed, but sequential here for simplicity)
                const userRes = await fetch('/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setShippingDetails(prev => ({
                        ...prev,
                        fullName: userData.name || '',
                        email: userData.email || '',
                        address: userData.address || '',
                        // If backend provides other fields like phone/city/zip/country, map them here
                    }));
                }

                // 2. Fetch Cart or Set BuyNow Product
                if (buyNowProduct) {
                    setCartItems([{
                        ...buyNowProduct,
                        quantity: 1,
                        id: buyNowProduct._id
                    }]);
                } else {
                    const cartRes = await fetch('/api/cart', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const cartData = await cartRes.json();
                    if (cartData && cartData.length > 0) {
                        const items = cartData[0].items.map(item => ({
                            ...item.product,
                            quantity: item.quantity,
                            id: item.product._id
                        }));
                        setCartItems(items);
                    } else {
                        setCartItems([]);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [buyNowProduct]);

    // Helper to calculate totals
    const totals = useMemo(() => {
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 2000 ? 0 : 150.00; // Updated to match Payment logic (free > 2000)
        const taxRate = 0.08;
        const tax = subtotal * taxRate;
        const total = subtotal + shipping + tax;
        return { subtotal, shipping, tax, total };
    }, [cartItems]);

    const handleShippingChange = (e) => {
        setShippingDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage("Please login to place an order.");
                setIsProcessing(false);
                return;
            }

            const orderPayload = {
                items: cartItems.map(item => ({
                    id: item.id || item._id,
                    quantity: item.quantity,
                    price: item.price
                })),
                shippingDetails,
                paymentMethod,
                totalAmount: totals.total
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(orderPayload)
            });

            if (response.ok) {
                setMessage("Order placed successfully! 🎉 Redirecting...");
                
                // Wait for 2 seconds before closing
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Refresh specific parts or redirect
                if (onClose) onClose();
            } else {
                const errorData = await response.json();
                setMessage(`Order failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Order submission error:", error);
            setMessage("An error occurred while placing the order.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading summary...</div>;

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 font-sans relative">
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-500"
            >
                <X className="w-6 h-6" />
            </button>

            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-3">
                Checkout & Order Summary
            </h1>
            
            {message && (
                <div className="p-4 mb-6 bg-green-100 text-green-700 rounded shadow-sm">
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-3 lg:gap-x-12 xl:gap-x-16">
                
                {/* --- SHIPPING & PAYMENT DETAILS (Left 2/3rds) --- */}
                <div className="lg:col-span-2 space-y-10">
                    <ShippingDetailsForm shippingDetails={shippingDetails} onChange={handleShippingChange} />
                    <PaymentDetailsForm paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
                </div>

                {/* --- ORDER SUMMARY (Right 1/3rd) --- */}
                <div className="mt-10 lg:mt-0 lg:col-span-1">
                    <div className="sticky top-4 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-6 sm:p-6 lg:p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                        {/* Item List */}
                        <ul role="list" className="divide-y divide-gray-200 text-sm max-h-60 overflow-y-auto">
                            {cartItems.map((product) => (
                                <li key={product.id || product._id} className="flex py-4 justify-between">
                                    <div className="flex items-center">
                                       <img 
                                            src={product.images && product.images.length > 0 ? product.images[0] : "https://placehold.co/60x60?text=No+Image"} 
                                            className="w-10 h-10 rounded mr-3 object-cover" 
                                            alt={product.title} 
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-gray-700 font-medium truncate max-w-[120px]">
                                                {product.title || product.name}
                                            </span>
                                            <span className="text-xs text-gray-500">Qty: {product.quantity}</span>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-gray-900">₹{(product.price * product.quantity).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Subtotals */}
                        <div className="mt-6 space-y-2 border-t border-gray-200 pt-4">
                            <div className="flex justify-between text-base text-gray-900">
                                <p>Subtotal</p>
                                <p>₹{totals.subtotal.toFixed(2)}</p>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <p>Shipping Estimate</p>
                                <p>₹{totals.shipping.toFixed(2)}</p>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <p>Tax Estimate (8%)</p>
                                <p>₹{totals.tax.toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Final Total */}
                        <div className="mt-6 flex justify-between items-center border-t border-gray-200 pt-6">
                            <h3 className="text-xl font-extrabold text-gray-900">Order Total</h3>
                            <p className="text-2xl font-extrabold text-indigo-600">₹{totals.total.toFixed(2)}</p>
                        </div>
                        
                        {/* Final Action Button */}
                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={isProcessing || cartItems.length === 0}
                                className={`w-full flex items-center justify-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white shadow-md transition ${
                                    isProcessing || cartItems.length === 0 ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                            >
                                {isProcessing ? "Processing..." : `Place Order & Pay ₹${totals.total.toFixed(2)}`}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

import React, { useState, useMemo, useEffect } from 'react';
import API_BASE_URL from "../../config.js";
import {
    Truck,
    DollarSign,
    Package as PackageIcon,
    X
} from 'lucide-react';

// Mock data inferred from cart
const initialCartItems = [
    { id: 1, name: 'Throwback Hip Bag', color: 'Salmon', price: 90.00, qty: 1, image: 'https://placehold.co/60x60/f87171/ffffff?text=Bag' },
    { id: 2, name: 'Medium Stuff Satchel', color: 'Blue', price: 32.00, qty: 1, image: 'https://placehold.co/60x60/3b82f6/ffffff?text=Satchel' },
    { id: 3, name: 'Zip Tote Basket', color: 'White and black', price: 140.00, qty: 1, image: 'https://placehold.co/60x60/a1a1aa/ffffff?text=Tote' },
];

// Reusable input component
const InputField = ({ label, id, type = 'text', value, onChange, placeholder, required = false }) => (
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
        />
    </div>
);

// FIXED PaymentOption component
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
    <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border">
        <h2 className="text-2xl font-bold flex items-center mb-6">
            <Truck className="w-6 h-6 mr-3 text-indigo-500" /> Shipping Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Full Name" id="fullName" required value={shippingDetails.fullName} onChange={onChange} placeholder="John Doe" />
            <InputField label="Email Address" id="email" type="email" required value={shippingDetails.email} onChange={onChange} placeholder="john@example.com" />
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
    <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h2 className="text-2xl font-bold flex items-center mb-6">
            <DollarSign className="w-6 h-6 mr-3 text-indigo-500" /> Payment Method
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

const OrderSummary = ({ cartItems, totals }) => (
    <div className="bg-white p-6 rounded-xl shadow-xl border sticky top-4">
        <h2 className="text-xl font-bold border-b pb-4 mb-4">Order Summary</h2>

        <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
            {cartItems.map(item => (
                <div key={item._id || item.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                        <img 
                            src={item.images && item.images.length > 0 ? item.images[0] : "https://placehold.co/60x60?text=No+Image"} 
                            className="w-10 h-10 rounded mr-3 object-cover" 
                            alt={item.title} 
                        />
                        <div>
                            <p className="font-semibold text-sm line-clamp-1">{item.title}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                    </div>
                    <p className="font-semibold text-sm">₹{item.price.toFixed(2)}</p>
                </div>
            ))}
        </div>

        <div className="border-t pt-4 space-y-2 text-sm text-gray-700">
            <div className="flex justify-between"><span>Subtotal</span>₹{totals.subtotal.toFixed(2)}</div>
            <div className="flex justify-between"><span>Shipping</span>{totals.shippingFee === 0 ? "FREE" : `₹${totals.shippingFee}`}</div>
            <div className="flex justify-between"><span>Tax (8%)</span>₹{totals.taxes.toFixed(2)}</div>
        </div>

        <div className="flex justify-between items-center border-t mt-4 pt-4 font-bold text-lg">
            <span>Total</span>
            <span className="text-indigo-600">₹{totals.total.toFixed(2)}</span>
        </div>
    </div>
);

const Payment = ({ onClose }) => {
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
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch cart items
    useEffect(() => {
        const fetchCart = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch(`${API_BASE_URL}/api/cart`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();

                if (data && data.length > 0) {
                    const items = data[0].items.map(item => ({
                        ...item.product,
                        quantity: item.quantity,
                        cartItemId: item._id
                    }));
                    setCartItems(items);
                } else {
                    setCartItems([]);
                }
            } catch (error) {
                console.error("Error fetching cart:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, []);

    // Totals calculator
    const orderTotals = useMemo(() => {
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
        const shippingFee = subtotal >= 2000 ? 0 : 150; // Adjusted threshold for INR
        const taxes = parseFloat((subtotal * 0.08).toFixed(2));
        return { subtotal, shippingFee, taxes, total: subtotal + shippingFee + taxes };
    }, [cartItems]);

    // Submit payment
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Here you would typically send the order to the backend
        
        setIsProcessing(false);
        setMessage("Order placed successfully! 🎉");
        
        // Wait for 3 seconds before redirecting
        await new Promise(resolve => setTimeout(resolve, 3000));
        onClose();
    };

    const handleShippingChange = (e) => {
        setShippingDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading payment details...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-extrabold">
                        Checkout <span className="text-indigo-600">Securely</span>
                    </h1>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
                        aria-label="Close checkout"
                    >
                        <X className="w-8 h-8 text-gray-500 hover:text-gray-700" />
                    </button>
                </div>

                {message && (
                    <div className="p-4 mb-6 bg-green-100 text-green-700 rounded">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-3 lg:gap-8">
                    <div className="lg:col-span-2">
                        <ShippingDetailsForm shippingDetails={shippingDetails} onChange={handleShippingChange} />
                        <PaymentDetailsForm paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
                    </div>

                    <div>
                        <OrderSummary cartItems={cartItems} totals={orderTotals} />

                        <button
                            type="submit"
                            disabled={isProcessing || cartItems.length === 0}
                            className={`w-full mt-6 py-3 rounded-xl text-white font-semibold transition ${
                                isProcessing || cartItems.length === 0 ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                            {isProcessing ? "Processing..." : `Pay ₹${orderTotals.total.toFixed(2)} & Place Order`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Payment;

import React, { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function Cart({ open, onClose, onCheckout }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subtotal, setSubtotal] = useState(0);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      // Assuming we use the first cart or a default one
      if (data && data.length > 0) {
        const items = data[0].items.map(item => ({
          ...item.product,
          quantity: item.quantity,
          cartItemId: item._id // if needed
        }));
        setCartItems(items);
        calculateSubtotal(items);
      } else {
        setCartItems([]);
        setSubtotal(0);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = (items) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setSubtotal(total);
  };

  useEffect(() => {
    if (open) {
      fetchCart();
    }
  }, [open]);

  const handleRemove = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product: productId }),
      });
      if (response.ok) {
        fetchCart(); // Refresh cart
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">

      <DialogBackdrop className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out" />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            
            <DialogPanel className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out sm:duration-700 data-[closed]:translate-x-full">
              <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">

                {/* Header */}
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between">
                    <DialogTitle className="text-lg font-medium text-gray-900">Shopping cart</DialogTitle>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={onClose}
                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon aria-hidden="true" className="size-6" />
                      </button>
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="mt-8">
                    <div className="flow-root">
                      {loading ? (
                        <p className="text-center text-gray-500">Loading cart...</p>
                      ) : cartItems.length === 0 ? (
                        <p className="text-center text-gray-500">Your cart is empty.</p>
                      ) : (
                        <ul role="list" className="-my-6 divide-y divide-gray-200">
                          {cartItems.map((product) => (
                            <li key={product._id} className="flex py-6">
                              <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200">
                                <img
                                  alt={product.title}
                                  src={product.images && product.images.length > 0 ? product.images[0] : "https://placehold.co/150"}
                                  className="size-full object-cover"
                                />
                              </div>

                              <div className="ml-4 flex flex-1 flex-col">
                                <div>
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3>
                                      <a href="#">{product.title}</a>
                                    </h3>
                                    <p className="ml-4">₹{product.price}</p>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                                </div>
                                <div className="flex flex-1 items-end justify-between text-sm">
                                  <p className="text-gray-500">Qty {product.quantity}</p>
                                  <button 
                                    type="button" 
                                    onClick={() => handleRemove(product._id)}
                                    className="font-medium text-indigo-600 hover:text-indigo-500"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>₹{subtotal}</p>
                  </div>

                  <p className="mt-0.5 text-sm text-gray-500">
                    Shipping and taxes calculated at checkout.
                  </p>

                  <div className="mt-6">
                    <button
                      onClick={onCheckout}  // <-- Works perfectly
                      className="flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 w-full"
                    >
                      Checkout
                    </button>
                  </div>

                  <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                    <p>
                      or{" "}
                      <button
                        type="button"
                        onClick={onClose}
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Continue Shopping →
                      </button>
                    </p>
                  </div>

                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
      
    </Dialog>
  );
}

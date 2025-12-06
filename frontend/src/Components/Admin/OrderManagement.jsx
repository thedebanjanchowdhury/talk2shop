import React, { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/admin/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        alert("Order status updated!");
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status.");
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/admin/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setOrders(orders.filter(o => o._id !== orderId));
        alert("Order deleted.");
      } else {
        alert("Failed to delete order.");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Filter orders for last 2 months
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    return orderDate >= twoMonthsAgo;
  });

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-stone-800">Manage Orders (Last 2 Months)</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-stone-800 border-collapse">
          <thead>
            <tr className="bg-gray-100 text-sm font-semibold text-gray-600">
              <th className="p-4 border-b">Order ID</th>
              <th className="p-4 border-b">Customer</th>
              <th className="p-4 border-b">Date</th>
              <th className="p-4 border-b">Total</th>
              <th className="p-4 border-b">Status</th>
              <th className="p-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
                 <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">No recent orders found.</td>
                </tr>
            ) : (
                filteredOrders.map(order => (
                <tr key={order._id} className="border-b border-gray-200 hover:bg-amber-50">
                    <td className="p-4 font-mono text-xs text-gray-500">{order._id.slice(-6).toUpperCase()}</td>
                    <td className="p-4 font-medium">{order.user?.name || "Unknown"}</td>
                    <td className="p-4 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 font-bold">₹{order.totalAmount}</td>
                    <td className="p-4">
                        <select 
                            value={order.status} 
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-sm font-medium border-none focus:ring-2 focus:ring-blue-300 cursor-pointer ${
                                order.status === 'dispatched' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'pending' ? 'bg-gray-100 text-gray-800' : 
                                'bg-gray-50 text-gray-600'
                            }`}
                        >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="dispatched">Dispatched</option>
                            {/* Retain other options if they exist in DB but user only asked for 3 in dropdown. 
                                I will add them hidden or just let them fallback to visible if value matches 
                                but standard select doesn't work that way. 
                                User asked for "Add a dropdown with three enum values". 
                                I will stick to these 3. If value is 'delivered', it might show first option or empty. 
                                Let's add 'delivered', 'cancelled' just in case to show current status correctly, 
                                but user might only want valid *next* steps? 
                                "Add a dropdown with three enum values [pending, processing, dispatched]" - sounds strict.
                                I'll stick to the 3 requested.
                            */}
                        </select>
                    </td>
                    <td className="p-4">
                    <button 
                        onClick={() => handleDelete(order._id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                        title="Delete Order"
                    >
                        <FaTrash />
                    </button>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

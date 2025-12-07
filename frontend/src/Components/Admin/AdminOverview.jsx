import React, { useState, useEffect } from 'react';
import API_BASE_URL from "../../config.js";
import { FaUsers, FaBoxOpen, FaShoppingCart, FaDollarSign, FaSync } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 transition hover:shadow-md">
    <div className={`p-4 rounded-xl ${color} text-white text-2xl shadow-sm`}>{icon}</div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
    const colors = {
        pending: 'bg-orange-100 text-orange-700',
        processing: 'bg-blue-100 text-blue-700',
        dispatched: 'bg-indigo-100 text-indigo-700',
        shipped: 'bg-purple-100 text-purple-700',
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
};

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    users: 0,
    products: 0,
    orders: 0,
    pendingOrdersCount: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [orderStatusDistrib, setOrderStatusDistrib] = useState({});

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, productsRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/users`, { headers }),
        fetch(`${API_BASE_URL}/api/products`),
        fetch(`${API_BASE_URL}/api/orders/admin/all`, { headers })
      ]);

      const users = await usersRes.json();
      const products = await productsRes.json();
      const orders = await ordersRes.json();

      // Calculations
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      
      const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      setStats({
        revenue: totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
        users: Array.isArray(users) ? users.filter(u => !u.isAdmin).length : 0,
        products: Array.isArray(products) ? products.length : 0,
        orders: Array.isArray(orders) ? orders.length : 0,
        pendingOrdersCount: pendingOrders
      });

      setRecentOrders(Array.isArray(orders) ? orders.slice(0, 5) : []); // Already sorted by backend
      setOrderStatusDistrib(statusCounts);

    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Optional: Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
            <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <button 
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 shadow-sm transition"
        >
            <FaSync className={loading ? "animate-spin" : ""} /> Refresh Data
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={stats.revenue} icon={<FaDollarSign />} color="bg-green-500" />
        <StatCard title="Total Orders" value={stats.orders} icon={<FaShoppingCart />} color="bg-blue-500" />
        <StatCard title="Active Customers" value={stats.users} icon={<FaUsers />} color="bg-purple-500" />
        <StatCard title="Total Products" value={stats.products} icon={<FaBoxOpen />} color="bg-orange-500" />
      </div>

      <div className="mt-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md cursor-pointer hover:bg-blue-100">View All</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                            <th className="pb-3 font-medium">Order ID</th>
                            <th className="pb-3 font-medium">Customer</th>
                            <th className="pb-3 font-medium">Total</th>
                            <th className="pb-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {recentOrders.map(order => (
                            <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50 transition last:border-0">
                                <td className="py-4 font-mono text-gray-500 text-xs">#{order._id.slice(-6).toUpperCase()}</td>
                                <td className="py-4 font-medium text-gray-800">{order.user?.name || "Unknown"}</td>
                                <td className="py-4 text-gray-600">₹{order.totalAmount}</td>
                                <td className="py-4"><StatusBadge status={order.status} /></td>
                            </tr>
                        ))}
                        {recentOrders.length === 0 && (
                            <tr><td colSpan="4" className="py-4 text-center text-gray-400">No recent orders.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}

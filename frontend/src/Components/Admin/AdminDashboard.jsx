import React, { useState } from 'react';
import { FaTachometerAlt, FaBoxOpen, FaShoppingCart, FaUsers, FaHome, FaSignOutAlt } from 'react-icons/fa';
import AdminOverview from './AdminOverview';
import ProductManagement from './ProductManagement';
import UserManagement from './UserManagement';
import OrderManagement from './OrderManagement';

export default function AdminDashboard({ handleLogout }) {
  const [activeView, setActiveView] = useState('overview');

  const renderActiveView = () => {
    switch (activeView) {
      case 'products': return <ProductManagement />;
      case 'orders': return <OrderManagement />;
      case 'users': return <UserManagement />;
      case 'overview': default: return <AdminOverview />;
    }
  };

  return (
    // Main background changed to light amber
    <div className="flex min-h-screen bg-amber-50 text-stone-800">
      {/* Sidebar changed to white with a shadow */}
      <aside className="w-64 bg-white p-6 flex flex-col shadow-lg">
        <div className="flex items-center justify-center mb-10">
          <h1 className="text-2xl font-bold text-stone-900">Talk2Shop</h1>
        </div>
        <nav className="flex flex-col gap-2">
          <NavItem icon={<FaTachometerAlt />} label="Overview" name="overview" activeView={activeView} setActiveView={setActiveView} />
          <NavItem icon={<FaBoxOpen />} label="Products" name="products" activeView={activeView} setActiveView={setActiveView} />
          <NavItem icon={<FaShoppingCart />} label="Orders" name="orders" activeView={activeView} setActiveView={setActiveView} />
          <NavItem icon={<FaUsers />} label="Users" name="users" activeView={activeView} setActiveView={setActiveView} />
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Welcome Admin!</h2>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setActiveView('overview')}
                    className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
                >
                    <FaHome />
                    <span>Home</span>
                </button>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                    <FaSignOutAlt />
                    <span>Logout</span>
                </button>
            </div>
        </header>
        {renderActiveView()}
      </main>
    </div>
  );
}

const NavItem = ({ icon, label, name, activeView, setActiveView }) => (
  <button
    onClick={() => setActiveView(name)}
    // Nav item styles updated for light theme
    className={`flex items-center gap-4 p-3 rounded-lg text-left transition-colors ${
      activeView === name 
        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md' 
        : 'text-gray-600 hover:bg-amber-100 hover:text-stone-800'
    }`}
  >
    <div className="text-xl">{icon}</div>
    <span className="font-semibold">{label}</span>
  </button>
);

import React, { useEffect, useState } from 'react';
import BACKEND_URL from "../../config.js";
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', mobile: '', address: '' });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Filter out admins as per requirement
        const customers = data.filter(u => !u.isAdmin);
        setUsers(customers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setUsers(users.filter(user => user._id !== id));
        alert("User deleted successfully");
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      mobile: user.mobile || '',
      address: user.address || ''
    });
    setIsEditOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => (u._id === updatedUser._id ? updatedUser : u)));
        setIsEditOpen(false);
        setEditingUser(null);
        alert("User updated successfully");
      } else {
        alert("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-stone-800">Manage Users (Customers)</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-stone-800 border-collapse">
          <thead>
            <tr className="bg-gray-100 text-sm font-semibold text-gray-600">
              <th className="p-4 border-b">User ID</th>
              <th className="p-4 border-b">Name</th>
              <th className="p-4 border-b">Email</th>
              <th className="p-4 border-b">Mobile</th>
              <th className="p-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
                <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500">No customers found.</td>
                </tr>
            ) : (
                users.map(user => (
                <tr key={user._id} className="border-b border-gray-200 hover:bg-amber-50">
                    <td className="p-4 font-mono text-xs text-gray-500">{user._id}</td>
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.mobile || '-'}</td>
                    <td className="p-4 flex gap-4">
                    <button 
                        onClick={() => handleEditClick(user)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition"
                        title="Edit User"
                    >
                        <FaEdit />
                    </button>
                    <button 
                        onClick={() => handleDelete(user._id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition"
                        title="Delete User"
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

      {/* Edit User Modal */}
      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/30 transition-opacity" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <DialogPanel className="max-w-md space-y-4 border bg-white p-6 rounded-xl shadow-2xl w-full">
                <DialogTitle className="font-bold text-xl">Edit User Details</DialogTitle>
                <form onSubmit={handleUpdateSubmit} className="space-y-4">
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
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update User</button>
                    </div>
                </form>
            </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}

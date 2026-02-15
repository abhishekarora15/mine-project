import React, { useState, useEffect } from 'react';
import api from '../api/api';
import {
    Plus,
    Edit2,
    Trash2,
    Image as ImageIcon,
    Save,
    X,
    Search,
    Check
} from 'lucide-react';

const MenuItemForm = ({ item, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(item || {
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        isVeg: true,
        isAvailable: true
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-surface w-full max-w-lg border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold">{item ? 'Edit Menu Item' : 'Add New Item'}</h3>
                    <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 text-start">Dish Name</label>
                            <input
                                type="text"
                                className="w-full bg-gray-800 border-gray-700 border text-white p-3 rounded-lg focus:outline-none focus:border-primary text-start"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 text-start">Price (₹)</label>
                            <input
                                type="number"
                                className="w-full bg-gray-800 border-gray-700 border text-white p-3 rounded-lg focus:outline-none focus:border-primary text-start"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 text-start">Category</label>
                            <input
                                type="text"
                                placeholder="Main, Starter etc"
                                className="w-full bg-gray-800 border-gray-700 border text-white p-3 rounded-lg focus:outline-none focus:border-primary text-start"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 text-start">Description</label>
                        <textarea
                            className="w-full bg-gray-800 border-gray-700 border text-white p-3 rounded-lg focus:outline-none focus:border-primary h-24 text-start"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 text-start">Image URL</label>
                        <input
                            type="text"
                            className="w-full bg-gray-800 border-gray-700 border text-white p-3 rounded-lg focus:outline-none focus:border-primary text-start"
                            value={formData.image}
                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-6 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isVeg}
                                onChange={e => setFormData({ ...formData, isVeg: e.target.checked })}
                                className="w-4 h-4 accent-primary"
                            />
                            <span className="text-sm">Vegetarian</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isAvailable}
                                onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })}
                                className="w-4 h-4 accent-primary"
                            />
                            <span className="text-sm">Available</span>
                        </label>
                    </div>

                    <div className="pt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-primary text-black rounded-xl font-bold hover:bg-primary-dark"
                        >
                            {item ? 'Update Item' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Menu = () => {
    const [items, setItems] = useState([]);
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const resData = await api.get('/restaurants/my');
            setRestaurant(resData.data.data.restaurant);

            const menuData = await api.get(`/admin/menu/restaurant/${resData.data.data.restaurant._id}`);
            setItems(menuData.data.data.items);
        } catch (err) {
            console.error('Failed to fetch menu', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEdit = async (formData) => {
        try {
            if (editingItem) {
                await api.patch(`/admin/menu/${editingItem._id}`, formData);
            } else {
                await api.post('/admin/menu', { ...formData, restaurantId: restaurant._id });
            }
            fetchData();
            setShowForm(false);
            setEditingItem(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this dish?')) return;
        try {
            await api.delete(`/admin/menu/${id}`);
            fetchData();
        } catch (err) {
            alert('Failed to delete item');
        }
    };

    const toggleAvailability = async (item) => {
        try {
            await api.patch(`/admin/menu/${item._id}`, { isAvailable: !item.isAvailable });
            fetchData();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const filteredItems = items.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="space-y-4">
        <div className="h-12 w-full bg-surface animate-pulse rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-40 bg-surface rounded-2xl border border-gray-800 animate-pulse"></div>)}
        </div>
    </div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Menu Management</h1>
                    <p className="text-gray-400 mt-1">Add, edit, or remove items from your menu</p>
                </div>
                <button
                    onClick={() => { setEditingItem(null); setShowForm(true); }}
                    className="bg-primary hover:bg-primary-dark text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                    <Plus size={20} />
                    <span>Add Dish</span>
                </button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-3.5 text-gray-500" size={18} />
                <input
                    type="text"
                    placeholder="Search your menu..."
                    className="w-full bg-surface border border-gray-800 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                    <div key={item._id} className={`bg-surface border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all ${!item.isAvailable && 'opacity-60 grayscale'}`}>
                        <div className="flex h-full">
                            <div className="w-1/3 h-full overflow-hidden">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                        <Utensils size={32} className="text-gray-700" />
                                    </div>
                                )}
                            </div>
                            <div className="w-2/3 p-4 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg truncate pr-2">{item.name}</h3>
                                        <div className={`w-3 h-3 rounded-sm border ${item.isVeg ? 'border-green-500' : 'border-red-500'} flex items-center justify-center p-0.5`}>
                                            <div className={`w-full h-full rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-tighter">{item.category}</p>
                                    <p className="text-primary font-bold mt-2">₹{item.price}</p>
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-800 pt-4 mt-2">
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => { setEditingItem(item); setShowForm(true); }}
                                            className="p-2 bg-gray-800 text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="p-2 bg-gray-800 text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => toggleAvailability(item)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${item.isAvailable ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
                                    >
                                        {item.isAvailable ? <><Check size={12} /> Available</> : <><X size={12} /> Sold Out</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <MenuItemForm
                    item={editingItem}
                    onSubmit={handleAddEdit}
                    onCancel={() => { setShowForm(false); setEditingItem(null); }}
                />
            )}
        </div>
    );
};

export default Menu;

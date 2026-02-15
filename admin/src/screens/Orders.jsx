import React, { useState, useEffect } from 'react';
import api from '../api/api';
import {
    ShoppingBag,
    MapPin,
    Phone,
    Clock,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    ChefHat,
    Truck
} from 'lucide-react';

const StatusBadge = ({ status }) => {
    const colors = {
        pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        preparing: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        out_for_delivery: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
        delivered: 'bg-green-500/10 text-green-500 border-green-500/20',
        cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${colors[status] || 'bg-gray-500/10 text-gray-500'}`}>
            {status?.replace('_', ' ')}
        </span>
    );
};

const OrderCard = ({ order, onStatusUpdate }) => (
    <div className="bg-surface rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-all">
        <div className="p-6 border-b border-gray-800 flex justify-between items-start">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-white">#{order._id.slice(-6).toUpperCase()}</h3>
                    <StatusBadge status={order.orderStatus} />
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <Clock size={14} />
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
            </div>
            <div className="text-right">
                <p className="text-xl font-bold text-primary">₹{order.totalAmount}</p>
                <p className="text-xs text-gray-500 uppercase font-medium">{order.paymentMethod}</p>
            </div>
        </div>

        <div className="p-6 space-y-6">
            {/* Items */}
            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Items</h4>
                <div className="space-y-2">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-300">{item.quantity}x {item.name}</span>
                            <span className="text-white font-medium">₹{item.subtotal}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Customer</h4>
                    <p className="text-sm font-medium">{order.userId?.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <Phone size={12} />
                        <span>{order.userId?.phone}</span>
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Delivery to</h4>
                    <div className="flex items-start gap-1 text-xs text-gray-400">
                        <MapPin size={12} className="shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Actions */}
        {!['delivered', 'cancelled'].includes(order.orderStatus) && (
            <div className="p-6 bg-gray-900/50 border-t border-gray-800 flex gap-2">
                {order.orderStatus === 'pending' && (
                    <button
                        onClick={() => onStatusUpdate(order._id, 'confirmed')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={16} />
                        Confirm Order
                    </button>
                )}
                {order.orderStatus === 'confirmed' && (
                    <button
                        onClick={() => onStatusUpdate(order._id, 'preparing')}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <ChefHat size={16} />
                        Start Preparing
                    </button>
                )}
                {order.orderStatus === 'preparing' && (
                    <button
                        onClick={() => onStatusUpdate(order._id, 'out_for_delivery')}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <Truck size={16} />
                        Mark Ready
                    </button>
                )}
                {order.orderStatus === 'out_for_delivery' && (
                    <button
                        onClick={() => onStatusUpdate(order._id, 'delivered')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={16} />
                        Mark Delivered
                    </button>
                )}

                <button
                    onClick={() => onStatusUpdate(order._id, 'cancelled')}
                    className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-all border border-red-500/20"
                >
                    <AlertCircle size={20} />
                </button>
            </div>
        )}
    </div>
);

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/admin/orders');
            setOrders(data.data.orders);
        } catch (err) {
            console.error('Failed to fetch orders', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
            fetchOrders(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    const filteredOrders = filter === 'active'
        ? orders.filter(o => !['delivered', 'cancelled'].includes(o.orderStatus))
        : orders;

    if (loading) return <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-96 bg-surface rounded-2xl border border-gray-800"></div>)}
    </div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Manage Orders</h1>
                    <p className="text-gray-400 mt-1">Real-time order tracking and management</p>
                </div>
                <div className="flex bg-surface p-1 rounded-xl border border-gray-800 self-stretch sm:self-auto">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filter === 'all' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        All Orders
                    </button>
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filter === 'active' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        Active
                    </button>
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="bg-surface rounded-2xl border border-gray-800 p-20 flex flex-col items-center justify-center text-center">
                    <ShoppingBag size={64} className="text-gray-700 mb-4" />
                    <h3 className="text-xl font-bold text-gray-400">No orders found</h3>
                    <p className="text-gray-600 mt-2 max-w-xs">When customers place orders, they will appear here in real-time.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredOrders.map(order => (
                        <OrderCard
                            key={order._id}
                            order={order}
                            onStatusUpdate={handleStatusUpdate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import {
    DollarSign,
    ShoppingBag,
    Clock,
    TrendingUp,
    ArrowUpRight,
    Utensils
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-surface p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all group">
        <div className="flex items-start justify-between">
            <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500`}>
                <Icon size={24} />
            </div>
            <div className="flex items-center text-green-500 text-xs font-medium">
                <ArrowUpRight size={14} />
                <span>+12%</span>
            </div>
        </div>
        <div className="mt-4">
            <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/admin/dashboard');
            setStats(data.data);
        } catch (err) {
            console.error('Failed to fetch stats', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-800 rounded-2xl"></div>)}
        </div>
    </div>;

    return (
        <div className="space-y-8">
            {/* Header Info */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Welcome back, {stats?.restaurant?.name}</h1>
                    <p className="text-gray-400 mt-1">Here's what's happening today</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">Status:</span>
                    <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-green-500 uppercase">Kitchen Open</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats?.totalRevenue?.toLocaleString()}`}
                    icon={DollarSign}
                    color="green"
                    subtitle="Lifetime earnings"
                />
                <StatCard
                    title="Today's Earnings"
                    value={`₹${stats?.todayRevenue?.toLocaleString()}`}
                    icon={TrendingUp}
                    color="blue"
                    subtitle={`${stats?.todayOrders} orders today`}
                />
                <StatCard
                    title="Pending Orders"
                    value={stats?.pendingOrders}
                    icon={Clock}
                    color="yellow"
                    subtitle="Immediate action required"
                />
                <StatCard
                    title="Total Orders"
                    value={stats?.totalOrders}
                    icon={ShoppingBag}
                    color="purple"
                    subtitle="All successful deliveries"
                />
            </div>

            {/* Quick Actions / Recent Activity Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-surface rounded-2xl border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold mb-6">Preparation Insights</h3>
                    <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                        <Utensils size={48} className="mb-4 opacity-20" />
                        <p>Daily order charts will appear here</p>
                    </div>
                </div>

                <div className="bg-surface rounded-2xl border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold mb-6">Restuarant Info</h3>
                    <div className="space-y-4">
                        <img src={stats?.restaurant?.image} alt="Restaurant" className="w-full h-40 object-cover rounded-xl" />
                        <div>
                            <p className="text-sm font-medium">{stats?.restaurant?.name}</p>
                            <p className="text-xs text-gray-400 mt-1">{stats?.restaurant?.cuisineTypes?.join(', ')}</p>
                        </div>
                        <div className="pt-4 border-t border-gray-800">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Rating</span>
                                <span className="text-primary font-bold">{stats?.restaurant?.rating} ★</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

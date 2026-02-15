import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard as DashIcon,
    ShoppingBag as BagIcon,
    UtensilsCrossed as UtensilsIcon,
    LogOut as LogoutIcon,
    Menu as HamburgerIcon,
    X as CloseIcon,
    User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ to, icon: Icon, label, end, isOpen }) => (
    <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                ? 'bg-primary text-black font-semibold'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`
        }
    >
        <Icon size={20} />
        {isOpen && <span>{label}</span>}
    </NavLink>
);

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-background text-white">
            {/* Sidebar */}
            <aside className={`bg-surface border-r border-gray-800 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen && <h1 className="text-xl font-bold text-primary">FoodAdmin</h1>}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-400 hover:text-white mx-auto">
                        {isSidebarOpen ? <CloseIcon size={24} /> : <HamburgerIcon size={24} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <SidebarItem to="/" icon={DashIcon} label="Dashboard" end isOpen={isSidebarOpen} />
                    <SidebarItem to="/orders" icon={BagIcon} label="Orders" isOpen={isSidebarOpen} />
                    <SidebarItem to="/menu" icon={UtensilsIcon} label="Menu" isOpen={isSidebarOpen} />
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3 px-4 py-3 text-gray-400">
                        <UserIcon size={20} />
                        {isSidebarOpen && (
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-white truncate">{user?.name}</span>
                                <span className="text-[10px] uppercase font-bold text-primary">{user?.role?.replace('_', ' ')}</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors mt-2"
                    >
                        <LogoutIcon size={20} />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-surface border-b border-gray-800 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold capitalize">
                            {window.location.pathname === '/' ? 'Overview' : window.location.pathname.substring(1)}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-medium border border-green-500/20">
                            Online
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 bg-background">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;

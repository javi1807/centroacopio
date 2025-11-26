import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, Map, Truck, ClipboardCheck,
    Warehouse, History, BarChart3, Bell, Search, Menu, X, LogOut, ChevronDown, Check, Trash2, Loader2, DollarSign
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useData } from '../../context/DataContext';
import logo from '../../assets/angrologo.png';

const SidebarItem = ({ icon: Icon, label, to, active }) => (
    <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active
            ? 'bg-green-50 text-green-700 font-medium'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
    >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
    </Link>
);

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const { notifications, markAsRead, clearNotifications } = useToast();
    const { loading } = useData();
    const location = useLocation();

    const unreadCount = notifications.filter(n => !n.read).length;

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Cargando sistema...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-full flex flex-col">
                    <div className="h-24 flex items-center px-6 border-b border-gray-200">
                        <Link to="/dashboard" className="flex items-center gap-2">
                            <img src={logo} alt="AgroSync" className="h-20 w-auto" />
                        </Link>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                        <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" active={location.pathname === '/dashboard'} />
                        <SidebarItem icon={Users} label="Agricultores" to="/dashboard/farmers" active={location.pathname.includes('farmers')} />
                        <SidebarItem icon={Map} label="Terrenos" to="/dashboard/lands" active={location.pathname.includes('lands')} />

                        <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Procesos
                        </div>
                        <SidebarItem icon={Truck} label="Nueva Entrega" to="/dashboard/delivery" active={location.pathname.includes('delivery')} />
                        <SidebarItem icon={ClipboardCheck} label="Control Calidad" to="/dashboard/quality" active={location.pathname.includes('quality')} />
                        <SidebarItem icon={Warehouse} label="Almacenamiento" to="/dashboard/storage" active={location.pathname.includes('storage')} />
                        <SidebarItem icon={DollarSign} label="Pagos" to="/dashboard/payments" active={location.pathname.includes('payments')} />
                        <SidebarItem icon={History} label="Historial" to="/dashboard/history" active={location.pathname.includes('history')} />

                        <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Reportes
                        </div>
                        <SidebarItem icon={BarChart3} label="Reportes" to="/dashboard/reports" active={location.pathname.includes('reports')} />
                    </div>

                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                                AD
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                                <p className="text-xs text-gray-500 truncate">admin@agrosync.com</p>
                            </div>
                            <LogOut className="h-5 w-5 text-gray-400 hover:text-red-500" />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex-1 flex justify-between items-center ml-4">
                        <div className="max-w-lg w-full lg:max-w-xs relative hidden md:block">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm transition duration-150 ease-in-out"
                                placeholder="Buscar..."
                                type="search"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <button
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none relative"
                                >
                                    <Bell className="h-6 w-6" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                                    )}
                                </button>

                                {/* Notifications Dropdown */}
                                {isNotificationsOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                        <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                                            <div className="flex gap-2">
                                                <button onClick={markAsRead} className="text-xs text-green-600 hover:text-green-700 font-medium" title="Marcar como leídas">
                                                    <Check className="h-4 w-4" />
                                                </button>
                                                <button onClick={clearNotifications} className="text-xs text-red-600 hover:text-red-700 font-medium" title="Borrar todo">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map((notification) => (
                                                    <div key={notification.id} className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 ${!notification.read ? 'bg-green-50/50' : ''}`}>
                                                        <div className="flex gap-3">
                                                            <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${notification.type === 'success' ? 'bg-green-500' :
                                                                notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                                                                }`}></div>
                                                            <div>
                                                                <p className="text-sm text-gray-800">{notification.message}</p>
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    {new Date(notification.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                                    No tienes notificaciones
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="h-8 w-px bg-gray-200 mx-2"></div>
                            <span className="text-sm text-gray-500 hidden sm:block">
                                {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-gray-600 bg-opacity-50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default DashboardLayout;

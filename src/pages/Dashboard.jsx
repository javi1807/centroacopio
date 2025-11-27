import React, { useMemo, useState } from 'react';
import {
    Users, Truck, ClipboardCheck, Warehouse, ArrowUpRight, ArrowDownRight, MoreHorizontal
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../context/DataContext';

const StatCard = ({ title, value, change, trend, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
            {trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={trend === 'up' ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                {change}
            </span>
            <span className="text-gray-400 ml-2">vs mes anterior</span>
        </div>
    </div>

);

const PriceWidget = () => {
    const { prices, updatePrice } = useData();
    const [editingId, setEditingId] = useState(null);
    const [tempPrice, setTempPrice] = useState('');

    const handleEdit = (price) => {
        setEditingId(price.id);
        setTempPrice(price.price);
    };

    const handleSave = async (quality) => {
        await updatePrice(quality, parseFloat(tempPrice));
        setEditingId(null);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Precios del Día (S/.)</h3>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">Actualizado hoy</span>
            </div>
            <div className="space-y-4">
                {prices.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${item.quality === 'Premium' ? 'bg-purple-500' :
                                item.quality === 'Estándar' ? 'bg-blue-500' :
                                    item.quality === 'Básica' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></div>
                            <span className="font-medium text-gray-700">{item.quality}</span>
                        </div>
                        {editingId === item.id ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    step="0.10"
                                    value={tempPrice}
                                    onChange={(e) => setTempPrice(e.target.value)}
                                    className="w-20 px-2 py-1 text-sm border border-green-500 rounded focus:outline-none"
                                    autoFocus
                                />
                                <button onClick={() => handleSave(item.quality)} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">OK</button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 group">
                                <span className="font-bold text-gray-900">S/. {item.price.toFixed(2)}</span>
                                <button onClick={() => handleEdit(item)} className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { getStats, deliveries } = useData();
    const stats = getStats();

    // Process chart data from deliveries
    const chartData = useMemo(() => {
        const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
        const data = days.map(day => ({ name: day, entregas: 0, calidad: 0 }));

        deliveries.forEach(d => {
            const date = new Date(d.date);
            const dayIndex = date.getDay();
            data[dayIndex].entregas += 1;
            if (d.status === 'Completado' || d.status === 'Almacenado') {
                data[dayIndex].calidad += 1;
            }
        });

        return data;
    }, [deliveries]);

    // Generate recent activity from deliveries
    const recentActivity = deliveries.slice(0, 5).map(d => ({
        user: d.farmer,
        action: `Entrega ${d.status.toLowerCase()}`,
        time: new Date(d.date).toLocaleDateString(),
        type: d.status === 'Completado' ? 'success' : d.status === 'Almacenado' ? 'info' : d.status === 'Rechazado' ? 'error' : 'warning'
    }));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard General</h1>
                    <p className="text-gray-500">Resumen de actividad y métricas clave</p>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm">
                    Descargar Reporte
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Agricultores Activos"
                    value={stats.activeFarmers}
                    change="+12%"
                    trend="up"
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Entregas Pendientes"
                    value={stats.pendingDeliveries}
                    change="+5%"
                    trend="up"
                    icon={Truck}
                    color="bg-yellow-500"
                />
                <StatCard
                    title="En Control Calidad"
                    value={stats.qualityCheck}
                    change="-3%"
                    trend="down"
                    icon={ClipboardCheck}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Total Almacenado"
                    value={`${stats.totalStored.toFixed(0)} kg`}
                    change="+8%"
                    trend="up"
                    icon={Warehouse}
                    color="bg-green-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Actividad Semanal</h3>
                        <select className="text-sm border-gray-200 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none">
                            <option>Esta Semana</option>
                            <option>Semana Pasada</option>
                        </select>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="entregas" fill="#22c55e" radius={[4, 4, 0, 0]} name="Entregas" />
                                <Bar dataKey="calidad" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Aprobados" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Actividad Reciente</h3>
                        <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="space-y-6">
                        {recentActivity.length > 0 ? recentActivity.map((item, index) => (
                            <div key={index} className="flex gap-4">
                                <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${item.type === 'success' ? 'bg-green-500' :
                                    item.type === 'error' ? 'bg-red-500' :
                                        item.type === 'info' ? 'bg-blue-500' : 'bg-gray-400'
                                    }`}></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{item.user}</p>
                                    <p className="text-sm text-gray-500">{item.action}</p>
                                    <span className="text-xs text-gray-400 mt-1 block">{item.time}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-500 text-center py-4">No hay actividad reciente</p>
                        )}
                    </div>
                    <button className="w-full mt-6 py-2 text-sm text-green-600 font-medium hover:bg-green-50 rounded-lg transition-colors">
                        Ver todo el historial
                    </button>
                </div>

                {/* Price Widget */}
                <PriceWidget />
            </div>

            {/* Recent Deliveries Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Entregas Recientes</h3>
                    <button className="text-sm text-green-600 font-medium hover:text-green-700">Ver todas</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-3 font-medium">ID</th>
                                <th className="px-6 py-3 font-medium">Agricultor</th>
                                <th className="px-6 py-3 font-medium">Producto</th>
                                <th className="px-6 py-3 font-medium">Peso (kg)</th>
                                <th className="px-6 py-3 font-medium">Estado</th>
                                <th className="px-6 py-3 font-medium">Fecha</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {deliveries.slice(0, 5).map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{row.id}</td>
                                    <td className="px-6 py-4 text-gray-600">{row.farmer}</td>
                                    <td className="px-6 py-4 text-gray-600">{row.product}</td>
                                    <td className="px-6 py-4 text-gray-600">{row.weight}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.status === 'Completado' ? 'bg-green-100 text-green-800' :
                                            row.status === 'Almacenado' ? 'bg-blue-100 text-blue-800' :
                                                row.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                    row.status === 'En Calidad' ? 'bg-indigo-100 text-indigo-800' :
                                                        'bg-red-100 text-red-800'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(row.date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

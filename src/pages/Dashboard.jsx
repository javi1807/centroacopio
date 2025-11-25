import React from 'react';
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

const Dashboard = () => {
    const { getStats, deliveries } = useData();
    const stats = getStats();

    const chartData = [
        { name: 'Lun', entregas: 4, calidad: 3 },
        { name: 'Mar', entregas: 7, calidad: 5 },
        { name: 'Mie', entregas: 5, calidad: 4 },
        { name: 'Jue', entregas: 9, calidad: 7 },
        { name: 'Vie', entregas: 12, calidad: 10 },
        { name: 'Sab', entregas: 8, calidad: 6 },
        { name: 'Dom', entregas: 3, calidad: 2 },
    ];

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
                    value={`${stats.totalStored} kg`}
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
                        {[
                            { user: "Juan Pérez", action: "Nueva entrega registrada", time: "Hace 2 horas", type: "success" },
                            { user: "Control Calidad", action: "Lote #458 rechazado", time: "Hace 4 horas", type: "error" },
                            { user: "Carlos López", action: "Actualizó datos de terreno", time: "Hace 1 día", type: "info" },
                            { user: "Sistema", action: "Backup automático completado", time: "Hace 1 día", type: "neutral" },
                        ].map((item, index) => (
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
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2 text-sm text-green-600 font-medium hover:bg-green-50 rounded-lg transition-colors">
                        Ver todo el historial
                    </button>
                </div>
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
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.status === 'Almacenado' ? 'bg-green-100 text-green-800' :
                                                row.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                    row.status === 'En Calidad' ? 'bg-blue-100 text-blue-800' :
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

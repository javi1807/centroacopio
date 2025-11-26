import React, { useMemo } from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Calendar, DollarSign, Scale, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend } from 'recharts';
import { useData } from '../context/DataContext';

const ReportsPage = () => {
    const { deliveries, payments, farmers } = useData();

    // --- Calculations ---

    // 1. Monthly Production (Bar Chart)
    const monthlyData = useMemo(() => {
        const months = {};
        deliveries.forEach(d => {
            const date = new Date(d.date);
            const monthKey = date.toLocaleString('es-ES', { month: 'short' }); // e.g., "nov"
            // Sort key to order months correctly if needed, but for now simple grouping
            months[monthKey] = (months[monthKey] || 0) + parseFloat(d.weight || 0);
        });

        return Object.entries(months).map(([name, cantidad]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
            cantidad
        }));
    }, [deliveries]);

    // 2. Quality Distribution (Pie Chart)
    const qualityData = useMemo(() => {
        const counts = {};
        deliveries.forEach(d => {
            // Use 'notes' or 'status' as a proxy for quality if explicit quality field is missing on delivery
            // Or better, use price_per_kg to infer quality if available, or just status
            // Let's use Status for now as it's consistent
            const key = d.status || 'Desconocido';
            counts[key] = (counts[key] || 0) + 1;
        });

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [deliveries]);

    // 3. Key Metrics
    const totalWeight = deliveries.reduce((acc, curr) => acc + parseFloat(curr.weight || 0), 0);
    const totalPaid = payments.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
    const activeFarmersCount = farmers.filter(f => f.status === 'Activo').length;

    // Calculate average price per kg (weighted average)
    // Only consider deliveries that have both weight and price/payment info if possible
    // For simplicity, let's use total payments / total weight (approximate)
    // Or if we have price_per_kg in deliveries, average that.
    const avgPrice = deliveries.length > 0
        ? deliveries.reduce((acc, curr) => acc + (parseFloat(curr.price_per_kg) || 0), 0) / deliveries.length
        : 0;


    const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
                    <p className="text-gray-500">Visualización de métricas en tiempo real</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                        <Calendar className="h-4 w-4" /> Este Mes
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <Download className="h-4 w-4" /> Exportar PDF
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <Scale className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Acopiado</p>
                            <h4 className="text-2xl font-bold text-gray-900">{totalWeight.toLocaleString()} kg</h4>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-lg text-green-600">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Pagado</p>
                            <h4 className="text-2xl font-bold text-gray-900">S/ {totalPaid.toLocaleString()}</h4>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Agricultores Activos</p>
                            <h4 className="text-2xl font-bold text-gray-900">{activeFarmersCount}</h4>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Precio Promedio</p>
                            <h4 className="text-2xl font-bold text-gray-900">S/ {avgPrice.toFixed(2)} /kg</h4>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Acopio Mensual */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Acopio Mensual (kg)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="cantidad" fill="#22c55e" radius={[4, 4, 0, 0]} name="Cantidad (kg)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Estado de Entregas */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Estado de Entregas</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={qualityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {qualityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;

import React, { useState } from 'react';
import { DollarSign, Search, Filter, Download, Trash2, CheckCircle, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

const PaymentsPage = () => {
    const { payments, deletePayment, farmers } = useData();
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este registro de pago?')) {
            await deletePayment(id);
            addToast('Pago eliminado correctamente', 'info');
        }
    };

    const filteredPayments = payments.filter(payment => {
        const matchesSearch = payment.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.reference.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = filterDate ? payment.date.startsWith(filterDate) : true;
        return matchesSearch && matchesDate;
    });

    const totalPaid = filteredPayments.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Historial de Pagos</h1>
                    <p className="text-gray-500">Registro detallado de transacciones</p>
                </div>
                <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100 flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full text-green-600">
                        <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-green-600 font-medium uppercase">Total Pagado</p>
                        <p className="text-xl font-bold text-green-700">S/ {totalPaid.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4 flex-1 min-w-[300px]">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por agricultor o referencia..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                    <Download className="h-4 w-4" />
                    Exportar
                </button>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-3 font-medium">Fecha</th>
                                <th className="px-6 py-3 font-medium">Agricultor</th>
                                <th className="px-6 py-3 font-medium">Referencia / Entrega</th>
                                <th className="px-6 py-3 font-medium">Método</th>
                                <th className="px-6 py-3 font-medium">Monto</th>
                                <th className="px-6 py-3 font-medium">Estado</th>
                                <th className="px-6 py-3 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPayments.length > 0 ? (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(payment.date).toLocaleDateString()}
                                            <span className="block text-xs text-gray-400">
                                                {new Date(payment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {payment.farmerName}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{payment.reference}</span>
                                                <span className="text-xs text-gray-500">Entrega: {payment.deliveryId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">
                                                {payment.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            S/ {payment.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle className="h-3 w-3" />
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(payment.id)}
                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Eliminar registro"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron pagos registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentsPage;

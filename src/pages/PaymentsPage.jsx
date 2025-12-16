import React, { useState } from 'react';
import { DollarSign, Search, Filter, Download, Trash2, CheckCircle, Calendar, X, Eye, User, Package, MapPin, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentsPage = () => {
    const { payments, deletePayment, farmers, deliveries } = useData();
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este registro de pago?')) {
            await deletePayment(id);
            addToast('Pago eliminado correctamente', 'info');
        }
    };

    const filteredPayments = payments.filter(payment => {
        const matchesSearch = (payment.farmerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (payment.reference || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = filterDate ? (payment.date || '').startsWith(filterDate) : true;
        return matchesSearch && matchesDate;
    });

    const totalPaid = filteredPayments.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

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
                                            {payment.farmerName || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{payment.reference || 'Sin referencia'}</span>
                                                <span className="text-xs text-gray-500">Entrega: {payment.deliveryId || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">
                                                {payment.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            S/ {(parseFloat(payment.amount) || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle className="h-3 w-3" />
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedPayment(payment)}
                                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="Ver detalle"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(payment.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Eliminar registro"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
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

            {/* Payment Detail Modal */}
            <AnimatePresence>
                {selectedPayment && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedPayment(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                            <DollarSign className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">Detalle de Pago</h3>
                                            <p className="text-sm text-gray-600">ID: #{selectedPayment.id}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedPayment(null)}
                                        className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                                    >
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto flex-1">
                                {/* Amount Card */}
                                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white mb-6">
                                    <p className="text-sm opacity-90 mb-1">Monto Total</p>
                                    <p className="text-4xl font-bold">S/ {(parseFloat(selectedPayment.amount) || 0).toFixed(2)}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="text-sm">{selectedPayment.status}</span>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-gray-600" />
                                        Información de Pago
                                    </h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Fecha de Pago</p>
                                            <p className="font-medium text-gray-900">{new Date(selectedPayment.date).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            <p className="text-xs text-gray-600 mt-1">{new Date(selectedPayment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Método de Pago</p>
                                            <p className="font-medium text-gray-900">{selectedPayment.method}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                                            <p className="text-xs text-gray-500 mb-1">Referencia / Comprobante</p>
                                            <p className="font-medium text-gray-900">{selectedPayment.reference || 'Sin referencia'}</p>
                                        </div>
                                    </div>

                                    {/* Farmer Information */}
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2 mt-6">
                                        <User className="h-5 w-5 text-gray-600" />
                                        Agricultor
                                    </h4>
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <p className="font-bold text-gray-900 text-lg">{selectedPayment.farmerName || 'N/A'}</p>
                                        {selectedPayment.farmerId && (
                                            <p className="text-sm text-gray-600 mt-1">ID: {selectedPayment.farmerId}</p>
                                        )}
                                    </div>

                                    {/* Delivery Information */}
                                    {selectedPayment.deliveryId && (() => {
                                        const delivery = deliveries.find(d => d.id === selectedPayment.deliveryId);
                                        return delivery ? (
                                            <>
                                                <h4 className="font-bold text-gray-900 flex items-center gap-2 mt-6">
                                                    <Package className="h-5 w-5 text-gray-600" />
                                                    Entrega Asociada
                                                </h4>
                                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 space-y-4">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <p className="text-xs text-amber-700 mb-1">ID Entrega</p>
                                                            <p className="font-medium text-gray-900">{delivery.id}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-amber-700 mb-1">Producto</p>
                                                            <p className="font-medium text-gray-900">{delivery.product}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-amber-700 mb-1">Peso</p>
                                                            <p className="font-medium text-gray-900">{delivery.weight} kg</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-amber-700 mb-1">Fecha Entrega</p>
                                                            <p className="font-medium text-gray-900">{new Date(delivery.date).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>

                                                    {/* Quality Control Data */}
                                                    {(delivery.impurities !== undefined || delivery.humidity !== undefined || delivery.damaged_grains !== undefined) && (
                                                        <>
                                                            <div className="border-t border-amber-200 pt-4">
                                                                <p className="text-xs font-bold text-amber-800 mb-3 uppercase tracking-wide">Control de Calidad</p>
                                                                <div className="grid grid-cols-3 gap-3">
                                                                    {delivery.impurities !== undefined && (
                                                                        <div className="bg-white p-3 rounded-lg">
                                                                            <p className="text-xs text-gray-500 mb-1">Impurezas</p>
                                                                            <p className="text-lg font-bold text-gray-900">{delivery.impurities}%</p>
                                                                        </div>
                                                                    )}
                                                                    {delivery.humidity !== undefined && (
                                                                        <div className="bg-white p-3 rounded-lg">
                                                                            <p className="text-xs text-gray-500 mb-1">Humedad</p>
                                                                            <p className="text-lg font-bold text-gray-900">{delivery.humidity}%</p>
                                                                        </div>
                                                                    )}
                                                                    {delivery.damaged_grains !== undefined && (
                                                                        <div className="bg-white p-3 rounded-lg">
                                                                            <p className="text-xs text-gray-500 mb-1">Granos Dañados</p>
                                                                            <p className="text-lg font-bold text-gray-900">{delivery.damaged_grains}%</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Additional Quality Metrics */}
                                                            {(delivery.fermentation !== undefined || delivery.mold !== undefined || delivery.grain_size !== undefined) && (
                                                                <div className="grid grid-cols-3 gap-3">
                                                                    {delivery.fermentation !== undefined && (
                                                                        <div className="bg-white p-3 rounded-lg">
                                                                            <p className="text-xs text-gray-500 mb-1">Fermentación</p>
                                                                            <p className="text-lg font-bold text-gray-900">{delivery.fermentation}%</p>
                                                                        </div>
                                                                    )}
                                                                    {delivery.mold !== undefined && (
                                                                        <div className="bg-white p-3 rounded-lg">
                                                                            <p className="text-xs text-gray-500 mb-1">Moho</p>
                                                                            <p className="text-lg font-bold text-gray-900">{delivery.mold}%</p>
                                                                        </div>
                                                                    )}
                                                                    {delivery.grain_size !== undefined && (
                                                                        <div className="bg-white p-3 rounded-lg">
                                                                            <p className="text-xs text-gray-500 mb-1">Tamaño Grano</p>
                                                                            <p className="text-sm font-medium text-gray-900">{delivery.grain_size}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Price per kg if available */}
                                                            {delivery.price_per_kg && (
                                                                <div className="bg-green-100 p-3 rounded-lg border border-green-200">
                                                                    <p className="text-xs text-green-700 mb-1">Precio por KG</p>
                                                                    <p className="text-xl font-bold text-green-800">S/ {parseFloat(delivery.price_per_kg).toFixed(2)}</p>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <h4 className="font-bold text-gray-900 flex items-center gap-2 mt-6">
                                                    <Package className="h-5 w-5 text-gray-600" />
                                                    Entrega Asociada
                                                </h4>
                                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                                    <p className="text-sm text-gray-500">Entrega: {selectedPayment.deliveryId}</p>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                                <button
                                    onClick={() => setSelectedPayment(null)}
                                    className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PaymentsPage;

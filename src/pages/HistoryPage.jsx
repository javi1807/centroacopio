import React, { useState } from 'react';
import { History, FileText, Download, Filter, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

const HistoryPage = () => {
    const { deliveries, deleteDelivery } = useData();
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = (id) => {
        if (window.confirm('¿Está seguro de eliminar este registro?')) {
            deleteDelivery(id);
            addToast('Registro eliminado', 'info');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Historial de Acopio</h1>
                    <p className="text-gray-500">Registro histórico de todas las operaciones</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                        <Filter className="h-4 w-4" /> Filtros
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm">
                        <Download className="h-4 w-4" /> Exportar
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-medium">ID</th>
                                <th className="px-6 py-3 font-medium">Fecha</th>
                                <th className="px-6 py-3 font-medium">Agricultor</th>
                                <th className="px-6 py-3 font-medium">Producto</th>
                                <th className="px-6 py-3 font-medium">Peso (kg)</th>
                                <th className="px-6 py-3 font-medium">Estado</th>
                                <th className="px-6 py-3 font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {deliveries.length > 0 ? (
                                deliveries.map((delivery) => (
                                    <tr key={delivery.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{delivery.id}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(delivery.date).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{delivery.farmer}</td>
                                        <td className="px-6 py-4 text-gray-600">{delivery.product}</td>
                                        <td className="px-6 py-4 text-gray-900 font-medium">
                                            {delivery.product_state === 'baba' ? (
                                                <div>
                                                    <span className="font-bold">{delivery.weight_fresh} kg</span>
                                                    <span className="text-xs text-gray-500 ml-1">(baba)</span>
                                                    <div className="text-xs text-blue-600">
                                                        ≈ {parseFloat(delivery.weight).toFixed(2)} kg seco
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="font-bold">{delivery.weight} kg</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${delivery.status === 'Completado' ? 'bg-green-100 text-green-800' :
                                                    delivery.status === 'Almacenado' ? 'bg-blue-100 text-blue-800' :
                                                        delivery.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                            delivery.status === 'En Calidad' ? 'bg-indigo-100 text-indigo-800' :
                                                                'bg-red-100 text-red-800'
                                                }`}>
                                                {delivery.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDelete(delivery.id)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No hay registros de entregas.
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

export default HistoryPage;

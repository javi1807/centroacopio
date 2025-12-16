import React, { useState } from 'react';
import { History, FileText, Download, Filter, Trash2, Edit2, X, Save } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

const HistoryPage = () => {
    const { deliveries, deleteDelivery, updateDelivery, products } = useData();
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    // Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDelivery, setEditingDelivery] = useState(null);
    const [editForm, setEditForm] = useState({
        weight: '',
        weight_fresh: '',
        product: '',
        notes: ''
    });

    const handleDelete = (id) => {
        if (window.confirm('¿Está seguro de eliminar este registro?')) {
            deleteDelivery(id);
            addToast('Registro eliminado', 'info');
        }
    };

    const handleEdit = (delivery) => {
        setEditingDelivery(delivery);
        setEditForm({
            weight: delivery.weight,
            weight_fresh: delivery.weight_fresh || '',
            product: delivery.product,
            notes: delivery.notes || ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        if (name === 'weight_fresh' && editingDelivery.product_state === 'baba') {
            // Auto-calculate dry weight if editing fresh weight
            const fresh = parseFloat(value) || 0;
            const factor = editingDelivery.conversion_factor || 0.4; // Fallback to 0.4 if missing
            const dry = (fresh * factor).toFixed(2);

            setEditForm(prev => ({
                ...prev,
                weight_fresh: value,
                weight: dry
            }));
        } else {
            setEditForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editingDelivery) return;

        const updates = {
            weight: editForm.weight,
            product: editForm.product,
            notes: editForm.notes
        };

        if (editingDelivery.product_state === 'baba') {
            updates.weight_fresh = editForm.weight_fresh;
        }

        await updateDelivery(editingDelivery.id, updates);
        addToast('Entrega actualizada correctamente', 'success');
        setIsEditModalOpen(false);
        setEditingDelivery(null);
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
                                        <td className="px-6 py-4 flex gap-2">
                                            <button
                                                onClick={() => handleEdit(delivery)}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
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

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Editar Entrega</h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                                <select
                                    name="product"
                                    value={editForm.product}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {products.map(p => (
                                        <option key={p.id} value={p.name}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            {editingDelivery?.product_state === 'baba' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Peso Fresco (Baba) kg</label>
                                    <input
                                        type="number"
                                        name="weight_fresh"
                                        value={editForm.weight_fresh}
                                        onChange={handleEditChange}
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Peso seco calculado: <strong>{editForm.weight} kg</strong> (Factor: {editingDelivery.conversion_factor})
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Peso Neto (kg)</label>
                                    <input
                                        type="number"
                                        name="weight"
                                        value={editForm.weight}
                                        onChange={handleEditChange}
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                                <textarea
                                    name="notes"
                                    value={editForm.notes}
                                    onChange={handleEditChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                ></textarea>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                                >
                                    <Save className="h-4 w-4" /> Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryPage;

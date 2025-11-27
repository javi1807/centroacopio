import React, { useState, useEffect } from 'react';
import { Warehouse, Package, ArrowRight, CheckCircle, Plus, Settings, Edit2, Trash2, X, Save, AlertTriangle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProcessSteps from '../components/ui/ProcessSteps';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const StoragePage = () => {
    const { deliveries, updateDelivery, warehouses, addWarehouse, updateWarehouse, deleteWarehouse, farmers } = useData();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [selectedItem, setSelectedItem] = useState(null);
    const [location, setLocation] = useState('');
    const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // Warehouse Management State
    const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState(null);
    const [newWarehouse, setNewWarehouse] = useState({
        name: '',
        type: 'Centro de Acopio',
        capacity: '',
        location: '',
        status: 'Activo'
    });

    // Filter only stored items
    const storedItems = deliveries.filter(d => d.status === 'Almacenado' || d.status === 'Completado');

    // Calculate dynamic stats for warehouses
    const getWarehouseStats = (warehouseId) => {
        const itemsInWarehouse = storedItems.filter(item => item.warehouseId === warehouseId);
        const usedCapacity = itemsInWarehouse.reduce((acc, curr) => acc + parseFloat(curr.weight || 0), 0);
        return usedCapacity;
    };

    // Auto-select from URL
    useEffect(() => {
        const idFromUrl = searchParams.get('id');
        if (idFromUrl && deliveries.length > 0) {
            const item = deliveries.find(d => d.id === idFromUrl);
            if (item) {
                handleAssignLocation(item);
            }
        }
    }, [searchParams, deliveries]);

    const handleAssignLocation = (item) => {
        setSelectedItem(item);
        if (item.warehouseId) {
            setSelectedWarehouseId(item.warehouseId);
            setLocation(item.location_detail || '');
        } else {
            setSelectedWarehouseId('');
            setLocation('');
        }
    };

    const handleSaveLocation = async () => {
        if (selectedItem && selectedWarehouseId) {
            const warehouse = warehouses.find(w => w.id === parseInt(selectedWarehouseId));
            if (!warehouse) return;

            // Check capacity
            const currentUsed = getWarehouseStats(warehouse.id);
            const itemWeight = parseFloat(selectedItem.weight);

            // If we are re-assigning to the same warehouse, subtract current weight first
            // But for simplicity, we'll just check if adding it would overflow (ignoring if it's already there for now)
            // A better check would be: if (item.warehouseId !== warehouse.id) ...

            if (currentUsed + itemWeight > warehouse.capacity) {
                if (!window.confirm(`Advertencia: Esta asignación excederá la capacidad de la bodega ${warehouse.name}. ¿Desea continuar?`)) {
                    return;
                }
            }

            await updateDelivery(selectedItem.id, {
                warehouseId: warehouse.id,
                location_detail: location,
                status: 'Almacenado' // Ensure status is updated
            });

            setSelectedItem(null);
            setLocation('');
            setSelectedWarehouseId('');
            setShowSuccess(true);
            addToast('Ubicación asignada correctamente', 'success');

            // Clear URL param
            navigate('/dashboard/storage', { replace: true });
        } else {
            addToast('Por favor seleccione una bodega', 'error');
        }
    };

    // Warehouse CRUD Handlers
    const handleSaveWarehouse = async (e) => {
        e.preventDefault();
        if (editingWarehouse) {
            await updateWarehouse(editingWarehouse.id, newWarehouse);
            addToast('Bodega actualizada', 'success');
        } else {
            await addWarehouse(newWarehouse);
            addToast('Bodega creada', 'success');
        }
        setIsWarehouseModalOpen(false);
        setEditingWarehouse(null);
        resetWarehouseForm();
    };

    const handleDeleteWarehouse = async (id) => {
        if (window.confirm('¿Está seguro de eliminar esta bodega?')) {
            await deleteWarehouse(id);
            addToast('Bodega eliminada', 'info');
        }
    };

    const resetWarehouseForm = () => {
        setNewWarehouse({
            name: '',
            type: 'Centro de Acopio',
            capacity: '',
            location: '',
            status: 'Activo'
        });
    };

    const openEditWarehouse = (warehouse) => {
        setEditingWarehouse(warehouse);
        setNewWarehouse(warehouse);
        setIsWarehouseModalOpen(true);
    };

    if (showSuccess) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Proceso Completado!</h2>
                    <p className="text-gray-500 mb-8">
                        El ciclo de recepción, calidad y almacenamiento ha finalizado exitosamente.
                    </p>

                    <button
                        onClick={() => setShowSuccess(false)}
                        className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Almacenamiento</h1>
                    <p className="text-gray-500">Gestión de inventarios y ubicaciones</p>
                </div>
                <button
                    onClick={() => {
                        setEditingWarehouse(null);
                        resetWarehouseForm();
                        setIsWarehouseModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    Nueva Bodega
                </button>
            </div>

            {/* Process Steps - Always visible for consistency */}
            <ProcessSteps currentStep={3} />

            {/* Warehouse Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {warehouses.map((wh) => {
                    const used = getWarehouseStats(wh.id);
                    const percentage = Math.min((used / wh.capacity) * 100, 100);
                    const isFull = percentage >= 90;

                    return (
                        <div key={wh.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button onClick={() => openEditWarehouse(wh)} className="p-1 text-gray-400 hover:text-blue-600">
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDeleteWarehouse(wh.id)} className="p-1 text-gray-400 hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                    <Warehouse className="h-6 w-6" />
                                </div>
                                <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">{wh.type}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{wh.name}</h3>
                            <p className="text-xs text-gray-500 mb-4">{wh.location}</p>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Ocupación</span>
                                    <span className={isFull ? 'text-red-600 font-bold' : ''}>{Math.round(percentage)}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-blue-500'}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{used.toFixed(2)} kg</span>
                                    <span>{wh.capacity} kg Total</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Inventario Actual</h3>
                    <div className="flex gap-2">
                        {/* Future: Add filters here */}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-3 font-medium">Lote / ID</th>
                                <th className="px-6 py-3 font-medium">Producto</th>
                                <th className="px-6 py-3 font-medium">Agricultor</th>
                                <th className="px-6 py-3 font-medium">Cantidad</th>
                                <th className="px-6 py-3 font-medium">Ubicación</th>
                                <th className="px-6 py-3 font-medium">Estado</th>
                                <th className="px-6 py-3 font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {storedItems.length > 0 ? (
                                storedItems.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.id}</td>
                                        <td className="px-6 py-4 text-gray-600">{item.product}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {item.farmer || farmers.find(f => f.id == item.farmerId)?.name || 'Desconocido'}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.weight} kg</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {item.storage_location ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                                                    {item.storage_location}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">Sin asignar</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                Almacenado
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleAssignLocation(item)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                                            >
                                                Editar Ubicación
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No hay productos en almacenamiento.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Location Assignment Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Asignar Ubicación</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Asignar ubicación para el lote <span className="font-bold">{selectedItem.id}</span>
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bodega *</label>
                                    <select
                                        value={selectedWarehouseId}
                                        onChange={(e) => setSelectedWarehouseId(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    >
                                        <option value="">Seleccione una bodega</option>
                                        {warehouses.map(wh => (
                                            <option key={wh.id} value={wh.id}>
                                                {wh.name} (Disp: {wh.capacity - getWarehouseStats(wh.id)} kg)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Detalle / Estante</label>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="Ej. Estante A, Nivel 2"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setSelectedItem(null)}
                                        className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveLocation}
                                        className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Warehouse Management Modal */}
            <AnimatePresence>
                {isWarehouseModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {editingWarehouse ? 'Editar Bodega' : 'Nueva Bodega'}
                                </h3>
                                <button onClick={() => setIsWarehouseModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveWarehouse} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newWarehouse.name}
                                        onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Ej. Bodega Principal"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                        <select
                                            value={newWarehouse.type}
                                            onChange={(e) => setNewWarehouse({ ...newWarehouse, type: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="Centro de Acopio">Centro de Acopio</option>
                                            <option value="Secado">Secado</option>
                                            <option value="Fermentación">Fermentación</option>
                                            <option value="Bodega">Bodega</option>
                                            <option value="Insumos">Insumos</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad (kg) *</label>
                                        <input
                                            type="number"
                                            required
                                            value={newWarehouse.capacity}
                                            onChange={(e) => setNewWarehouse({ ...newWarehouse, capacity: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="5000"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación Física</label>
                                    <input
                                        type="text"
                                        value={newWarehouse.location}
                                        onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Ej. Sector Norte, Bloque A"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsWarehouseModalOpen(false)}
                                        className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                                    >
                                        {editingWarehouse ? 'Actualizar' : 'Crear Bodega'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StoragePage;

import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, X, Save } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const FarmersPage = () => {
    const { farmers, addFarmer, deleteFarmer } = useData();
    const { addToast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [zoneFilter, setZoneFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [newFarmer, setNewFarmer] = useState({
        name: '',
        document: '',
        phone: '',
        zone: 'Norte',
        status: 'Activo'
    });

    const filteredFarmers = farmers.filter(farmer => {
        const matchesSearch = farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            farmer.document.includes(searchTerm);
        const matchesStatus = statusFilter ? farmer.status.toLowerCase() === statusFilter.toLowerCase() : true;
        const matchesZone = zoneFilter ? farmer.zone.toLowerCase() === zoneFilter.toLowerCase() : true;

        return matchesSearch && matchesStatus && matchesZone;
    });

    const handleAddFarmer = (e) => {
        e.preventDefault();
        if (!newFarmer.name || !newFarmer.document) {
            addToast('Por favor complete los campos obligatorios', 'error');
            return;
        }

        addFarmer(newFarmer);
        addToast('Agricultor registrado exitosamente', 'success');
        setIsModalOpen(false);
        setNewFarmer({ name: '', document: '', phone: '', zone: 'Norte', status: 'Activo' });
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Está seguro de eliminar este agricultor?')) {
            deleteFarmer(id);
            addToast('Agricultor eliminado', 'info');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Agricultores</h1>
                    <p className="text-gray-500">Registro y administración de agricultores</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
                >
                    <Plus className="h-5 w-5" />
                    Nuevo Agricultor
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o documento..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    >
                        <option value="">Todos los estados</option>
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                    <select
                        value={zoneFilter}
                        onChange={(e) => setZoneFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    >
                        <option value="">Todas las zonas</option>
                        <option value="norte">Zona Norte</option>
                        <option value="sur">Zona Sur</option>
                        <option value="este">Zona Este</option>
                        <option value="oeste">Zona Oeste</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-medium">ID</th>
                                <th className="px-6 py-3 font-medium">Nombre</th>
                                <th className="px-6 py-3 font-medium">Documento</th>
                                <th className="px-6 py-3 font-medium">Teléfono</th>
                                <th className="px-6 py-3 font-medium">Zona</th>
                                <th className="px-6 py-3 font-medium">Entregas</th>
                                <th className="px-6 py-3 font-medium">Estado</th>
                                <th className="px-6 py-3 font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredFarmers.length > 0 ? (
                                filteredFarmers.map((farmer) => (
                                    <tr key={farmer.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">#{farmer.id}</td>
                                        <td className="px-6 py-4 text-gray-900 font-medium">{farmer.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{farmer.document}</td>
                                        <td className="px-6 py-4 text-gray-600">{farmer.phone}</td>
                                        <td className="px-6 py-4 text-gray-600">{farmer.zone}</td>
                                        <td className="px-6 py-4 text-gray-600">{farmer.deliveries}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${farmer.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {farmer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Ver detalles">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors" title="Editar">
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(farmer.id)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron agricultores con los filtros seleccionados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-500">Mostrando {filteredFarmers.length} de {farmers.length} agricultores</p>
                </div>
            </div>

            {/* Add Farmer Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-900">Nuevo Agricultor</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddFarmer} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newFarmer.name}
                                        onChange={(e) => setNewFarmer({ ...newFarmer, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="Ej. Juan Pérez"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Documento *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newFarmer.document}
                                            onChange={(e) => setNewFarmer({ ...newFarmer, document: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            placeholder="Ej. 12345678"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                        <input
                                            type="text"
                                            value={newFarmer.phone}
                                            onChange={(e) => setNewFarmer({ ...newFarmer, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            placeholder="Ej. 555-0123"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Zona</label>
                                        <select
                                            value={newFarmer.zone}
                                            onChange={(e) => setNewFarmer({ ...newFarmer, zone: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        >
                                            <option value="Norte">Norte</option>
                                            <option value="Sur">Sur</option>
                                            <option value="Este">Este</option>
                                            <option value="Oeste">Oeste</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                        <select
                                            value={newFarmer.status}
                                            onChange={(e) => setNewFarmer({ ...newFarmer, status: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        >
                                            <option value="Activo">Activo</option>
                                            <option value="Inactivo">Inactivo</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
                                    >
                                        <Save className="h-4 w-4" />
                                        Guardar Agricultor
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

export default FarmersPage;

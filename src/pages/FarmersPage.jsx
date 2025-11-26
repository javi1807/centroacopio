import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, X, Save, User, MapPin, Phone, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const FarmersPage = () => {
    const { farmers, addFarmer, deleteFarmer, updateFarmer } = useData();
    const { addToast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [newFarmer, setNewFarmer] = useState({
        name: '',
        document_type: 'DNI',
        document: '',
        phone: '',
        department: '',
        province: '',
        district: '',
        zone: 'Norte', // Keeping zone for backward compatibility or general grouping
        status: 'Activo'
    });

    const filteredFarmers = farmers.filter(farmer => {
        const matchesSearch = farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            farmer.document.includes(searchTerm);
        const matchesStatus = statusFilter ? farmer.status.toLowerCase() === statusFilter.toLowerCase() : true;

        return matchesSearch && matchesStatus;
    });

    const handleAddFarmer = async (e) => {
        e.preventDefault();
        if (!newFarmer.name || !newFarmer.document) {
            addToast('Por favor complete los campos obligatorios', 'error');
            return;
        }

        if (editingId) {
            const success = await updateFarmer(editingId, newFarmer);
            if (success) {
                addToast('Agricultor actualizado exitosamente', 'success');
            } else {
                addToast('Error al actualizar agricultor', 'error');
            }
        } else {
            addFarmer(newFarmer);
            addToast('Agricultor registrado exitosamente', 'success');
        }

        setIsModalOpen(false);
        setEditingId(null);
        resetForm();
    };

    const resetForm = () => {
        setNewFarmer({
            name: '',
            document_type: 'DNI',
            document: '',
            phone: '',
            department: '',
            province: '',
            district: '',
            zone: 'Norte',
            status: 'Activo'
        });
    };

    const handleEdit = (farmer) => {
        setNewFarmer(farmer);
        setEditingId(farmer.id);
        setIsModalOpen(true);
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
                    onClick={() => {
                        setEditingId(null);
                        resetForm();
                        setIsModalOpen(true);
                    }}
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
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-medium">Agricultor</th>
                                <th className="px-6 py-3 font-medium">Documento</th>
                                <th className="px-6 py-3 font-medium">Ubicación</th>
                                <th className="px-6 py-3 font-medium">Contacto</th>
                                <th className="px-6 py-3 font-medium">Estado</th>
                                <th className="px-6 py-3 font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredFarmers.length > 0 ? (
                                filteredFarmers.map((farmer) => (
                                    <tr key={farmer.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-bold text-gray-900">{farmer.name}</div>
                                                <div className="text-xs text-gray-500">ID: {farmer.id}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                    {farmer.document_type || 'DNI'}
                                                </span>
                                                <span className="text-gray-700">{farmer.document}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {farmer.district ? `${farmer.district}, ${farmer.province}` : farmer.zone}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{farmer.phone}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${farmer.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {farmer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(farmer)}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Editar"
                                                >
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
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron agricultores con los filtros seleccionados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Farmer Modal */}
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
                            className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                                <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Editar Agricultor' : 'Nuevo Agricultor'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddFarmer} className="p-6 space-y-6">
                                {/* Personal Information Section */}
                                <div>
                                    <h4 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <User className="h-4 w-4" /> Información Personal
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo / Razón Social *</label>
                                            <input
                                                type="text"
                                                required
                                                value={newFarmer.name}
                                                onChange={(e) => setNewFarmer({ ...newFarmer, name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                                placeholder="Ej. Juan Pérez o Cooperativa Agraria..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Documento</label>
                                            <select
                                                value={newFarmer.document_type}
                                                onChange={(e) => setNewFarmer({ ...newFarmer, document_type: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            >
                                                <option value="DNI">DNI</option>
                                                <option value="RUC">RUC</option>
                                                <option value="CE">Carnet Extranjería</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Número Documento *</label>
                                            <input
                                                type="text"
                                                required
                                                value={newFarmer.document}
                                                onChange={(e) => setNewFarmer({ ...newFarmer, document: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                                placeholder={newFarmer.document_type === 'RUC' ? '11 dígitos' : '8 dígitos'}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / Celular</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={newFarmer.phone}
                                                    onChange={(e) => setNewFarmer({ ...newFarmer, phone: e.target.value })}
                                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                                    placeholder="Ej. 999 999 999"
                                                />
                                            </div>
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
                                </div>

                                <div className="border-t border-gray-100 pt-4">
                                    <h4 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <MapPin className="h-4 w-4" /> Ubicación (Ubigeo)
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                                            <input
                                                type="text"
                                                value={newFarmer.department}
                                                onChange={(e) => setNewFarmer({ ...newFarmer, department: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                                placeholder="Ej. San Martín"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                                            <input
                                                type="text"
                                                value={newFarmer.province}
                                                onChange={(e) => setNewFarmer({ ...newFarmer, province: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                                placeholder="Ej. Tocache"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Distrito</label>
                                            <input
                                                type="text"
                                                value={newFarmer.district}
                                                onChange={(e) => setNewFarmer({ ...newFarmer, district: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                                placeholder="Ej. Pólvora"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3 justify-end border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
                                    >
                                        <Save className="h-4 w-4" />
                                        {editingId ? 'Actualizar' : 'Guardar'}
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

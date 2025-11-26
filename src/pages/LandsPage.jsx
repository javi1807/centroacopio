import React, { useState } from 'react';
import { Plus, Search, Map, Edit2, Trash2, MapPin, X, Save, Sprout, Droplets, Mountain } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const LandsPage = () => {
    const { lands, farmers, addLand, updateLand, deleteLand } = useData();
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newLand, setNewLand] = useState({
        name: '',
        farmerId: '',
        location: '',
        area: '',
        crop: 'Cacao',
        altitude: '',
        irrigation_type: 'Secano',
        cacao_variety: 'CCN-51',
        status: 'Activo'
    });

    const handleAddLand = async (e) => {
        e.preventDefault();
        const selectedFarmer = farmers.find(f => f.id === parseInt(newLand.farmerId));
        const landData = {
            ...newLand,
            farmer: selectedFarmer ? selectedFarmer.name : 'Desconocido'
        };

        if (editingId) {
            const success = await updateLand(editingId, landData);
            if (success) {
                addToast('Terreno actualizado exitosamente', 'success');
            } else {
                addToast('Error al actualizar terreno', 'error');
            }
        } else {
            addLand(landData);
            addToast('Terreno registrado exitosamente', 'success');
        }

        setIsModalOpen(false);
        setEditingId(null);
        resetForm();
    };

    const resetForm = () => {
        setNewLand({
            name: '',
            farmerId: '',
            location: '',
            area: '',
            crop: 'Cacao',
            altitude: '',
            irrigation_type: 'Secano',
            cacao_variety: 'CCN-51',
            status: 'Activo'
        });
    };

    const handleEdit = (land) => {
        setNewLand(land);
        setEditingId(land.id);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Está seguro de eliminar este terreno?')) {
            deleteLand(id);
            addToast('Terreno eliminado', 'info');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Registro de Terrenos</h1>
                    <p className="text-gray-500">Gestión de terrenos de los agricultores</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        resetForm();
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    Nuevo Terreno
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar terrenos..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lands.map(land => (
                    <div key={land.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <div className="p-3 bg-green-50 rounded-xl inline-block">
                                    <Map className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <div className="absolute top-4 right-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white border ${land.status === 'Activo' ? 'text-green-600 border-green-100' : 'text-orange-600 border-orange-100'
                                    }`}>
                                    {land.status}
                                </span>
                            </div>
                        </div>
                        <div className="p-2 pt-4">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-gray-900">{land.name}</h3>
                                <p className="text-sm text-gray-500 font-medium">{land.farmer}</p>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>{land.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Mountain className="h-4 w-4 text-gray-400" />
                                    <span>{land.altitude || '---'} msnm</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Sprout className="h-4 w-4 text-gray-400" />
                                    <span>{land.cacao_variety || 'Cacao'} · {land.area} ha</span>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleEdit(land)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <Edit2 className="h-4 w-4" /> Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(land.id)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" /> Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

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
                                <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Editar Terreno' : 'Nuevo Terreno'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddLand} className="p-6 space-y-6">
                                {/* General Info */}
                                <div>
                                    <h4 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Map className="h-4 w-4" /> Datos del Predio
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Terreno *</label>
                                            <input
                                                type="text"
                                                required
                                                value={newLand.name}
                                                onChange={(e) => setNewLand({ ...newLand, name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                                placeholder="Ej. El Roble"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Agricultor Propietario *</label>
                                            <select
                                                required
                                                value={newLand.farmerId}
                                                onChange={(e) => setNewLand({ ...newLand, farmerId: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            >
                                                <option value="">Seleccione un agricultor</option>
                                                {farmers.map(farmer => (
                                                    <option key={farmer.id} value={farmer.id}>{farmer.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación (Sector/Vereda) *</label>
                                            <input
                                                type="text"
                                                required
                                                value={newLand.location}
                                                onChange={(e) => setNewLand({ ...newLand, location: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                                placeholder="Ej. Vereda La Esperanza, Km 12"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Agronomic Details */}
                                <div className="border-t border-gray-100 pt-4">
                                    <h4 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Sprout className="h-4 w-4" /> Detalles Agronómicos
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Área (ha) *</label>
                                            <input
                                                type="number"
                                                required
                                                value={newLand.area}
                                                onChange={(e) => setNewLand({ ...newLand, area: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                                placeholder="0.0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Altitud (msnm)</label>
                                            <input
                                                type="number"
                                                value={newLand.altitude}
                                                onChange={(e) => setNewLand({ ...newLand, altitude: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                                placeholder="Ej. 800"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Riego</label>
                                            <select
                                                value={newLand.irrigation_type}
                                                onChange={(e) => setNewLand({ ...newLand, irrigation_type: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            >
                                                <option value="Secano">Secano (Lluvia)</option>
                                                <option value="Goteo">Goteo</option>
                                                <option value="Gravedad">Gravedad</option>
                                                <option value="Aspersión">Aspersión</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Variedad Cacao</label>
                                            <input
                                                type="text"
                                                value={newLand.cacao_variety}
                                                onChange={(e) => setNewLand({ ...newLand, cacao_variety: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                                placeholder="Ej. CCN-51, Criollo"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                            <select
                                                value={newLand.status}
                                                onChange={(e) => setNewLand({ ...newLand, status: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            >
                                                <option value="Activo">Activo</option>
                                                <option value="Descanso">En Descanso</option>
                                                <option value="Inactivo">Inactivo</option>
                                            </select>
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

export default LandsPage;

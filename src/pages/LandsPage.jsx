import React, { useState } from 'react';
import { Plus, Search, Map, Edit2, Trash2, MapPin, X, Save } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const LandsPage = () => {
    const { lands, farmers, addLand } = useData();
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newLand, setNewLand] = useState({ name: '', farmerId: '', location: '', area: '', crop: 'Cacao', status: 'Activo' });

    const handleAddLand = (e) => {
        e.preventDefault();
        const selectedFarmer = farmers.find(f => f.id === parseInt(newLand.farmerId));

        addLand({
            ...newLand,
            farmer: selectedFarmer ? selectedFarmer.name : 'Desconocido'
        });

        addToast('Terreno registrado exitosamente', 'success');
        setIsModalOpen(false);
        setNewLand({ name: '', farmerId: '', location: '', area: '', crop: 'Cacao', status: 'Activo' });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Registro de Terrenos</h1>
                    <p className="text-gray-500">Gestión de terrenos de los agricultores</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
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
                    <div key={land.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Map className="h-16 w-16 text-green-100" />
                            </div>
                            <div className="absolute top-4 right-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white ${land.status === 'Activo' ? 'text-green-600' : 'text-orange-600'
                                    }`}>
                                    {land.status}
                                </span>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{land.name}</h3>
                                    <p className="text-sm text-gray-500">{land.farmer}</p>
                                </div>
                                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                    <MapPin className="h-5 w-5" />
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Ubicación:</span>
                                    <span className="font-medium text-gray-900">{land.location}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Área:</span>
                                    <span className="font-medium text-gray-900">{land.area} ha</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Cultivo:</span>
                                    <span className="font-medium text-gray-900">{land.crop}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                    <Edit2 className="h-4 w-4" /> Editar
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
                            className="relative bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-900">Nuevo Terreno</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddLand} className="p-6 space-y-4">
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newLand.location}
                                        onChange={(e) => setNewLand({ ...newLand, location: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="Ej. Vereda La Esperanza"
                                    />
                                </div>

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
                                        Guardar Terreno
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

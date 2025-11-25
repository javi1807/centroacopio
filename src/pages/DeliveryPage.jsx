import React, { useState } from 'react';
import { Truck, Package, Scale, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const DeliveryPage = () => {
    const { farmers, addDelivery } = useData();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        farmerId: '',
        product: 'Cacao',
        weight: '',
        date: new Date().toISOString().slice(0, 16), // Current date-time for input
        notes: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.farmerId || !formData.weight) {
            addToast('Por favor complete todos los campos obligatorios', 'error');
            return;
        }

        addDelivery(formData);
        addToast('Entrega registrada exitosamente', 'success');
        navigate('/dashboard');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Nueva Entrega</h1>
                <p className="text-gray-500">Registro de nuevas entregas de productos</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4 relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-1 bg-green-100 -z-10"></div>

                        <div className="flex flex-col items-center gap-2 bg-white px-2">
                            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold shadow-lg shadow-green-200">1</div>
                            <span className="font-bold text-sm text-gray-900">Datos de Entrega</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 bg-white px-2 opacity-50">
                            <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold border border-gray-200">2</div>
                            <span className="font-medium text-sm text-gray-500">Control de Calidad</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 bg-white px-2 opacity-50">
                            <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold border border-gray-200">3</div>
                            <span className="font-medium text-sm text-gray-500">Almacenamiento</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    <Truck className="inline h-4 w-4 mr-2 text-green-600" />
                                    Agricultor *
                                </label>
                                <select
                                    value={formData.farmerId}
                                    onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-gray-50 focus:bg-white transition-all"
                                    required
                                >
                                    <option value="">Seleccione un agricultor</option>
                                    {farmers.map(farmer => (
                                        <option key={farmer.id} value={farmer.id}>{farmer.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    <Scale className="inline h-4 w-4 mr-2 text-blue-600" />
                                    Peso (kg) *
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.weight}
                                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                        className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-gray-50 focus:bg-white transition-all font-mono text-lg"
                                        placeholder="0.00"
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">kg</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    <Calendar className="inline h-4 w-4 mr-2 text-purple-600" />
                                    Fecha de Entrega *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-gray-50 focus:bg-white transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Observaciones</label>
                        <textarea
                            rows="3"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-gray-50 focus:bg-white transition-all resize-none"
                            placeholder="Observaciones adicionales sobre la entrega..."
                        ></textarea>
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 hover:shadow-green-300 flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="h-5 w-5" />
                            Registrar Entrega
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeliveryPage;

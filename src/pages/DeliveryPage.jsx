import React, { useState } from 'react';
import { Truck, Package, Scale, Calendar, CheckCircle, AlertCircle, ArrowRight, DollarSign } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import ProcessSteps from '../components/ui/ProcessSteps';

const DeliveryPage = () => {
    const { farmers, lands, addDelivery } = useData();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        farmerId: '',
        landId: '',
        product: 'Cacao',
        product_state: 'seco',
        weight: '',
        date: new Date().toISOString().slice(0, 16), // Current date-time for input
        notes: ''
    });

    const [showSuccess, setShowSuccess] = useState(false);
    const [lastDeliveryId, setLastDeliveryId] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.farmerId || !formData.weight || !formData.landId) {
            addToast('Por favor complete todos los campos obligatorios', 'error');
            return;
        }

        // Find farmer name
        const selectedFarmer = farmers.find(f => f.id === parseInt(formData.farmerId));
        const deliveryData = {
            ...formData,
            farmer: selectedFarmer ? selectedFarmer.name : 'Desconocido'
        };

        const result = await addDelivery(deliveryData);
        if (result) {
            setLastDeliveryId(result.id);
            setShowSuccess(true);
            addToast('Entrega registrada exitosamente', 'success');
        }
    };

    const handleReset = () => {
        setFormData({
            farmerId: '',
            landId: '',
            product: 'Cacao',
            product_state: 'seco',
            weight: '',
            date: new Date().toISOString().slice(0, 16),
            notes: ''
        });
        setShowSuccess(false);
    };

    // Calculate dry weight equivalent for wet cocoa
    const weightDryEquivalent = formData.product_state === 'baba'
        ? (parseFloat(formData.weight) * 0.38).toFixed(2)
        : formData.weight;

    if (showSuccess) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Entrega Registrada!</h2>
                    <p className="text-gray-500 mb-8">
                        La entrega <span className="font-mono font-bold text-gray-900">{lastDeliveryId}</span> ha sido ingresada al sistema correctamente.
                    </p>


                    <div className="space-y-3">
                        <button
                            onClick={() => navigate(`/dashboard/quality?id=${lastDeliveryId}`)}
                            className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                        >
                            Ir a Control de Calidad <ArrowRight className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleReset}
                            className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                        >
                            Registrar Nueva Entrega
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Nueva Entrega</h1>
                <p className="text-gray-500">Registro de nuevas entregas de productos</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Progress Steps */}
                <div className="lg:col-span-3">
                    <ProcessSteps currentStep={1} />
                </div>

                {/* Main Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
                        <div className="border-b border-gray-100 pb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-1">
                                <Truck className="h-5 w-5 text-green-600" />
                                Información del Proveedor
                            </h3>
                            <p className="text-sm text-gray-500">Seleccione el agricultor que realiza la entrega</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
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
                        </div>

                        {formData.farmerId && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Parcela / Terreno *
                                </label>
                                <select
                                    value={formData.landId}
                                    onChange={(e) => setFormData({ ...formData, landId: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-gray-50 focus:bg-white transition-all"
                                    required
                                >
                                    <option value="">Seleccione una parcela</option>
                                    {lands.filter(l => l.farmerId === parseInt(formData.farmerId)).map(land => (
                                        <option key={land.id} value={land.id}>{land.name} - {land.location}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="border-b border-gray-100 pb-6 pt-2">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-1">
                                <Package className="h-5 w-5 text-blue-600" />
                                Detalles del Producto
                            </h3>
                            <p className="text-sm text-gray-500">Especifique el peso y fecha de la entrega</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Estado del Producto *
                            </label>
                            <select
                                value={formData.product_state}
                                onChange={(e) => setFormData({ ...formData, product_state: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-gray-50 focus:bg-white transition-all"
                            >
                                <option value="seco">Cacao Seco (Fermentado y Secado)</option>
                                <option value="baba">Cacao en Baba (Fresco con Pulpa)</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Peso {formData.product_state === 'baba' ? 'en Baba' : 'Seco'} (kg) *
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
                                {formData.product_state === 'baba' && formData.weight && (
                                    <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <span className="text-blue-700 text-sm font-medium">
                                            💡 Equivalente en seco: <strong>{weightDryEquivalent} kg</strong>
                                            <span className="text-xs ml-1">(Factor: 0.38)</span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
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

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Observaciones</label>
                            <textarea
                                rows="3"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-gray-50 focus:bg-white transition-all resize-none"
                                placeholder="Observaciones adicionales..."
                            ></textarea>
                        </div>

                        <div className="flex gap-4 pt-4">
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

                {/* Info / Help Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-6 w-6 text-blue-600 shrink-0" />
                            <div>
                                <h4 className="font-bold text-blue-900 mb-1">Procedimiento</h4>
                                <p className="text-sm text-blue-800 leading-relaxed">
                                    Recuerde verificar el peso en la báscula antes de registrar. El proceso de calidad se realizará inmediatamente después.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h4 className="font-bold text-gray-900 mb-4">Resumen Reciente</h4>
                        <div className="space-y-4">
                            {/* Placeholder for recent activity */}
                            <div className="text-sm text-gray-500 text-center py-4">
                                Las últimas entregas aparecerán aquí
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default DeliveryPage;

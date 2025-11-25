import React from 'react';
import { ClipboardCheck, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const QualityControlPage = () => {
    const pendingReviews = [
        { id: '#4590', farmer: 'Pedro Sánchez', product: 'Maíz', weight: '150 kg', date: 'Hace 30 min' },
        { id: '#4591', farmer: 'Ana Martínez', product: 'Frijol', weight: '80 kg', date: 'Hace 45 min' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Control de Calidad</h1>
                <p className="text-gray-500">Evaluación de calidad de productos entregados</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Reviews List */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-bold text-gray-900">Pendientes de Evaluación</h3>
                    {pendingReviews.map((review) => (
                        <div key={review.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-green-500 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-gray-900">{review.id}</span>
                                <span className="text-xs text-gray-500">{review.date}</span>
                            </div>
                            <p className="text-sm font-medium text-gray-800">{review.farmer}</p>
                            <p className="text-sm text-gray-500">{review.product} · {review.weight}</p>
                            <button className="mt-3 w-full py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100">
                                Evaluar
                            </button>
                        </div>
                    ))}
                </div>

                {/* Evaluation Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <ClipboardCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Evaluación en Curso</h3>
                                <p className="text-sm text-gray-500">Entrega #4590 - Maíz</p>
                            </div>
                        </div>

                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Humedad (%)</label>
                                    <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="0.0" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Impurezas (%)</label>
                                    <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="0.0" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Granos Dañados (%)</label>
                                    <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="0.0" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                                        <option>Seleccione...</option>
                                        <option>Premium</option>
                                        <option>Estándar</option>
                                        <option>Básica</option>
                                        <option>Rechazado</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                                <textarea rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"></textarea>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" className="flex-1 py-3 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 flex items-center justify-center gap-2">
                                    <XCircle className="h-5 w-5" /> Rechazar
                                </button>
                                <button type="submit" className="flex-[2] py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                                    <CheckCircle className="h-5 w-5" /> Aprobar Calidad
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QualityControlPage;

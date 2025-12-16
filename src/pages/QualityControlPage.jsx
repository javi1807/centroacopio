import React, { useState, useEffect } from 'react';
import { ClipboardCheck, CheckCircle, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProcessSteps from '../components/ui/ProcessSteps';

const QualityControlPage = () => {
    const { deliveries, updateDelivery, prices } = useData();
    const { addToast } = useToast();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [processedId, setProcessedId] = useState(null);

    const [formData, setFormData] = useState({
        humidity: '',
        impurities: '',
        damaged: '',
        rating: '',
        notes: ''
    });

    const [calculatedPayment, setCalculatedPayment] = useState({
        price: 0,
        total: 0,
        netWeight: 0,
        discountImpurity: 0,
        discountHumidity: 0,
        penaltyDamage: 0,
        dryMatterWeight: 0,
        excessHumidity: 0
    });

    useEffect(() => {
        if (formData.rating && selectedDelivery && prices.length > 0) {
            const basePriceObj = prices.find(p => p.quality === formData.rating);
            const basePrice = basePriceObj ? basePriceObj.price : 0;
            const grossWeight = parseFloat(selectedDelivery.weight);

            // 1. Calculate Net Weight
            // Impurities: Direct percentage deduction
            const impurity = parseFloat(formData.impurities) || 0;
            const discountImpurity = grossWeight * (impurity / 100);

            // Humidity: ICCO Method - Adjust weight to standard moisture content (7.5%)
            const humidity = parseFloat(formData.humidity) || 0;
            const standardMoisture = 7.5;
            let adjustedWeight = grossWeight;
            let discountHumidity = 0;
            let dryMatterWeight = grossWeight;

            if (humidity > standardMoisture) {
                // Calculate dry matter weight (weight without water)
                dryMatterWeight = grossWeight * (1 - humidity / 100);

                // Calculate adjusted weight at standard moisture (7.5%)
                adjustedWeight = dryMatterWeight / (1 - standardMoisture / 100);

                // Discount is the difference
                discountHumidity = grossWeight - adjustedWeight;
            }

            const netWeight = adjustedWeight - discountImpurity;

            // 2. Calculate Final Price
            // Damaged: Penalty if > 2% (e.g., 5% of price per 1% excess damage)
            const damaged = parseFloat(formData.damaged) || 0;
            const excessDamage = Math.max(0, damaged - 2);
            const penaltyDamage = basePrice * (excessDamage * 0.05);
            const finalPrice = Math.max(0, basePrice - penaltyDamage);

            const total = (finalPrice * netWeight).toFixed(2);

            setCalculatedPayment({
                price: finalPrice,
                total,
                netWeight,
                discountImpurity,
                discountHumidity,
                penaltyDamage,
                dryMatterWeight,
                excessHumidity: Math.max(0, humidity - standardMoisture)
            });
        } else {
            setCalculatedPayment({
                price: 0, total: 0, netWeight: 0,
                discountImpurity: 0, discountHumidity: 0, penaltyDamage: 0,
                dryMatterWeight: 0, excessHumidity: 0
            });
        }
    }, [formData, selectedDelivery, prices]);

    // Filter deliveries that need quality control
    const pendingReviews = deliveries.filter(d => d.status === 'Pendiente' || d.status === 'En Calidad');

    // Auto-select from URL
    useEffect(() => {
        const idFromUrl = searchParams.get('id');
        if (idFromUrl && deliveries.length > 0) {
            const delivery = deliveries.find(d => d.id === idFromUrl);
            if (delivery && (delivery.status === 'Pendiente' || delivery.status === 'En Calidad')) {
                handleSelect(delivery);
            }
        }
    }, [searchParams, deliveries]);

    const handleSelect = (delivery) => {
        setSelectedDelivery(delivery);
        setFormData({
            humidity: '',
            impurities: '',
            damaged: '',
            rating: '',
            notes: ''
        });
    };

    const handleCloseModal = () => {
        setSelectedDelivery(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (status) => {
        if (!selectedDelivery) return;

        const qualityNotes = `
Calidad: ${formData.rating}
Humedad: ${formData.humidity}% ${formData.humidity && parseFloat(formData.humidity) > 7.5 ? `(Exceso: ${(parseFloat(formData.humidity) - 7.5).toFixed(2)}% - Método ICCO)` : '(Dentro de estándar)'}
Impurezas: ${formData.impurities}%
Daños: ${formData.damaged}%
Método descuento: Ajuste a materia seca (ICCO)
Notas: ${formData.notes}
        `.trim();

        const success = await updateDelivery(selectedDelivery.id, {
            status: status,
            notes: qualityNotes,
            price_per_kg: calculatedPayment.price,
            total_payment: calculatedPayment.total
        });

        if (success) {
            if (status === 'Completado') {
                setProcessedId(selectedDelivery.id);
                setShowSuccess(true);
                addToast('Calidad aprobada correctamente', 'success');
            } else {
                addToast('Lote rechazado', 'error');
            }
            setSelectedDelivery(null);
            setFormData({ humidity: '', impurities: '', damaged: '', rating: '', notes: '' });
        } else {
            addToast('Error al actualizar la entrega', 'error');
        }
    };

    if (showSuccess) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Calidad Aprobada!</h2>
                    <p className="text-gray-500 mb-8">
                        El lote <span className="font-mono font-bold text-gray-900">{processedId}</span> ha pasado el control de calidad.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate(`/dashboard/storage?id=${processedId}`)}
                            className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                        >
                            Ir a Almacenamiento <ArrowRight className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                        >
                            Volver a Lista
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Control de Calidad</h1>
                <p className="text-gray-500">Evaluación de calidad de productos entregados</p>
            </div>

            <ProcessSteps currentStep={2} />

            {/* Pending Reviews Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Pendientes de Evaluación ({pendingReviews.length})</h3>
                </div>

                {pendingReviews.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">ID Entrega</th>
                                    <th className="px-6 py-4">Fecha/Hora</th>
                                    <th className="px-6 py-4">Agricultor</th>
                                    <th className="px-6 py-4">Producto</th>
                                    <th className="px-6 py-4">Peso</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pendingReviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-medium text-gray-900">{review.id}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(review.date).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(review.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-800">{review.farmer}</td>
                                        <td className="px-6 py-4 text-gray-600">{review.product}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">{review.weight} kg</span>
                                            {review.product_state === 'baba' && (
                                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Baba</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                {review.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleSelect(review)}
                                                className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm shadow-green-200"
                                            >
                                                Evaluar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-lg font-medium text-gray-900">No hay entregas pendientes</p>
                        <p className="text-sm">Todas las entregas han sido evaluadas.</p>
                    </div>
                )}
            </div>

            {/* Evaluation Modal */}
            {selectedDelivery && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <ClipboardCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Evaluación de Calidad</h3>
                                    <p className="text-sm text-gray-500">Entrega <span className="font-mono font-medium">{selectedDelivery.id}</span> - {selectedDelivery.product}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 md:p-8">
                            {selectedDelivery.product_state === 'baba' && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
                                    <div className="text-2xl">ℹ️</div>
                                    <div>
                                        <p className="text-sm text-blue-900 font-bold">
                                            Entrega en baba
                                        </p>
                                        <p className="text-sm text-blue-800 mt-1">
                                            Peso fresco: <strong>{selectedDelivery.weight_fresh} kg</strong> <br />
                                            Convertido a seco: <strong>{selectedDelivery.weight} kg</strong> (Factor: {selectedDelivery.conversion_factor})
                                        </p>
                                        <p className="text-xs text-blue-600 mt-2 font-medium">
                                            * El control de calidad se aplica al peso seco equivalente.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <form className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h4 className="font-bold text-gray-900 border-b pb-2">Parámetros de Calidad</h4>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Humedad (%)
                                                <span className="text-xs text-gray-500 font-normal ml-1">(Estándar: {'<'}7.5%)</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="humidity"
                                                    value={formData.humidity}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                                    placeholder="0.0"
                                                    step="0.1"
                                                />
                                                <span className="absolute right-4 top-3.5 text-gray-400 text-sm">%</span>
                                            </div>
                                            {formData.humidity && parseFloat(formData.humidity) > 12 && (
                                                <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700 font-medium flex gap-2 items-center">
                                                    <AlertTriangle className="h-4 w-4" /> Riesgo de moho y deterioro.
                                                </div>
                                            )}
                                            {formData.humidity && parseFloat(formData.humidity) > 7.5 && parseFloat(formData.humidity) <= 12 && (
                                                <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-700 font-medium flex gap-2 items-center">
                                                    <AlertTriangle className="h-4 w-4" /> Se aplicará descuento por exceso.
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Impurezas (%)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="impurities"
                                                    value={formData.impurities}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                                    placeholder="0.0"
                                                />
                                                <span className="absolute right-4 top-3.5 text-gray-400 text-sm">%</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Granos Dañados (%)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="damaged"
                                                    value={formData.damaged}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                                    placeholder="0.0"
                                                />
                                                <span className="absolute right-4 top-3.5 text-gray-400 text-sm">%</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Calificación Global</label>
                                            <select
                                                name="rating"
                                                value={formData.rating}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all bg-white"
                                            >
                                                <option value="">Seleccione calidad...</option>
                                                {prices
                                                    .sort((a, b) => b.price - a.price)
                                                    .map(priceLevel => (
                                                        <option key={priceLevel.id} value={priceLevel.quality}>
                                                            {priceLevel.quality} - S/ {priceLevel.price.toFixed(2)}/kg
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="font-bold text-gray-900 border-b pb-2">Resultado Financiero</h4>

                                        {formData.rating ? (
                                            <div className="bg-green-50 rounded-2xl p-6 border border-green-100 h-full">
                                                <h4 className="font-bold text-green-900 mb-6 flex items-center gap-2">
                                                    <span className="text-2xl">💰</span> Cálculo Justo (ICCO)
                                                </h4>
                                                <div className="space-y-4 text-sm">
                                                    <div className="flex justify-between text-gray-600">
                                                        <span>Peso Bruto:</span>
                                                        <span className="font-medium text-gray-900">{selectedDelivery.weight} kg</span>
                                                    </div>

                                                    {formData.humidity && parseFloat(formData.humidity) > 7.5 && (
                                                        <div className="pl-3 border-l-2 border-red-200 space-y-1">
                                                            <div className="flex justify-between text-gray-500 text-xs">
                                                                <span>Materia Seca ({(100 - parseFloat(formData.humidity)).toFixed(1)}%):</span>
                                                                <span>{calculatedPayment.dryMatterWeight.toFixed(2)} kg</span>
                                                            </div>
                                                            <div className="flex justify-between text-red-600 font-medium">
                                                                <span>- Ajuste Humedad ({calculatedPayment.excessHumidity.toFixed(2)}% exc):</span>
                                                                <span>- {calculatedPayment.discountHumidity.toFixed(2)} kg</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {parseFloat(formData.impurities) > 0 && (
                                                        <div className="flex justify-between text-red-600 font-medium">
                                                            <span>- Descuento Impurezas ({formData.impurities}%):</span>
                                                            <span>- {calculatedPayment.discountImpurity.toFixed(2)} kg</span>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between font-bold text-gray-900 border-t border-green-200 pt-3">
                                                        <span>Peso Neto a Pagar:</span>
                                                        <span className="text-lg">{calculatedPayment.netWeight.toFixed(2)} kg</span>
                                                    </div>

                                                    <div className="flex justify-between text-gray-600 mt-4">
                                                        <span>Precio Base ({formData.rating}):</span>
                                                        <span className="font-semibold text-green-700">
                                                            S/ {prices.find(p => p.quality === formData.rating)?.price.toFixed(2) || '0.00'}/kg
                                                        </span>
                                                    </div>

                                                    {calculatedPayment.penaltyDamage > 0 && (
                                                        <div className="flex justify-between text-red-600 font-medium">
                                                            <span>- Penalidad Daños ({'>'}2%):</span>
                                                            <span>- S/ {calculatedPayment.penaltyDamage.toFixed(2)}</span>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-green-200 mt-4 shadow-sm">
                                                        <span className="font-bold text-green-800">TOTAL A PAGAR</span>
                                                        <span className="text-3xl font-bold text-green-600">S/ {calculatedPayment.total}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 border-dashed h-full flex flex-col items-center justify-center text-center text-gray-400">
                                                <div className="text-4xl mb-2">🧮</div>
                                                <p>Ingrese los datos de calidad y seleccione una calificación para ver el cálculo.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones Adicionales</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                        placeholder="Notas sobre el estado del saco, olor, color, etc..."
                                    ></textarea>
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit('Rechazado')}
                                        className="flex-1 py-4 bg-red-50 text-red-700 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="h-5 w-5" /> Rechazar Lote
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit('Completado')}
                                        className="flex-[2] py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="h-5 w-5" /> Aprobar Calidad y Pagar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QualityControlPage;

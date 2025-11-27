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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Reviews List */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-bold text-gray-900">Pendientes de Evaluación ({pendingReviews.length})</h3>
                    {pendingReviews.length > 0 ? (
                        pendingReviews.map((review) => (
                            <div
                                key={review.id}
                                onClick={() => handleSelect(review)}
                                className={`p-4 rounded-xl shadow-sm border cursor-pointer transition-all ${selectedDelivery?.id === review.id
                                    ? 'bg-green-50 border-green-500 ring-1 ring-green-500'
                                    : 'bg-white border-gray-100 hover:border-green-300'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-gray-900">{review.id}</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(review.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-800">{review.farmer}</p>
                                <p className="text-sm text-gray-500">{review.product} · {review.weight} kg</p>
                                <button className="mt-3 w-full py-2 bg-white border border-green-200 text-green-700 text-sm font-medium rounded-lg hover:bg-green-50">
                                    Evaluar
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
                            <CheckCircle className="h-10 w-10 text-green-200 mx-auto mb-3" />
                            <p>No hay entregas pendientes</p>
                        </div>
                    )}
                </div>

                {/* Evaluation Form */}
                <div className="lg:col-span-2">
                    {selectedDelivery ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            {selectedDelivery.product_state === 'baba' && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-blue-800 font-medium">
                                        ℹ️ <strong>Entrega en baba:</strong> {selectedDelivery.weight_fresh} kg frescos
                                        convertidos a {selectedDelivery.weight} kg seco (Factor: {selectedDelivery.conversion_factor})
                                    </p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        El control de calidad se aplica al peso seco equivalente.
                                    </p>
                                </div>
                            )}
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <ClipboardCheck className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Evaluación en Curso</h3>
                                    <p className="text-sm text-gray-500">Entrega {selectedDelivery.id} - {selectedDelivery.product}</p>
                                </div>
                            </div>

                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Humedad (%)
                                            <span className="text-xs text-gray-500 font-normal ml-1">(Estándar: {'<'}7.5%)</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="humidity"
                                            value={formData.humidity}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            placeholder="0.0"
                                            step="0.1"
                                        />
                                        {formData.humidity && parseFloat(formData.humidity) > 12 && (
                                            <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2">
                                                <span className="text-red-700 text-xs font-medium">
                                                    ⚠️ ALERTA: Humedad muy alta ({formData.humidity}%). Riesgo de moho y deterioro.
                                                </span>
                                            </div>
                                        )}
                                        {formData.humidity && parseFloat(formData.humidity) > 7.5 && parseFloat(formData.humidity) <= 12 && (
                                            <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                                                <span className="text-yellow-700 text-xs font-medium">
                                                    ⚠️ Por encima del estándar. Se aplicará descuento por exceso de humedad.
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Impurezas (%)</label>
                                        <input
                                            type="number"
                                            name="impurities"
                                            value={formData.impurities}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            placeholder="0.0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Granos Dañados (%)</label>
                                        <input
                                            type="number"
                                            name="damaged"
                                            value={formData.damaged}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            placeholder="0.0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
                                        <select
                                            name="rating"
                                            value={formData.rating}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        >
                                            <option value="">Seleccione...</option>
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

                                {formData.rating && (
                                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                        <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                                            <span className="text-xl">💰</span> Cálculo Justo de Pago (Método ICCO)
                                        </h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between text-gray-600">
                                                <span>Peso Bruto:</span>
                                                <span className="font-medium">{selectedDelivery.weight} kg</span>
                                            </div>

                                            {formData.humidity && parseFloat(formData.humidity) > 7.5 && (
                                                <>
                                                    <div className="flex justify-between text-blue-600 text-xs italic">
                                                        <span>Materia Seca ({(100 - parseFloat(formData.humidity)).toFixed(1)}%):</span>
                                                        <span>{calculatedPayment.dryMatterWeight.toFixed(2)} kg</span>
                                                    </div>
                                                    <div className="flex justify-between text-red-500">
                                                        <span>- Ajuste Humedad a 7.5% (exceso {calculatedPayment.excessHumidity.toFixed(2)}%):</span>
                                                        <span>- {calculatedPayment.discountHumidity.toFixed(2)} kg</span>
                                                    </div>
                                                </>
                                            )}

                                            <div className="flex justify-between text-red-500">
                                                <span>- Descuento Impurezas ({formData.impurities}%):</span>
                                                <span>- {calculatedPayment.discountImpurity.toFixed(2)} kg</span>
                                            </div>

                                            <div className="flex justify-between font-bold text-gray-900 border-t border-green-200 pt-2">
                                                <span>Peso Neto a Pagar:</span>
                                                <span>{calculatedPayment.netWeight.toFixed(2)} kg</span>
                                            </div>

                                            <div className="flex justify-between text-gray-600 mt-2">
                                                <span>Precio Base ({formData.rating}):</span>
                                                <span className="font-semibold text-green-700">
                                                    S/ {prices.find(p => p.quality === formData.rating)?.price.toFixed(2) || '0.00'}/kg
                                                </span>
                                            </div>
                                            {calculatedPayment.penaltyDamage > 0 && (
                                                <div className="flex justify-between text-red-500">
                                                    <span>- Penalidad Daños ({'>'}2%):</span>
                                                    <span>- S/ {calculatedPayment.penaltyDamage.toFixed(2)}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-green-200 mt-2">
                                                <span className="font-bold text-green-800">TOTAL A PAGAR</span>
                                                <span className="text-2xl font-bold text-green-600">S/ {calculatedPayment.total}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    ></textarea>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit('Rechazado')}
                                        className="flex-1 py-3 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="h-5 w-5" /> Rechazar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit('Completado')}
                                        className="flex-[2] py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="h-5 w-5" /> Aprobar Calidad
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-xl border border-gray-200 border-dashed p-12 flex flex-col items-center justify-center text-gray-400 h-full min-h-[400px]">
                            <ClipboardCheck className="h-16 w-16 mb-4 opacity-50" />
                            <p className="text-lg font-medium">Seleccione una entrega para evaluar</p>
                            <p className="text-sm">Haga clic en un elemento de la lista izquierda</p>
                        </div>
                    )
                    }
                </div >
            </div >
        </div >
    );
};

export default QualityControlPage;

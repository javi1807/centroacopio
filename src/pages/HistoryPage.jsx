import React from 'react';
import { History, FileText, Download, Filter } from 'lucide-react';

const HistoryPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Historial de Acopio</h1>
                    <p className="text-gray-500">Registro histórico de todas las operaciones</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                        <Filter className="h-4 w-4" /> Filtros
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <Download className="h-4 w-4" /> Exportar
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-3 font-medium">Fecha</th>
                                <th className="px-6 py-3 font-medium">Operación</th>
                                <th className="px-6 py-3 font-medium">Agricultor</th>
                                <th className="px-6 py-3 font-medium">Producto</th>
                                <th className="px-6 py-3 font-medium">Detalle</th>
                                <th className="px-6 py-3 font-medium">Usuario</th>
                                <th className="px-6 py-3 font-medium">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[
                                { date: '25/11/2024 10:30', op: 'Recepción', farmer: 'Juan Pérez', prod: 'Maíz', detail: '150 kg', user: 'Admin', status: 'Completado' },
                                { date: '25/11/2024 09:15', op: 'Control Calidad', farmer: 'María García', prod: 'Frijol', detail: 'Aprobado (Premium)', user: 'J. Calidad', status: 'Completado' },
                                { date: '24/11/2024 16:45', op: 'Almacenamiento', farmer: 'Pedro Sánchez', prod: 'Arroz', detail: 'Ubicación A-12', user: 'M. Almacén', status: 'Completado' },
                                { date: '24/11/2024 14:20', op: 'Recepción', farmer: 'Ana Martínez', prod: 'Café', detail: '45 kg', user: 'Admin', status: 'Rechazado' },
                                { date: '23/11/2024 11:00', op: 'Salida', farmer: '-', prod: 'Maíz', detail: 'Venta Lote #402', user: 'Admin', status: 'Completado' },
                            ].map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-500">{row.date}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{row.op}</td>
                                    <td className="px-6 py-4 text-gray-600">{row.farmer}</td>
                                    <td className="px-6 py-4 text-gray-600">{row.prod}</td>
                                    <td className="px-6 py-4 text-gray-600">{row.detail}</td>
                                    <td className="px-6 py-4 text-gray-500">{row.user}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.status === 'Completado' ? 'bg-green-100 text-green-800' :
                                                row.status === 'Rechazado' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;

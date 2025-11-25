import React from 'react';
import { Warehouse, Package, ArrowRight } from 'lucide-react';

const StoragePage = () => {
    const warehouses = [
        { name: 'Almacén A', capacity: 5000, used: 3200, type: 'Granos Básicos' },
        { name: 'Almacén B', capacity: 3000, used: 1500, type: 'Café y Cacao' },
        { name: 'Silo Principal', capacity: 10000, used: 8500, type: 'Maíz a Granel' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Almacenamiento</h1>
                <p className="text-gray-500">Gestión de inventarios y ubicaciones</p>
            </div>

            {/* Warehouse Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {warehouses.map((wh, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                <Warehouse className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">{wh.type}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{wh.name}</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Ocupación</span>
                                <span>{Math.round((wh.used / wh.capacity) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${(wh.used / wh.capacity) > 0.8 ? 'bg-red-500' : 'bg-blue-500'
                                        }`}
                                    style={{ width: `${(wh.used / wh.capacity) * 100}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{wh.used} kg</span>
                                <span>{wh.capacity} kg Total</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Inventario Actual</h3>
                    <button className="text-sm text-green-600 font-medium hover:text-green-700">Descargar Reporte</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-3 font-medium">Lote</th>
                                <th className="px-6 py-3 font-medium">Producto</th>
                                <th className="px-6 py-3 font-medium">Ubicación</th>
                                <th className="px-6 py-3 font-medium">Cantidad</th>
                                <th className="px-6 py-3 font-medium">Fecha Ingreso</th>
                                <th className="px-6 py-3 font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[
                                { batch: 'L-2024-001', product: 'Maíz Blanco', loc: 'Almacén A - Sec 1', qty: '1,500 kg', date: '20 Nov 2024' },
                                { batch: 'L-2024-002', product: 'Frijol Rojo', loc: 'Almacén A - Sec 2', qty: '800 kg', date: '21 Nov 2024' },
                                { batch: 'L-2024-003', product: 'Café Pergamino', loc: 'Almacén B - Sec 1', qty: '2,100 kg', date: '22 Nov 2024' },
                                { batch: 'L-2024-004', product: 'Maíz Amarillo', loc: 'Silo Principal', qty: '5,000 kg', date: '23 Nov 2024' },
                            ].map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.batch}</td>
                                    <td className="px-6 py-4 text-gray-600">{item.product}</td>
                                    <td className="px-6 py-4 text-gray-600">{item.loc}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.qty}</td>
                                    <td className="px-6 py-4 text-gray-500">{item.date}</td>
                                    <td className="px-6 py-4">
                                        <button className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                                            Ver <ArrowRight className="h-3 w-3" />
                                        </button>
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

export default StoragePage;

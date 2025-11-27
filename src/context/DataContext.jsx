import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [farmers, setFarmers] = useState([]);
    const [lands, setLands] = useState([]);
    const [deliveries, setDeliveries] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [prices, setPrices] = useState([]);
    const [payments, setPayments] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [farmersRes, landsRes, deliveriesRes, warehousesRes, pricesRes, paymentsRes, productsRes] = await Promise.all([
                    fetch('http://localhost:3001/api/farmers'),
                    fetch('http://localhost:3001/api/lands'),
                    fetch('http://localhost:3001/api/deliveries'),
                    fetch('http://localhost:3001/api/warehouses'),
                    fetch('http://localhost:3001/api/prices'),
                    fetch('http://localhost:3001/api/payments'),
                    fetch('http://localhost:3001/api/products')
                ]);

                const farmersData = await farmersRes.json();
                const landsData = await landsRes.json();
                const deliveriesData = await deliveriesRes.json();
                const warehousesData = await warehousesRes.json();
                const pricesData = await pricesRes.json();
                const paymentsData = await paymentsRes.json();
                const productsData = await productsRes.json();

                setFarmers(farmersData.data || []);
                setLands(landsData.data || []);
                setDeliveries(deliveriesData.data || []);
                setWarehouses(warehousesData.data || []);
                setPrices(pricesData.data || []);
                setPayments(paymentsData.data || []);
                setProducts(productsData.data || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Actions
    const addFarmer = async (farmer) => {
        try {
            const res = await fetch('http://localhost:3001/api/farmers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(farmer)
            });
            const data = await res.json();
            if (data.data) {
                setFarmers([...farmers, data.data]);
                return data.data;
            }
        } catch (error) {
            console.error("Error adding farmer:", error);
        }
    };

    const deleteFarmer = async (id) => {
        try {
            await fetch(`http://localhost:3001/api/farmers/${id}`, { method: 'DELETE' });
            setFarmers(farmers.filter(f => f.id !== id));
        } catch (error) {
            console.error("Error deleting farmer:", error);
        }
    };

    const addLand = async (land) => {
        try {
            const res = await fetch('http://localhost:3001/api/lands', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(land)
            });
            const data = await res.json();
            if (data.data) {
                setLands([...lands, data.data]);
                return data.data;
            }
        } catch (error) {
            console.error("Error adding land:", error);
        }
    };

    const addDelivery = async (delivery) => {
        try {
            const res = await fetch('http://localhost:3001/api/deliveries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(delivery)
            });
            const data = await res.json();
            if (data.data) {
                setDeliveries([data.data, ...deliveries]);

                // Optimistically update farmer stats
                setFarmers(farmers.map(f => {
                    if (f.id === parseInt(delivery.farmerId)) {
                        return { ...f, deliveries: (f.deliveries || 0) + 1 };
                    }
                    return f;
                }));

                return data.data;
            }
        } catch (error) {
            console.error("Error adding delivery:", error);
        }
    };

    const updateFarmer = async (id, updatedData) => {
        try {
            const res = await fetch(`http://localhost:3001/api/farmers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            const data = await res.json();
            if (data.message === 'success') {
                setFarmers(farmers.map(f => f.id === id ? { ...f, ...updatedData } : f));
                return true;
            }
        } catch (error) {
            console.error("Error updating farmer:", error);
        }
        return false;
    };

    const deleteLand = async (id) => {
        try {
            await fetch(`http://localhost:3001/api/lands/${id}`, { method: 'DELETE' });
            setLands(lands.filter(l => l.id !== id));
        } catch (error) {
            console.error("Error deleting land:", error);
        }
    };

    const updateLand = async (id, updatedData) => {
        try {
            const res = await fetch(`http://localhost:3001/api/lands/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            const data = await res.json();
            if (data.message === 'success') {
                setLands(lands.map(l => l.id === id ? { ...l, ...updatedData } : l));
                return true;
            }
        } catch (error) {
            console.error("Error updating land:", error);
        }
        return false;
    };

    const deleteDelivery = async (id) => {
        try {
            await fetch(`http://localhost:3001/api/deliveries/${encodeURIComponent(id)}`, { method: 'DELETE' });
            setDeliveries(deliveries.filter(d => d.id !== id));
        } catch (error) {
            console.error("Error deleting delivery:", error);
        }
    };

    const updateDelivery = async (id, updates) => {
        try {
            const response = await fetch(`http://localhost:3001/api/deliveries/${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            const result = await response.json();
            if (result.message === 'success') {
                setDeliveries(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
                // If warehouseId was updated, we might want to refresh to get the warehouseName joined
                if (updates.warehouseId) {
                    // Re-fetch deliveries to get the joined warehouseName
                    const res = await fetch('http://localhost:3001/api/deliveries');
                    const data = await res.json();
                    if (data.data) setDeliveries(data.data);
                }
            }
        } catch (error) {
            console.error("Error updating delivery:", error);
        }
    };

    const addWarehouse = async (warehouse) => {
        try {
            const res = await fetch('http://localhost:3001/api/warehouses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(warehouse)
            });
            const data = await res.json();
            if (data.data) {
                setWarehouses([...warehouses, data.data]);
                return data.data;
            }
        } catch (error) {
            console.error("Error adding warehouse:", error);
        }
    };

    const updateWarehouse = async (id, updatedData) => {
        try {
            const res = await fetch(`http://localhost:3001/api/warehouses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            const data = await res.json();
            if (data.message === 'success') {
                setWarehouses(warehouses.map(w => w.id === id ? { ...w, ...updatedData } : w));
                return true;
            }
        } catch (error) {
            console.error("Error updating warehouse:", error);
        }
        return false;
    };

    const deleteWarehouse = async (id) => {
        try {
            await fetch(`http://localhost:3001/api/warehouses/${id}`, { method: 'DELETE' });
            setWarehouses(warehouses.filter(w => w.id !== id));
        } catch (error) {
            console.error("Error deleting warehouse:", error);
        }
    };

    const updatePrice = async (quality, price) => {
        try {
            const res = await fetch('http://localhost:3001/api/prices', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quality, price })
            });
            const data = await res.json();
            if (data.message === 'success') {
                setPrices(prices.map(p => p.quality === quality ? { ...p, price } : p));
                return true;
            }
        } catch (error) {
            console.error("Error updating price:", error);
        }
        return false;
    };

    const addPayment = async (paymentData) => {
        try {
            const response = await fetch('http://localhost:3001/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData)
            });
            const result = await response.json();
            if (result.data) {
                setPayments(prev => [result.data, ...prev]);
                return result.data;
            }
        } catch (error) {
            console.error("Error adding payment:", error);
            throw error;
        }
    };

    const deletePayment = async (id) => {
        try {
            await fetch(`http://localhost:3001/api/payments/${id}`, { method: 'DELETE' });
            setPayments(payments.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error deleting payment:", error);
        }
    };

    const getStats = () => {
        return {
            activeFarmers: farmers.filter(f => f.status === 'Activo').length,
            pendingDeliveries: deliveries.filter(d => d.status === 'Pendiente').length,
            qualityCheck: deliveries.filter(d => d.status === 'En Calidad').length,
            totalStored: deliveries.filter(d => d.status === 'Almacenado').reduce((acc, curr) => acc + parseFloat(curr.weight || 0), 0)
        };
    };

    return (
        <DataContext.Provider value={{
            farmers, addFarmer, deleteFarmer, updateFarmer,
            lands, addLand, deleteLand, updateLand,
            deliveries, addDelivery, deleteDelivery, updateDelivery,
            warehouses, addWarehouse, updateWarehouse, deleteWarehouse,
            prices, updatePrice,
            payments, addPayment, deletePayment,
            products,
            getStats,
            loading
        }}>
            {children}
        </DataContext.Provider>
    );
};

import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [farmers, setFarmers] = useState([]);
    const [lands, setLands] = useState([]);
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [farmersRes, landsRes, deliveriesRes] = await Promise.all([
                    fetch('http://localhost:3001/api/farmers'),
                    fetch('http://localhost:3001/api/lands'),
                    fetch('http://localhost:3001/api/deliveries')
                ]);

                const farmersData = await farmersRes.json();
                const landsData = await landsRes.json();
                const deliveriesData = await deliveriesRes.json();

                setFarmers(farmersData.data || []);
                setLands(landsData.data || []);
                setDeliveries(deliveriesData.data || []);
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

    const getStats = () => {
        return {
            activeFarmers: farmers.filter(f => f.status === 'Activo').length,
            pendingDeliveries: deliveries.filter(d => d.status === 'Pendiente').length,
            qualityCheck: deliveries.filter(d => d.status === 'En Calidad').length,
            totalStored: deliveries.filter(d => d.status === 'Almacenado').reduce((acc, curr) => acc + parseFloat(curr.weight), 0)
        };
    };

    return (
        <DataContext.Provider value={{
            farmers, addFarmer, deleteFarmer,
            lands, addLand,
            deliveries, addDelivery,
            getStats,
            loading
        }}>
            {children}
        </DataContext.Provider>
    );
};

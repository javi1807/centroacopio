import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

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

    // Base URL configuration for Vercel/Production
    // If VITE_API_URL is set (env), use it.
    // If PROD build (Vercel), use relative path '' (to use same domain /api proxy)
    // If DEV, use localhost:8000
    const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000');

    // Helper to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('accessToken');
        return token ? {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        } : {
            'Content-Type': 'application/json'
        };
    };

    // Helper for authorized fetch
    const authFetch = async (url, options = {}) => {
        // Ensure URL starts with BASE_URL if it's an API call
        const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

        const headers = getAuthHeaders();
        const res = await fetch(fullUrl, { ...options, headers: { ...headers, ...options.headers } });
        if (res.status === 401) {
            // Token expired or invalid
            console.warn("Unauthorized access - redirecting to login");
            // Optionally clear storage and redirect
            // localStorage.removeItem('accessToken');
            // window.location.href = '/login'; 
        }
        return res;
    };

    const fetchData = useCallback(async () => {
        if (!localStorage.getItem('accessToken')) {
            setLoading(false);
            return;
        }

        try {
            const [farmersRes, landsRes, deliveriesRes, warehousesRes, pricesRes, paymentsRes, productsRes] = await Promise.all([
                authFetch('/api/farmers/'),
                authFetch('/api/lands/'),
                authFetch('/api/deliveries/'),
                authFetch('/api/warehouses/'),
                authFetch('/api/prices/'),
                authFetch('/api/payments/'),
                authFetch('/api/products/'),
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
    }, []);

    // Fetch Initial Data on Mount
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Actions
    const addFarmer = useCallback(async (farmer) => {
        try {
            const res = await authFetch('/api/farmers/', {
                method: 'POST',
                body: JSON.stringify(farmer)
            });
            const data = await res.json();
            if (data.data) {
                setFarmers(prev => [...prev, data.data]);
                return data.data;
            }
        } catch (error) {
            console.error("Error adding farmer:", error);
            throw error;
        }
    }, []);

    const deleteFarmer = useCallback(async (id) => {
        try {
            await authFetch(`/api/farmers/${id}/`, { method: 'DELETE' });
            setFarmers(prev => prev.filter(f => f.id !== id));
        } catch (error) {
            console.error("Error deleting farmer:", error);
            throw error;
        }
    }, []);

    const addLand = async (land) => {
        try {
            const res = await authFetch('/api/lands/', {
                method: 'POST',
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
            const res = await authFetch('/api/deliveries/', {
                method: 'POST',
                body: JSON.stringify(delivery)
            });
            const data = await res.json();
            // Backend returns object directly (e.g. {id: 1, ...}) or wrapped {data: ...} if we changed it.
            // BaseViewSet only wraps LIST. Create returns object directly.
            const newDelivery = data.data || data;

            if (newDelivery && newDelivery.id) {
                setDeliveries([newDelivery, ...deliveries]);
                // Optimistically update farmer stats
                setFarmers(farmers.map(f => {
                    if (f.id === parseInt(delivery.farmerId)) {
                        return { ...f, deliveries: (f.deliveries || 0) + 1 };
                    }
                    return f;
                }));
                return newDelivery;
            }
        } catch (error) {
            console.error("Error adding delivery:", error);
        }
    };

    const updateFarmer = async (id, updatedData) => {
        try {
            const res = await authFetch(`/api/farmers/${id}/`, {
                method: 'PUT',
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
            await authFetch(`/api/lands/${id}/`, { method: 'DELETE' });
            setLands(lands.filter(l => l.id !== id));
        } catch (error) {
            console.error("Error deleting land:", error);
        }
    };

    const updateLand = async (id, updatedData) => {
        try {
            const res = await authFetch(`/api/lands/${id}/`, {
                method: 'PUT',
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
            await authFetch(`/api/deliveries/${encodeURIComponent(id)}/`, { method: 'DELETE' });
            setDeliveries(deliveries.filter(d => d.id !== id));
        } catch (error) {
            console.error("Error deleting delivery:", error);
        }
    };

    const updateDelivery = async (id, updates) => {
        try {
            const response = await authFetch(`/api/deliveries/${encodeURIComponent(id)}/`, {
                method: 'PATCH',
                body: JSON.stringify(updates)
            });
            // ... handle response (check specific status code if needed, defaults are usually OK if successful)
            // Legacy wrapper returns {data: ...} or instance.
            // Let's assume result ok.
            if (response.ok) {
                // If backend returns data, use it, else assume success
                const result = await response.json();
                // DRF standard for PATCH returns updated object directly, not wrapped in {message: success} usually.
                // But our BaseViewSet wraps list? retrieve/update usually return object.
                // Let's assume success if response.ok

                setDeliveries(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
                if (updates.warehouseId) fetchData();
                return true;
            } else {
                const errorText = await response.text();
                console.error(`Error updating delivery ${id}: ${response.status}`, errorText);
            }
        } catch (error) {
            console.error("Error updating delivery:", error);
        }
        return false;
    };

    const addWarehouse = async (warehouse) => {
        try {
            const res = await authFetch('/api/warehouses/', {
                method: 'POST',
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
            const res = await authFetch(`/api/warehouses/${id}/`, {
                method: 'PUT',
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
            await authFetch(`/api/warehouses/${id}/`, { method: 'DELETE' });
            setWarehouses(warehouses.filter(w => w.id !== id));
        } catch (error) {
            console.error("Error deleting warehouse:", error);
        }
    };

    const updatePrice = async (quality, price) => {
        try {
            const res = await authFetch('/api/prices_update', {
                method: 'PUT',
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
            const response = await authFetch('/api/payments/', {
                method: 'POST',
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
            await authFetch(`/api/payments/${id}/`, { method: 'DELETE' });
            setPayments(payments.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error deleting payment:", error);
        }
    };

    // Memoize computed stats
    const stats = useMemo(() => ({
        activeFarmers: farmers.filter(f => f.status === 'Activo').length,
        pendingDeliveries: deliveries.filter(d => d.status === 'Pendiente').length,
        qualityCheck: deliveries.filter(d => d.status === 'En Calidad').length,
        totalStored: deliveries.filter(d => d.status === 'Almacenado').reduce((acc, curr) => acc + parseFloat(curr.weight || 0), 0)
    }), [farmers, deliveries]);

    const getStats = useCallback(() => stats, [stats]);

    // Logic for auth state
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));

    const checkLogin = () => {
        setIsLoggedIn(!!localStorage.getItem('accessToken'));
    };

    // Call checkLogin initially
    useEffect(() => {
        checkLogin();
    }, []);

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsLoggedIn(false);
        // Optional: clear data
        setFarmers([]);
        setLands([]);
        setDeliveries([]);
        window.location.href = '/';
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
            loading,
            // Expose a refresh function if needed
            refreshData: fetchData,
            // Auth exports
            isLoggedIn, logout, checkLogin
        }}>
            {children}
        </DataContext.Provider>
    );
};

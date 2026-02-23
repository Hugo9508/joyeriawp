'use client';

import { useState, useEffect, useCallback } from 'react';
import KanbanBoard from '@/components/admin/kanban-board';
import NewOrderModal from '@/components/admin/new-order-modal';
import OrderDetailModal from '@/components/admin/order-detail-modal';
import InvoiceModal from '@/components/admin/invoice-modal';
import { Order, KanbanStatus, SOURCE_CONFIG } from '@/lib/supabase';
import { Plus, Search, RefreshCw, Filter, ShoppingCart } from 'lucide-react';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewOrder, setShowNewOrder] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
    const [search, setSearch] = useState('');
    const [filterSource, setFilterSource] = useState<string>('');

    const fetchOrders = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (filterSource) params.set('source', filterSource);
            const res = await fetch(`/api/admin/orders?${params}`);
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    }, [search, filterSource]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleOrderMove = async (orderId: string, newStatus: KanbanStatus) => {
        // Optimistic update
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, kanban_status: newStatus } : o));

        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kanban_status: newStatus }),
            });
            if (!res.ok) {
                // Revert on error
                fetchOrders();
            }
        } catch {
            fetchOrders();
        }
    };

    const handleOrderClick = (order: Order) => {
        setSelectedOrder(order);
    };

    const handleOrderUpdated = (updated: Order) => {
        setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
        setSelectedOrder(updated);
    };

    const handleOrderDeleted = (id: string) => {
        setOrders(prev => prev.filter(o => o.id !== id));
    };

    const handleOrderCreated = (newOrder: Order) => {
        setOrders(prev => [newOrder, ...prev]);
    };

    const activeCount = orders.filter(o => o.kanban_status !== 'completed').length;
    const totalValue = orders.filter(o => o.kanban_status !== 'completed').reduce((s, o) => s + Number(o.total), 0);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <ShoppingCart className="w-6 h-6 text-primary" />
                        Pedidos
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {activeCount} pedidos activos · ${totalValue.toLocaleString('es-UY', { minimumFractionDigits: 2 })} total
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => { setLoading(true); fetchOrders(); }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualizar
                    </button>
                    <button onClick={() => setShowNewOrder(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-yellow-600 shadow-md transition-colors">
                        <Plus className="w-4 h-4" /> Nuevo Pedido
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por cliente o número..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary"
                    />
                </div>
                <select
                    value={filterSource}
                    onChange={e => setFilterSource(e.target.value)}
                    className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                >
                    <option value="">Todos los orígenes</option>
                    <option value="woocommerce">🔵 Web (WooCommerce)</option>
                    <option value="whatsapp">🟢 WhatsApp</option>
                    <option value="manual">🟣 Manual</option>
                </select>
            </div>

            {/* Kanban Board */}
            <KanbanBoard
                orders={orders}
                onOrderClick={handleOrderClick}
                onOrderMove={handleOrderMove}
                loading={loading}
            />

            {/* Modals */}
            <NewOrderModal
                open={showNewOrder}
                onClose={() => setShowNewOrder(false)}
                onCreated={handleOrderCreated}
            />
            <OrderDetailModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onUpdate={handleOrderUpdated}
                onDelete={handleOrderDeleted}
                onPrintInvoice={(order) => { setSelectedOrder(null); setInvoiceOrder(order); }}
            />
            <InvoiceModal
                order={invoiceOrder}
                onClose={() => setInvoiceOrder(null)}
            />
        </div>
    );
}

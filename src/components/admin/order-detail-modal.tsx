'use client';

import { useState } from 'react';
import { Order, KANBAN_COLUMNS, SOURCE_CONFIG } from '@/lib/supabase';
import { X, Edit, Save, Trash2, Printer, Package } from 'lucide-react';

interface OrderDetailModalProps {
    order: Order | null;
    onClose: () => void;
    onUpdate: (order: Order) => void;
    onDelete: (id: string) => void;
    onPrintInvoice: (order: Order) => void;
}

export default function OrderDetailModal({ order, onClose, onUpdate, onDelete, onPrintInvoice }: OrderDetailModalProps) {
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<Order>>({});
    const [loading, setLoading] = useState(false);

    if (!order) return null;

    const src = SOURCE_CONFIG[order.source];
    const initials = order.customer_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    const handleEdit = () => {
        setEditing(true);
        setEditData({
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            customer_phone: order.customer_phone,
            customer_address: order.customer_address,
            payment_method: order.payment_method,
            notes: order.notes,
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/orders/${order.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
            });
            const updated = await res.json();
            if (!res.ok) throw new Error(updated.error);
            onUpdate(updated);
            setEditing(false);
        } catch (e: any) {
            alert('Error: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMoveColumn = async (newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/orders/${order.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kanban_status: newStatus }),
            });
            const updated = await res.json();
            if (!res.ok) throw new Error(updated.error);
            onUpdate(updated);
        } catch (e: any) {
            alert('Error: ' + e.message);
        }
    };

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de que quieres eliminar este pedido?')) return;
        try {
            const res = await fetch(`/api/admin/orders/${order.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error al eliminar');
            onDelete(order.id);
            onClose();
        } catch (e: any) {
            alert('Error: ' + e.message);
        }
    };

    const statusBadge = KANBAN_COLUMNS.find(c => c.id === order.kanban_status);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={onClose} />
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-gray-200 dark:border-gray-700">
                    <div className="px-4 pt-5 pb-4 sm:p-6">
                        {/* Header */}
                        <div className="flex flex-wrap items-start justify-between mb-6 gap-3">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                                    <Package className="w-5 h-5 text-primary" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 flex-wrap">
                                        Detalle del Pedido
                                        <span className="text-gray-500 text-sm font-mono">#{order.order_number}</span>
                                        <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: statusBadge?.color + '20', color: statusBadge?.color }}>
                                            {statusBadge?.label}
                                        </span>
                                        <span className={`${src.bg} ${src.color} text-xs px-1.5 py-0.5 rounded`}>{src.label}</span>
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Creado: {new Date(order.created_at).toLocaleString('es-UY')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {!editing ? (
                                    <button onClick={handleEdit}
                                        className="text-sm text-primary hover:text-yellow-600 font-medium px-3 py-1 border border-primary/30 rounded flex items-center gap-1">
                                        <Edit className="w-3.5 h-3.5" /> Editar
                                    </button>
                                ) : (
                                    <button onClick={handleSave} disabled={loading}
                                        className="text-sm text-white bg-green-600 hover:bg-green-700 font-medium px-3 py-1 rounded shadow-sm flex items-center gap-1 disabled:opacity-50">
                                        <Save className="w-3.5 h-3.5" /> {loading ? 'Guardando...' : 'Guardar'}
                                    </button>
                                )}

                                <select onChange={e => { if (e.target.value) handleMoveColumn(e.target.value); e.target.value = ''; }}
                                    className="text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded px-2 py-1 cursor-pointer"
                                    defaultValue="">
                                    <option value="" disabled>Mover a…</option>
                                    {KANBAN_COLUMNS.map(col => (
                                        <option key={col.id} value={col.id} disabled={col.id === order.kanban_status}>{col.label}</option>
                                    ))}
                                </select>

                                <button onClick={handleDelete}
                                    className="text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 font-medium px-2 py-1 rounded border border-red-400/30 transition-colors"
                                    title="Eliminar">
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-6">
                            {/* Left: Customer */}
                            <div className="col-span-12 md:col-span-4 space-y-6">
                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                    <h4 className="text-xs font-semibold uppercase text-gray-400 mb-3">Cliente</h4>
                                    <div className="flex items-center mb-4">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-yellow-700 flex items-center justify-center text-white font-bold text-sm">
                                            {initials}
                                        </div>
                                        <div className="ml-3">
                                            {editing ? (
                                                <input value={editData.customer_name || ''} onChange={e => setEditData({ ...editData, customer_name: e.target.value })}
                                                    className="text-sm font-bold border border-primary rounded px-2 py-1 bg-transparent text-gray-800 dark:text-gray-200 w-full" />
                                            ) : (
                                                <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{order.customer_name}</p>
                                            )}
                                            <p className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded inline-block mt-0.5">{order.customer_type}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <span className="opacity-70">📧</span>
                                            {editing ? (
                                                <input value={editData.customer_email || ''} onChange={e => setEditData({ ...editData, customer_email: e.target.value })}
                                                    className="text-xs border border-primary rounded px-2 py-1 bg-transparent flex-1" />
                                            ) : (
                                                <span className="break-all">{order.customer_email || '—'}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="opacity-70">📞</span>
                                            {editing ? (
                                                <input value={editData.customer_phone || ''} onChange={e => setEditData({ ...editData, customer_phone: e.target.value })}
                                                    className="text-xs border border-primary rounded px-2 py-1 bg-transparent flex-1" />
                                            ) : (
                                                <span>{order.customer_phone || '—'}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="opacity-70">📍</span>
                                            {editing ? (
                                                <input value={editData.customer_address || ''} onChange={e => setEditData({ ...editData, customer_address: e.target.value })}
                                                    className="text-xs border border-primary rounded px-2 py-1 bg-transparent flex-1" />
                                            ) : (
                                                <span>{order.customer_address || '—'}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Items & Totals */}
                            <div className="col-span-12 md:col-span-8">
                                {/* Items Table */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-4">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 uppercase">
                                            <tr>
                                                <th className="px-4 py-2 font-medium">Artículo</th>
                                                <th className="px-4 py-2 font-medium text-center">Cant.</th>
                                                <th className="px-4 py-2 font-medium text-right">Precio</th>
                                                <th className="px-4 py-2 font-medium text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {(order.order_items || []).map(item => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-3">
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{item.product_name}</span>
                                                        {item.sku && <span className="block text-xs text-gray-400">SKU: {item.sku}</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">${Number(item.unit_price).toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-gray-200">${Number(item.total).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            {(!order.order_items || order.order_items.length === 0) && (
                                                <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400 italic">Sin artículos</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Notes & Totals */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase text-gray-400 mb-1">Notas</h4>
                                            {editing ? (
                                                <textarea value={editData.notes || ''} onChange={e => setEditData({ ...editData, notes: e.target.value })}
                                                    className="text-sm w-full border border-primary rounded p-2 bg-transparent text-gray-600 dark:text-gray-300 min-h-[60px]" />
                                            ) : (
                                                <div className="text-sm text-gray-600 dark:text-gray-300 italic bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded border border-yellow-200 dark:border-yellow-900/30 min-h-[60px]">
                                                    {order.notes || 'Sin notas.'}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase text-gray-400 mb-1">Método de Pago</h4>
                                            {editing ? (
                                                <select value={editData.payment_method || 'Contado'} onChange={e => setEditData({ ...editData, payment_method: e.target.value })}
                                                    className="text-sm w-full border border-primary rounded px-2 py-1 bg-transparent text-gray-800 dark:text-gray-200">
                                                    <option value="Contado">Contado</option>
                                                    <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                                                    <option value="Pago al retirar">Pago al retirar</option>
                                                    <option value="Crédito 30 días">Crédito 30 días</option>
                                                </select>
                                            ) : (
                                                <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{order.payment_method}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg self-start">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                                            <span>IVA (22%)</span><span>${Number(order.tax).toFixed(2)}</span>
                                        </div>
                                        <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2 flex justify-between items-center">
                                            <span className="font-bold text-gray-900 dark:text-white">Total</span>
                                            <span className="font-bold text-lg text-primary">${Number(order.total).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-end gap-3">
                            <button onClick={() => onPrintInvoice(order)}
                                className="inline-flex items-center gap-2 rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <Printer className="w-4 h-4" /> Pre-Factura
                            </button>
                            <button onClick={onClose}
                                className="inline-flex items-center gap-2 rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-sm font-medium text-white hover:bg-yellow-600">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

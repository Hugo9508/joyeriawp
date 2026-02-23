'use client';

import { useState } from 'react';
import { Order, OrderItem } from '@/lib/supabase';
import { X, Plus, Trash2 } from 'lucide-react';

interface NewOrderModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: (order: Order) => void;
}

interface ItemRow {
    product_name: string;
    sku: string;
    quantity: number;
    unit_price: number;
}

const emptyItem = (): ItemRow => ({ product_name: '', sku: '', quantity: 1, unit_price: 0 });

export default function NewOrderModal({ open, onClose, onCreated }: NewOrderModalProps) {
    const [loading, setLoading] = useState(false);
    const [customer, setCustomer] = useState({ name: '', phone: '', email: '', address: '', type: 'PARTICULAR' });
    const [source, setSource] = useState<'manual' | 'whatsapp'>('manual');
    const [payment, setPayment] = useState('Contado');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<ItemRow[]>([emptyItem()]);

    const addItem = () => setItems([...items, emptyItem()]);
    const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
    const updateItem = (idx: number, field: keyof ItemRow, value: string | number) => {
        const updated = [...items];
        (updated[idx] as any)[field] = value;
        setItems(updated);
    };

    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
    const tax = Math.round(subtotal * 0.22 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const handleSubmit = async () => {
        if (!customer.name.trim()) return alert('El nombre del cliente es obligatorio');
        if (items.every(i => !i.product_name.trim())) return alert('Agrega al menos un artículo');

        setLoading(true);
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: customer.name,
                    customer_email: customer.email || null,
                    customer_phone: customer.phone || null,
                    customer_address: customer.address || null,
                    customer_type: customer.type,
                    source,
                    payment_method: payment,
                    notes: notes || null,
                    items: items.filter(i => i.product_name.trim()),
                }),
            });
            const order = await res.json();
            if (!res.ok) throw new Error(order.error);
            onCreated(order);
            // Reset
            setCustomer({ name: '', phone: '', email: '', address: '', type: 'PARTICULAR' });
            setItems([emptyItem()]);
            setNotes('');
            onClose();
        } catch (e: any) {
            alert('Error al crear pedido: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg z-10 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 shrink-0">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary" /> Nuevo Pedido
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
                    {/* Customer */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-400 mb-1 font-medium">Cliente *</label>
                            <input value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })}
                                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2.5 focus:ring-primary focus:border-primary" placeholder="Nombre del cliente" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 font-medium">Teléfono</label>
                            <input value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2.5 focus:ring-primary focus:border-primary" placeholder="+598 99 123 456" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 font-medium">Email</label>
                            <input value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })}
                                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2.5 focus:ring-primary focus:border-primary" placeholder="email@ejemplo.com" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 font-medium">Tipo Cliente</label>
                            <select value={customer.type} onChange={e => setCustomer({ ...customer, type: e.target.value })}
                                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2.5 focus:ring-primary focus:border-primary">
                                <option value="PARTICULAR">Particular</option>
                                <option value="JOYERÍA">Joyería</option>
                                <option value="CORPORATIVO">Corporativo</option>
                                <option value="DISTRIBUIDOR">Distribuidor</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 font-medium">Origen</label>
                            <select value={source} onChange={e => setSource(e.target.value as any)}
                                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2.5 focus:ring-primary focus:border-primary">
                                <option value="manual">Manual</option>
                                <option value="whatsapp">WhatsApp</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-400 mb-1 font-medium">Dirección</label>
                            <input value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })}
                                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2.5 focus:ring-primary focus:border-primary" placeholder="Retiro en Local" />
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-gray-400 font-medium">Items del Pedido *</label>
                            <button onClick={addItem} className="text-xs text-primary hover:text-yellow-300 font-medium flex items-center gap-0.5 transition-colors">
                                <Plus className="w-4 h-4" /> Agregar
                            </button>
                        </div>
                        <div className="space-y-2">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex gap-2 items-start">
                                    <input value={item.product_name} onChange={e => updateItem(idx, 'product_name', e.target.value)}
                                        placeholder="Artículo" className="flex-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:ring-primary focus:border-primary" />
                                    <input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)} min={1}
                                        className="w-16 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-2 py-2 text-center focus:ring-primary focus:border-primary" />
                                    <input type="number" value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)} min={0} step={0.01}
                                        placeholder="Precio" className="w-24 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-2 py-2 text-right focus:ring-primary focus:border-primary" />
                                    {items.length > 1 && (
                                        <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300 p-2">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center bg-gray-900/50 px-4 py-3 rounded-lg border border-gray-700">
                        <div className="text-sm text-gray-300">
                            <div className="flex justify-between gap-8 text-xs text-gray-500">
                                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between gap-8 text-xs text-gray-500">
                                <span>IVA 22%</span><span>${tax.toFixed(2)}</span>
                            </div>
                        </div>
                        <span className="text-xl font-bold text-white">${total.toFixed(2)}</span>
                    </div>

                    {/* Notes & Payment */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 font-medium">Forma de Pago</label>
                            <select value={payment} onChange={e => setPayment(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2.5 focus:ring-primary focus:border-primary">
                                <option value="Contado">Contado</option>
                                <option value="Transferencia Bancaria">Transferencia</option>
                                <option value="Pago al retirar">Pago al retirar</option>
                                <option value="Crédito 30 días">Crédito 30 días</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 font-medium">Notas</label>
                            <input value={notes} onChange={e => setNotes(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2.5 focus:ring-primary focus:border-primary" placeholder="Notas adicionales..." />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-700 shrink-0">
                    <button onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} disabled={loading}
                        className="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-yellow-600 rounded-lg shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50">
                        {loading ? 'Creando...' : '✓ Crear Pedido'}
                    </button>
                </div>
            </div>
        </div>
    );
}

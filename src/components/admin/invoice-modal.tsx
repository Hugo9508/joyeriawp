'use client';

import { Order } from '@/lib/supabase';
import { X, Printer } from 'lucide-react';
import { useRef } from 'react';

interface InvoiceModalProps {
    order: Order | null;
    onClose: () => void;
}

export default function InvoiceModal({ order, onClose }: InvoiceModalProps) {
    const printRef = useRef<HTMLDivElement>(null);

    if (!order) return null;

    const handlePrint = () => {
        if (!printRef.current) return;
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(`
      <html>
        <head>
          <title>Pre-Factura ${order.order_number}</title>
          <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Space Mono', monospace; font-size: 11px; padding: 24px; max-width: 380px; margin: 0 auto; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .font-bold { font-weight: 700; }
            .mb-1 { margin-bottom: 4px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-6 { margin-bottom: 24px; }
            .mt-1 { margin-top: 4px; }
            .mt-2 { margin-top: 8px; }
            .py-2 { padding: 8px 0; }
            .border-t { border-top: 1px solid #000; }
            .border-b { border-bottom: 1px solid #000; }
            .flex { display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 4px 0; }
            th { border-bottom: 1px solid #000; text-transform: uppercase; font-size: 10px; }
            .uppercase { text-transform: uppercase; }
            .text-xs { font-size: 10px; }
            .text-xl { font-size: 18px; }
            .text-lg { font-size: 16px; }
            .tracking { letter-spacing: 2px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `);
        win.document.close();
        win.print();
    };

    const today = new Date().toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 py-6">
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={onClose} />
                <div className="relative inline-block bg-white text-left overflow-hidden shadow-xl w-full max-w-sm z-10 border border-gray-200">
                    {/* Invoice Content */}
                    <div ref={printRef} className="p-6 bg-white text-black font-mono text-sm">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="text-3xl mb-2">💎</div>
                            <h2 className="text-xl font-bold uppercase tracking-widest mb-1">JOYERÍA ALIANZA</h2>
                            <div className="text-[10px] space-y-0.5">
                                <p>Mercedes 1211</p>
                                <p>Montevideo, Uruguay 11100</p>
                                <p>Tel: (099) 000 000</p>
                            </div>
                        </div>

                        {/* Invoice Info */}
                        <div className="border-t border-b border-black py-2 mb-4 text-[10px]">
                            <div className="flex justify-between"><span>TIPO DE DOCUMENTO</span><span className="font-bold">Pre-Factura</span></div>
                            <div className="flex justify-between mt-1"><span>NÚMERO</span><span className="font-bold">{order.order_number}</span></div>
                            <div className="flex justify-between mt-1"><span>FECHA</span><span className="font-bold">{today}</span></div>
                            <div className="flex justify-between mt-1"><span>FORMA DE PAGO</span><span className="font-bold">{order.payment_method}</span></div>
                            <div className="flex justify-between mt-1"><span>ORIGEN</span><span className="font-bold uppercase">{order.source}</span></div>
                        </div>

                        {/* Customer */}
                        <div className="mb-4 text-[10px] uppercase border-b border-black pb-2">
                            <div className="flex"><span className="w-16">NOMBRE</span><span className="font-bold truncate flex-1">{order.customer_name}</span></div>
                            {order.customer_phone && (
                                <div className="flex mt-1"><span className="w-16">TEL</span><span className="truncate flex-1">{order.customer_phone}</span></div>
                            )}
                        </div>

                        {/* Items */}
                        <table className="w-full text-[10px] mb-4">
                            <thead>
                                <tr className="border-b border-black">
                                    <th className="text-left py-1">Cant</th>
                                    <th className="text-left py-1">Descripción</th>
                                    <th className="text-right py-1">Importe</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(order.order_items || []).map(item => (
                                    <tr key={item.id}>
                                        <td className="py-1">{item.quantity}</td>
                                        <td className="py-1">{item.product_name}</td>
                                        <td className="py-1 text-right">${Number(item.total).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="border-t border-black pt-2 mb-6">
                            <div className="flex justify-between font-bold text-lg">
                                <span>TOTAL</span><span>${Number(order.total).toFixed(2)}</span>
                            </div>
                            <div className="mt-2 text-[10px] text-right">
                                <p>Subtotal: ${Number(order.subtotal).toFixed(2)}</p>
                                <p>IVA (22%): ${Number(order.tax).toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center text-[10px]">
                            <p className="font-bold">PRE-FACTURA (DOCUMENTO NO VÁLIDO COMO FACTURA)</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-gray-100 px-4 py-3 flex justify-between">
                        <button onClick={onClose}
                            className="inline-flex items-center gap-2 rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Cerrar
                        </button>
                        <button onClick={handlePrint}
                            className="inline-flex items-center gap-2 rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-900 text-sm font-medium text-white hover:bg-gray-800">
                            <Printer className="w-4 h-4" /> Imprimir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Order, SOURCE_CONFIG } from '@/lib/supabase';
import { Clock, User } from 'lucide-react';

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'justo ahora';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

interface OrderCardProps {
    order: Order;
    onClick: (order: Order) => void;
}

export default function OrderCard({ order, onClick }: OrderCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: order.id, data: { order } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const src = SOURCE_CONFIG[order.source];
    const itemsSummary = order.order_items
        ?.slice(0, 2)
        .map(i => `${i.quantity}x ${i.product_name}`)
        .join(', ') || 'Sin items';

    const isCompleted = order.kanban_status === 'completed';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick(order)}
            className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 
        hover:shadow-md transition-all cursor-pointer group
        ${isCompleted ? 'opacity-60' : ''}
        ${isDragging ? 'shadow-xl ring-2 ring-primary/40' : ''}`}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-mono text-gray-400 ${isCompleted ? 'line-through' : ''}`}>
                    #{order.order_number}
                </span>
                <span className={`${src.bg} ${src.color} text-[10px] px-1.5 py-0.5 rounded font-medium`}>
                    {src.label}
                </span>
            </div>

            {/* Customer */}
            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1 group-hover:text-primary transition-colors text-sm">
                {order.customer_name}
            </h4>

            {/* Items preview */}
            {!isCompleted && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                    {itemsSummary}
                    {(order.order_items?.length || 0) > 2 && '...'}
                </div>
            )}

            {/* Footer */}
            <div className={`flex justify-between items-center ${!isCompleted ? 'border-t border-gray-100 dark:border-gray-700 pt-3' : 'mt-1'}`}>
                <div className="flex items-center text-gray-400 text-xs gap-1">
                    {order.assigned_to ? (
                        <>
                            <User className="w-3.5 h-3.5" />
                            <span>{order.assigned_to}</span>
                        </>
                    ) : (
                        <>
                            <Clock className="w-3.5 h-3.5" />
                            <span>{timeAgo(order.created_at)}</span>
                        </>
                    )}
                </div>
                {!isCompleted && (
                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                        ${order.total.toLocaleString('es-UY', { minimumFractionDigits: 2 })}
                    </span>
                )}
            </div>
        </div>
    );
}

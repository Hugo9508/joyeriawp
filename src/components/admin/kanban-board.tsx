'use client';

import { useState, useCallback, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
    UniqueIdentifier,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import OrderCard from './order-card';
import { Order, KanbanStatus, KANBAN_COLUMNS, SOURCE_CONFIG } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

// Droppable Column Container
function KanbanColumn({ id, children }: { id: string; children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div
            ref={setNodeRef}
            className={`flex-1 min-w-[260px] max-w-[320px] flex flex-col transition-colors duration-200 ${isOver ? 'bg-primary/5 rounded-xl' : ''
                }`}
        >
            {children}
        </div>
    );
}

interface KanbanBoardProps {
    orders: Order[];
    onOrderClick: (order: Order) => void;
    onOrderMove: (orderId: string, newStatus: KanbanStatus) => void;
    loading?: boolean;
}

export default function KanbanBoard({ orders, onOrderClick, onOrderMove, loading }: KanbanBoardProps) {
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    // Group orders by status
    const columns = KANBAN_COLUMNS.map(col => ({
        ...col,
        orders: orders.filter(o => o.kanban_status === col.id),
    }));

    const handleDragStart = (event: DragStartEvent) => {
        const order = orders.find(o => o.id === event.active.id);
        if (order) setActiveOrder(order);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveOrder(null);

        if (!over) return;

        const orderId = active.id as string;
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        // Determine target column
        let targetStatus: KanbanStatus | null = null;

        // Check if dropped directly on a column
        const isColumn = KANBAN_COLUMNS.some(c => c.id === over.id);
        if (isColumn) {
            targetStatus = over.id as KanbanStatus;
        } else {
            // Dropped on another card — find which column that card is in
            const targetOrder = orders.find(o => o.id === over.id);
            if (targetOrder) {
                targetStatus = targetOrder.kanban_status;
            }
        }

        if (targetStatus && targetStatus !== order.kanban_status) {
            onOrderMove(orderId, targetStatus);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '70vh' }}>
                {columns.map(col => (
                    <KanbanColumn key={col.id} id={col.id}>
                        {/* Column Header */}
                        <div className="flex items-center justify-between px-3 py-3 mb-2 sticky top-0 z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {col.label}
                                </span>
                            </div>
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs font-bold min-w-[24px] text-center">
                                {col.orders.length}
                            </span>
                        </div>

                        {/* Cards */}
                        <SortableContext items={col.orders.map(o => o.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2 px-1 flex-1 min-h-[100px]">
                                {col.orders.map(order => (
                                    <OrderCard key={order.id} order={order} onClick={onOrderClick} />
                                ))}
                                {col.orders.length === 0 && (
                                    <div className="text-center text-gray-400 text-xs py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                                        Arrastra aquí
                                    </div>
                                )}
                            </div>
                        </SortableContext>
                    </KanbanColumn>
                ))}
            </div>

            {/* Drag overlay */}
            <DragOverlay>
                {activeOrder ? (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border-2 border-primary/40 opacity-95 max-w-[280px]">
                        <div className="text-xs font-mono text-gray-400">#{activeOrder.order_number}</div>
                        <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">{activeOrder.customer_name}</div>
                        <div className="text-sm font-bold text-primary mt-1">${activeOrder.total.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

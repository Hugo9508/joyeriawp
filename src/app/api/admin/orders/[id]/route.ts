import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/admin/orders/[id] — single order detail
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/admin/orders/[id] — update order (status, data, items)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { items, ...updateData } = body;

        // Update order fields
        if (Object.keys(updateData).length > 0) {
            const { error: updateError } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', id);

            if (updateError) throw updateError;
        }

        // Update items if provided
        if (items) {
            // Delete old items and insert new
            await supabase.from('order_items').delete().eq('order_id', id);

            if (items.length > 0) {
                const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0);
                const tax = Math.round(subtotal * 0.22 * 100) / 100;
                const total = Math.round((subtotal + tax) * 100) / 100;

                const orderItems = items.map((item: any) => ({
                    order_id: id,
                    product_name: item.product_name,
                    sku: item.sku || null,
                    quantity: item.quantity || 1,
                    unit_price: item.unit_price || 0,
                    total: (item.quantity || 1) * (item.unit_price || 0),
                }));

                await supabase.from('order_items').insert(orderItems);
                await supabase.from('orders').update({ subtotal, tax, total }).eq('id', id);
            }
        }

        // Return updated order
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/admin/orders/[id]
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

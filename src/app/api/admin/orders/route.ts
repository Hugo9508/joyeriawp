import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/admin/orders — list all orders with items
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const source = searchParams.get('source');
        const search = searchParams.get('search');

        let query = supabase
            .from('orders')
            .select('*, order_items(*)')
            .order('created_at', { ascending: false });

        if (status) query = query.eq('kanban_status', status);
        if (source) query = query.eq('source', source);
        if (search) query = query.or(`customer_name.ilike.%${search}%,order_number.ilike.%${search}%`);

        const { data, error } = await query;

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/admin/orders — create new order
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { items, ...orderData } = body;

        // Generate order number
        const { data: seqData } = await supabase.rpc('nextval', { seq_name: 'order_number_seq' }).single();
        const seq = seqData || Date.now();
        const orderNumber = `ORD-${String(seq).padStart(4, '0')}`;

        // Calculate totals   
        const subtotal = (items || []).reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0);
        const tax = Math.round(subtotal * 0.22 * 100) / 100;
        const total = Math.round((subtotal + tax) * 100) / 100;

        // Insert order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                order_number: orderNumber,
                source: orderData.source || 'manual',
                source_id: orderData.source_id || null,
                kanban_status: 'new',
                customer_name: orderData.customer_name,
                customer_email: orderData.customer_email || null,
                customer_phone: orderData.customer_phone || null,
                customer_address: orderData.customer_address || null,
                customer_type: orderData.customer_type || 'PARTICULAR',
                subtotal,
                tax,
                total,
                currency: orderData.currency || 'UYU',
                payment_method: orderData.payment_method || 'Contado',
                notes: orderData.notes || null,
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // Insert items
        if (items && items.length > 0 && order) {
            const orderItems = items.map((item: any) => ({
                order_id: order.id,
                product_name: item.product_name,
                sku: item.sku || null,
                quantity: item.quantity || 1,
                unit_price: item.unit_price || 0,
                total: (item.quantity || 1) * (item.unit_price || 0),
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;
        }

        // Return order with items
        const { data: fullOrder } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', order!.id)
            .single();

        return NextResponse.json(fullOrder, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

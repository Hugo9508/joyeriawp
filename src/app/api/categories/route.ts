import { NextResponse } from 'next/server';
import { fetchWooCommerce } from '@/lib/woocommerce';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const data = await fetchWooCommerce('products/categories', { per_page: '100', hide_empty: 'true' });
    const categories = Array.isArray(data) ? data.map((cat: any) => ({
      name: cat.name,
      value: cat.slug,
      id: cat.id
    })) : [];

    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al cargar categorías' }, { status: 500 });
  }
}

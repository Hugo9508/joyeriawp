
import { NextResponse } from 'next/server';
import { fetchWooCommerce } from '@/lib/woocommerce';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const data = await fetchWooCommerce('products/categories', { 
      per_page: '100', 
      hide_empty: 'true'
    });
    
    const categories = Array.isArray(data) ? data.map((cat: any) => ({
      name: cat.name,
      value: cat.slug,
      id: cat.id
    })) : [];

    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Runtime': 'nodejs'
      }
    });
  } catch (error: any) {
    console.error('API Categories Error:', error.message);
    return NextResponse.json({ error: 'Categorías no disponibles' }, { status: 502 });
  }
}

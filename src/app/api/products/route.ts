import { NextRequest, NextResponse } from 'next/server';
import { fetchWooCommerce } from '@/lib/woocommerce';
import { mapWooCommerceProduct } from '@/lib/mappers';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const per_page = searchParams.get('per_page') || '20';
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  try {
    const params: any = { page, per_page, status: 'publish' };
    if (search) params.search = search;
    
    // Si hay categoría, primero resolvemos el ID
    if (category) {
      const categories = await fetchWooCommerce('products/categories', { slug: category });
      if (categories && categories.length > 0) {
        params.category = categories[0].id.toString();
      }
    }

    const data = await fetchWooCommerce('products', params);
    const products = Array.isArray(data) ? data.map(mapWooCommerceProduct) : [];

    return NextResponse.json(products, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' }
    });
  } catch (error: any) {
    console.error('API Products Error:', error.message);
    return NextResponse.json({ error: 'Catálogo temporalmente no disponible' }, { status: 502 });
  }
}

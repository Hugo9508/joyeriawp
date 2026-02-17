import { NextRequest, NextResponse } from 'next/server';
import { fetchWooCommerce } from '@/lib/woocommerce';
import { mapWooCommerceProduct } from '@/lib/mappers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const page = searchParams.get('page') || '1';
  const per_page = searchParams.get('per_page') || '50';

  try {
    const params: any = { page, per_page };
    if (search) params.search = search;
    if (category) params.category = category;

    const wooProducts = await fetchWooCommerce('products', params);
    const normalizedProducts = wooProducts.map(mapWooCommerceProduct);

    return NextResponse.json(normalizedProducts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

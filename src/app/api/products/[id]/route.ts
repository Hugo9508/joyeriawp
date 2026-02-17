import { NextRequest, NextResponse } from 'next/server';
import { fetchWooCommerce } from '@/lib/woocommerce';
import { mapWooCommerceProduct } from '@/lib/mappers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const wooProduct = await fetchWooCommerce(`products/${id}`);
    const normalizedProduct = mapWooCommerceProduct(wooProduct);

    return NextResponse.json(normalizedProduct);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

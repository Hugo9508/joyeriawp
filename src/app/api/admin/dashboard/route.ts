import { NextResponse } from 'next/server';
import { fetchWooCommerce } from '@/lib/woocommerce';

export async function GET() {
  try {
    const { data } = await fetchWooCommerce('products', { per_page: '100' });
    const productsArray = Array.isArray(data) ? data : [];

    const stats = productsArray.reduce((acc: any, p: any) => {
      const price = parseFloat(p.price || "0");
      const stock = p.stock_quantity || 0;
      
      acc.totalValue += (price * (stock || 1));
      if (p.stock_status === 'instock') acc.inStock++;
      if (p.stock_status === 'onbackorder') acc.onBackorder++;
      if (p.stock_status === 'outofstock') acc.outOfStock++;
      
      return acc;
    }, {
      total: productsArray.length,
      inStock: 0,
      onBackorder: 0,
      outOfStock: 0,
      totalValue: 0
    });

    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

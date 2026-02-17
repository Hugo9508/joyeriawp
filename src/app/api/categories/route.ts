import { NextResponse } from 'next/server';
import { fetchWooCommerce } from '@/lib/woocommerce';

export async function GET() {
  try {
    const wooCategories = await fetchWooCommerce('products/categories', {
      hide_empty: 'false', // Mostramos todas en el admin
      per_page: '100'
    });

    const categories = wooCategories.map((cat: any) => ({
      name: cat.name,
      value: cat.slug,
      id: cat.id
    }));

    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newCategory = await fetchWooCommerce('products/categories', {}, 'POST', {
      name: body.name,
      slug: body.value
    });
    return NextResponse.json(newCategory);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

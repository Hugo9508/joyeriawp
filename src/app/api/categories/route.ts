import { NextResponse } from 'next/server';
import { fetchWooCommerce } from '@/lib/woocommerce';

export async function GET() {
  try {
    const wooCategories = await fetchWooCommerce('products/categories', {
      hide_empty: 'false',
      per_page: '100'
    });

    const categoriesArray = Array.isArray(wooCategories) ? wooCategories : [];
    const categories = categoriesArray.map((cat: any) => ({
      name: cat.name,
      value: cat.slug,
      id: cat.id
    }));

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("API Categories Error:", error.message);
    return NextResponse.json(
      { error: "Error al cargar categorías de WooCommerce." }, 
      { status: 500 }
    );
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
    console.error("API Categories POST Error:", error.message);
    return NextResponse.json(
      { error: "Error al crear la categoría." }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "ID de categoría requerido." }, { status: 400 });
    }

    // Nota: WooCommerce requiere el ID numérico para eliminar. 
    // Si pasas el slug, este endpoint podría fallar dependiendo de la lógica de negocio.
    const deletedCategory = await fetchWooCommerce(`products/categories/${id}`, { force: 'true' }, 'DELETE');
    return NextResponse.json(deletedCategory);
  } catch (error: any) {
    console.error("API Categories DELETE Error:", error.message);
    return NextResponse.json(
      { error: "Error al eliminar la categoría de WooCommerce." }, 
      { status: 500 }
    );
  }
}

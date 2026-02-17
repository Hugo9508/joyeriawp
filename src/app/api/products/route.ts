import { NextRequest, NextResponse } from 'next/server';
import { fetchWooCommerce, getCategoryIdBySlug } from '@/lib/woocommerce';
import { mapWooCommerceProduct } from '@/lib/mappers';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const per_page = searchParams.get('per_page') || '20';
  const categorySlug = searchParams.get('category');
  const search = searchParams.get('search');

  try {
    const params: any = { 
      page, 
      per_page, 
      status: 'publish',
      _fields: 'id,name,slug,sku,price,regular_price,sale_price,on_sale,stock_status,stock_quantity,categories,images,attributes,description,short_description,featured'
    };
    
    if (search) params.search = search;
    
    // RESOLUCIÓN OPTIMIZADA: Buscamos el ID en el mapa de memoria en lugar de llamar a la API
    if (categorySlug) {
      const categoryId = await getCategoryIdBySlug(categorySlug);
      if (categoryId) {
        params.category = categoryId;
      } else {
        // Si no existe la categoría, devolvemos array vacío rápido sin llamar a Woo
        return NextResponse.json([], { headers: { 'X-Cache': 'RESOLVED-EMPTY' } });
      }
    }

    const data = await fetchWooCommerce('products', params);
    const products = Array.isArray(data) ? data.map(mapWooCommerceProduct) : [];

    return NextResponse.json(products, {
      headers: { 
        'Cache-Control': 'no-store',
        'X-Cache': 'DYNAMIC',
        'X-Runtime': 'nodejs'
      }
    });
  } catch (error: any) {
    console.error('API Products Error:', error.message);
    return NextResponse.json({ 
      error: "El catálogo no está disponible temporalmente. Por favor, intente de nuevo." 
    }, { status: 502 });
  }
}

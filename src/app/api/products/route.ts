import { NextRequest, NextResponse } from 'next/server';
import { fetchWooCommerce } from '@/lib/woocommerce';
import { mapWooCommerceProduct } from '@/lib/mappers';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const per_page = searchParams.get('per_page') || '20'; // Reducido para Hostinger
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  try {
    const params: any = { 
      page, 
      per_page, 
      status: 'publish',
      _fields: 'id,name,slug,sku,price,regular_price,sale_price,on_sale,stock_status,stock_quantity,categories,images,attributes,description,short_description,featured'
    };
    
    if (search) params.search = search;
    
    // Resolución de categoría si se provee slug
    if (category) {
      const categories = await fetchWooCommerce('products/categories', { slug: category });
      if (categories && Array.isArray(categories) && categories.length > 0) {
        params.category = categories[0].id.toString();
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
    
    let status = 502;
    let message = "El catálogo no está disponible temporalmente.";

    if (error.message.includes('CONFIG_MISSING')) {
      status = 500;
      message = "Error de configuración: Faltan credenciales en el servidor.";
    }

    return NextResponse.json({ error: message, details: error.message }, { status });
  }
}

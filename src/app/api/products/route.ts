
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
    
    if (categorySlug) {
      const categoryId = await getCategoryIdBySlug(categorySlug);
      if (categoryId) {
        params.category = categoryId;
      } else {
        // Si no existe la categoría, devolvemos vacío en lugar de error
        return NextResponse.json([]);
      }
    }

    const data = await fetchWooCommerce('products', params);
    
    if (!Array.isArray(data)) {
        console.error("WooCommerce devolvió un formato no esperado:", data);
        return NextResponse.json({ error: "Formato de datos inválido" }, { status: 502 });
    }

    const products = data.map(mapWooCommerceProduct);

    return NextResponse.json(products, {
      headers: { 
        'Cache-Control': 'no-store',
        'X-Cache': 'BFF-DIRECT'
      }
    });
  } catch (error: any) {
    console.error('API Products Critical Failure:', error.message);
    return NextResponse.json({ 
      error: "Error de conexión con el catálogo.",
      detail: error.message 
    }, { status: 502 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { fetchWooCommerce } from '@/lib/woocommerce';
import { mapWooCommerceProduct } from '@/lib/mappers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';
  const categorySlug = searchParams.get('category') || '';
  const page = searchParams.get('page') || '1';
  
  // Reducimos per_page a 20 para mejorar performance en Hostinger
  const per_page = searchParams.get('per_page') || '20';

  try {
    const queryParams: any = { 
      page, 
      per_page, 
      status: 'publish',
      _fields: 'id,name,slug,price,regular_price,sale_price,on_sale,stock_status,stock_quantity,categories,images,attributes,description,short_description,featured,date_on_sale_from_gmt,date_on_sale_to_gmt'
    };
    
    if (search) queryParams.search = search;
    
    let cacheOrigin: string = 'MISS';

    // 1. Resolución de Categoría (con cache automático)
    if (categorySlug) {
      try {
        const catResult = await fetchWooCommerce('products/categories', { slug: categorySlug });
        if (Array.isArray(catResult.data) && catResult.data.length > 0) {
          queryParams.category = catResult.data[0].id.toString();
        }
      } catch (catError) {
        console.error("Error resolviendo categoría:", catError);
      }
    }

    // 2. Obtener Productos
    const { data, cacheStatus } = await fetchWooCommerce('products', queryParams);
    cacheOrigin = cacheStatus;
    
    const productsArray = Array.isArray(data) ? data : [];
    const normalizedProducts = productsArray.map(mapWooCommerceProduct);

    // 3. Respuesta con Headers de Cache
    return NextResponse.json(normalizedProducts, {
      headers: {
        'X-Cache': cacheOrigin,
        // Cache de navegador/CDN: 1 minuto fresco, 2 minutos stale
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error: any) {
    console.error("API Products Route Error:", error.message);
    
    // Si es un error de timeout o 503 del backend, enviamos 502 Bad Gateway
    const status = error.message.includes('HTTP 503') || error.name === 'TimeoutError' ? 502 : 500;
    
    return NextResponse.json(
      { error: "El catálogo está experimentando alta demanda. Por favor, intente de nuevo en unos instantes." }, 
      { status }
    );
  }
}

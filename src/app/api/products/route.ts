import { NextRequest, NextResponse } from 'next/server';
import { fetchWooCommerce } from '@/lib/woocommerce';
import { mapWooCommerceProduct } from '@/lib/mappers';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';
  const categorySlug = searchParams.get('category') || '';
  const page = searchParams.get('page') || '1';
  const per_page = searchParams.get('per_page') || '20';

  try {
    const queryParams: any = { 
      page, 
      per_page, 
      status: 'publish',
      _fields: 'id,name,slug,price,regular_price,sale_price,on_sale,stock_status,stock_quantity,categories,images,attributes,description,short_description,featured,date_on_sale_from_gmt,date_on_sale_to_gmt'
    };
    
    if (search) queryParams.search = search;
    
    if (categorySlug) {
      try {
        const { data: catData } = await fetchWooCommerce('products/categories', { slug: categorySlug });
        if (Array.isArray(catData) && catData.length > 0) {
          queryParams.category = catData[0].id.toString();
        }
      } catch (catError) {
        console.error("Error resolviendo categoría:", catError);
      }
    }

    const { data, status } = await fetchWooCommerce('products', queryParams);
    
    const productsArray = Array.isArray(data) ? data : [];
    const normalizedProducts = productsArray.map(mapWooCommerceProduct);

    return NextResponse.json(normalizedProducts, {
      headers: {
        'X-Cache': status,
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error: any) {
    console.error("API Products Route Error:", error.message);
    const isTimeout = error.name === 'TimeoutError' || error.message.includes('timeout');
    return NextResponse.json(
      { error: "El catálogo no está disponible temporalmente. Por favor, intente de nuevo." }, 
      { status: isTimeout ? 502 : 500 }
    );
  }
}

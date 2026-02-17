
import { NextRequest, NextResponse } from 'next/server';
import { fetchWooCommerce } from '@/lib/woocommerce';
import { mapWooCommerceProduct } from '@/lib/mappers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';
  const categorySlug = searchParams.get('category') || '';
  const page = searchParams.get('page') || '1';
  const per_page = searchParams.get('per_page') || '50';

  try {
    const params: any = { 
      page, 
      per_page, 
      status: 'publish',
      _fields: 'id,name,slug,price,regular_price,sale_price,on_sale,stock_status,stock_quantity,categories,images,attributes,description,short_description,featured,date_on_sale_from_gmt,date_on_sale_to_gmt'
    };
    
    if (search) params.search = search;
    
    // Resolución de Slug a ID para WooCommerce
    if (categorySlug) {
      try {
        const categories = await fetchWooCommerce('products/categories', { slug: categorySlug });
        if (Array.isArray(categories) && categories.length > 0) {
          params.category = categories[0].id.toString();
        }
      } catch (catError) {
        console.error("Error resolviendo slug de categoría:", catError);
      }
    }

    const wooProducts = await fetchWooCommerce('products', params);
    
    const productsArray = Array.isArray(wooProducts) ? wooProducts : [];
    const normalizedProducts = productsArray.map(mapWooCommerceProduct);

    return NextResponse.json(normalizedProducts, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error: any) {
    console.error("API Products Route Error:", error.message);
    return NextResponse.json(
      { error: "Error de conexión con el catálogo de Joyeria Alianza." }, 
      { status: 500 }
    );
  }
}

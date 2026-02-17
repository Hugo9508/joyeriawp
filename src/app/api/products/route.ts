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
    const params: any = { page, per_page, status: 'publish' };
    if (search) params.search = search;
    
    // Si tenemos un slug de categoría, necesitamos encontrar su ID numérico primero
    // porque la API de WooCommerce v3 espera IDs para el parámetro 'category'.
    if (categorySlug) {
      try {
        const categories = await fetchWooCommerce('products/categories', { slug: categorySlug });
        if (Array.isArray(categories) && categories.length > 0) {
          params.category = categories[0].id.toString();
        }
      } catch (catError) {
        console.error("Error resolviendo slug de categoría:", catError);
        // Si falla la resolución del slug, intentamos traer todo y filtrar luego 
        // o dejar que WC maneje el error devolviendo vacío de forma segura.
      }
    }

    const wooProducts = await fetchWooCommerce('products', params);
    
    // Asegurarnos de que wooProducts sea un arreglo antes de mapear
    // WooCommerce a veces devuelve un objeto de error si los parámetros son inválidos
    const productsArray = Array.isArray(wooProducts) ? wooProducts : [];
    const normalizedProducts = productsArray.map(mapWooCommerceProduct);

    return NextResponse.json(normalizedProducts);
  } catch (error: any) {
    console.error("API Products Route Error:", error.message);
    return NextResponse.json(
      { error: "Error de conexión con el catálogo." }, 
      { status: 500 }
    );
  }
}

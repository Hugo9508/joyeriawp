import { Product, StockStatus } from './products';

export function mapWooCommerceProduct(wooProduct: any): Product {
  const regularPrice = parseFloat(wooProduct.regular_price || wooProduct.price || "0");
  const promoPrice = wooProduct.sale_price ? parseFloat(wooProduct.sale_price) : undefined;
  const priceVal = promoPrice || regularPrice;
  
  let stockStatus: StockStatus = 'in_stock';
  if (wooProduct.stock_status === 'outofstock') stockStatus = 'out_of_stock';
  if (wooProduct.stock_status === 'onbackorder') stockStatus = 'on_backorder';

  const getAttr = (name: string) => {
    return wooProduct.attributes?.find((a: any) => 
      a.name.toLowerCase() === name.toLowerCase() || 
      a.slug === `pa_${name.toLowerCase()}`
    )?.options?.[0] || '';
  };

  return {
    id: wooProduct.id.toString(),
    name: wooProduct.name,
    brand: 'Aurum Luz',
    description: wooProduct.description?.replace(/<[^>]*>?/gm, '') || '',
    price: {
      usd: priceVal,
      uyu: priceVal
    },
    regularPrice: regularPrice,
    promoPrice: promoPrice,
    stockStatus: stockStatus,
    stockQuantity: wooProduct.stock_quantity || 0,
    category: wooProduct.categories?.[0]?.name || 'General',
    categories: wooProduct.categories?.map((c: any) => c.slug) || [],
    material: getAttr('Material'),
    stone: getAttr('Piedra'),
    details: {
      metal: getAttr('Material'),
      stoneWeight: getAttr('peso-piedra') || 'N/A',
      clarity: getAttr('claridad') || 'N/A',
      size: getAttr('talla') || 'A medida'
    },
    imageIds: [],
    images: wooProduct.images?.map((img: any) => img.src) || [],
    slug: wooProduct.slug,
    sku: wooProduct.sku,
    isBestseller: wooProduct.featured
  };
}

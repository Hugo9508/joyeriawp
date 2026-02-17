
import type { Product } from '@/lib/products';
import { appSettings } from '@/lib/settings';

/**
 * Gestiona el inicio de chat de WhatsApp con la información del producto de WooCommerce.
 */
export const handleWhatsAppChat = (product: Product) => {
  const phoneNumber = appSettings.whatsAppNumber;
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://joyeria.a380.com.br';
  
  // Incluimos SKU y URL pública del producto para que el vendedor lo identifique rápido
  const productUrl = `${siteUrl}/products/${product.id}`;
  const skuText = product.sku ? `\n*SKU:* ${product.sku}` : '';
  
  const message = `Hola, vengo de la tienda virtual y quisiera más información sobre esta pieza:\n\n*Producto:* ${product.name}\n*Precio:* U$S ${product.price.usd.toLocaleString()}${skuText}\n*Link:* ${productUrl}\n\nGracias.`;
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  
  window.open(whatsappUrl, '_blank');
};

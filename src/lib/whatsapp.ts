
'use client';

import type { Product } from '@/lib/products';
import { appSettings } from '@/lib/settings';

/**
 * Gestiona el inicio de chat de WhatsApp con la información del producto.
 * Ahora emite un evento personalizado para que el ChatWidget capture el mensaje.
 */
export const handleWhatsAppChat = (product: Product) => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://joyeria.a380.com.br';
  const productUrl = `${siteUrl}/products/${product.id}`;
  const skuText = product.sku ? `\n*SKU:* ${product.sku}` : '';
  
  const message = `Hola, vengo de la tienda virtual y quisiera más información sobre esta pieza:\n\n*Producto:* ${product.name}\n*Precio:* U$S ${product.price.usd.toLocaleString()}${skuText}\n*Link:* ${productUrl}\n\nGracias.`;
  
  // Emitir evento para el ChatWidget
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('open-chat-with-message', { 
      detail: { message, product } 
    });
    window.dispatchEvent(event);
  }
};

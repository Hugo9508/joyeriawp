'use client';

import type { Product } from '@/lib/products';

/**
 * @fileOverview Lógica para gestionar la intención de chat de WhatsApp.
 * Bloquea el redireccionamiento externo y lo canaliza al ChatWidget interno mediante eventos.
 */

export const handleWhatsAppChat = (product: Product) => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://joyeria.a380.com.br';
  const productUrl = `${siteUrl}/products/${product.id}`;
  const skuText = product.sku ? `\n*SKU:* ${product.sku}` : '';
  
  // Mensaje estructurado para que el asesor sepa qué pieza está viendo el cliente
  const message = `Hola, quisiera más información sobre esta pieza:\n\n*Producto:* ${product.name}\n*Precio:* U$S ${product.price.usd.toLocaleString()}${skuText}\n*Enlace:* ${productUrl}\n\nGracias.`;
  
  // Emitimos un evento personalizado que el ChatWidget capturará
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('open-chat-with-message', { 
      detail: { message, product } 
    });
    window.dispatchEvent(event);
  }
};

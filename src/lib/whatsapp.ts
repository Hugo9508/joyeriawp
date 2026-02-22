'use client';

import type { Product } from '@/lib/products';

/**
 * @fileOverview Lógica para gestionar la intención de chat de WhatsApp.
 * Bloquea el redireccionamiento externo y lo canaliza al ChatWidget interno mediante eventos.
 */

export const handleWhatsAppChat = (product: Product) => {
  // Mensaje limpio para Dify — solo intención del usuario, sin metadatos
  const message = `Hola, me interesa la pieza ${product.name}. ¿Podrías darme más información?`;

  // Emitimos un evento personalizado que el ChatWidget capturará
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('open-chat-with-message', {
      detail: { message, product }
    });
    window.dispatchEvent(event);
  }
};

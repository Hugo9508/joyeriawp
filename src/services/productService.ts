import { Product, Category } from "@/lib/products";

/**
 * Servicio de datos para el Frontend.
 * Consume los Route Handlers internos que actúan como proxy para WooCommerce.
 */

export const getProducts = async (filters: { search?: string, category?: string, page?: number, per_page?: number } = {}): Promise<Product[]> => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.per_page) params.append('per_page', filters.per_page.toString());

  try {
    const response = await fetch(`/api/products?${params.toString()}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn("Error en la API de productos:", errorData.error || response.statusText);
      return []; // Devolvemos vacío en lugar de lanzar error para no romper la UI
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error de red en getProducts:", error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await fetch(`/api/products/${id}`, {
      cache: 'no-store'
    });
    if (!response.ok) {
      console.warn(`Producto ${id} no encontrado o error en API`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Error de red en getProductById (${id}):`, error);
    return null;
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch('/api/categories', {
      cache: 'no-store'
    });
    if (!response.ok) {
      console.warn("Error en la API de categorías");
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error de red en getCategories:", error);
    return [];
  }
};

export const saveCategory = async (data: { name: string, value: string }) => {
  try {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al guardar categoría');
    }
    return await response.json();
  } catch (error) {
    console.error("Error al guardar categoría:", error);
    throw error;
  }
};

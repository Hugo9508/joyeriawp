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
      cache: 'no-store' // Asegura datos frescos en el catálogo
    });
    if (!response.ok) throw new Error('Error al cargar productos desde la API');
    return await response.json();
  } catch (error) {
    console.error("Error en getProducts:", error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await fetch(`/api/products/${id}`, {
      cache: 'no-store'
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Error en getProductById (${id}):`, error);
    return null;
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch('/api/categories', {
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Error al cargar categorías');
    return await response.json();
  } catch (error) {
    console.error("Error en getCategories:", error);
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
    if (!response.ok) throw new Error('Error al guardar categoría');
    return await response.json();
  } catch (error) {
    console.error("Error al guardar categoría:", error);
    throw error;
  }
};

import { Product, Category } from "@/lib/products";

export const getProducts = async (filters: { search?: string, category?: string } = {}): Promise<Product[]> => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);

  try {
    const response = await fetch(`/api/products?${params.toString()}`);
    if (!response.ok) throw new Error('Error al cargar productos');
    return response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    return null;
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch('/api/categories');
    if (!response.ok) throw new Error('Error al cargar categorías');
    return response.json();
  } catch (error) {
    return [];
  }
};

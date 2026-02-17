export type StockStatus = 'in_stock' | 'out_of_stock' | 'on_backorder';

export type Category = {
  name: string;
  value: string;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: {
    usd: number;
    uyu: number;
  };
  regularPrice: number; // Precio Normal (R$ o Moneda base)
  promoPrice?: number;  // Precio Promocional
  stockStatus: StockStatus;
  stockQuantity: number; // Cantidad total en inventario
  category: string;
  categories: string[]; // Selección múltiple
  material: string;
  stone: string;
  details: {
    metal: string;
    stoneWeight: string;
    clarity: string;
    size: string;
  };
  imageIds: string[]; // Para compatibilidad con placeholders existentes
  images: string[];   // Lista de URLs de imágenes
  isBestseller?: boolean;
};

export const products: Product[] = [
  {
    id: 'solitario-oro-brillante',
    name: 'Solitario Royal Oro 18k',
    brand: 'Aurum Luz',
    price: { usd: 1150, uyu: 45000 },
    regularPrice: 45000,
    promoPrice: 39900,
    stockStatus: 'in_stock',
    stockQuantity: 5,
    description: 'La pieza definitiva de compromiso. Oro 18k de la más alta pureza con un brillante central seleccionado por su fuego y claridad excepcionales.',
    category: 'anillos',
    categories: ['anillos', 'diamantes', 'compromiso'],
    material: 'Oro 18k',
    stone: 'Brillante',
    details: {
      metal: 'Oro 18k Macizo',
      stoneWeight: '0.50 Quilates',
      clarity: 'VVS1',
      size: 'A medida'
    },
    imageIds: ['featured-1'],
    images: ['https://images.unsplash.com/photo-1600143674013-a690b5d25104'],
    isBestseller: true,
  },
  {
    id: 'cadena-forcet-oro-18k',
    name: 'Cadena Forcet Oro 18k',
    brand: 'Aurum Luz',
    price: { usd: 565, uyu: 22000 },
    regularPrice: 22000,
    stockStatus: 'in_stock',
    stockQuantity: 12,
    description: 'Cadena modelo Forcet en oro 18k, una pieza clásica y resistente ideal para el uso diario o para combinar con tus colgantes favoritos.',
    category: 'collares',
    categories: ['collares', 'oro'],
    material: 'Oro 18k',
    stone: 'N/A',
    details: {
      metal: 'Oro 18k',
      stoneWeight: 'N/A',
      clarity: 'N/A',
      size: '45cm o 50cm'
    },
    imageIds: ['featured-2'],
    images: ['https://images.unsplash.com/photo-1600862754152-80a263dd564f'],
    isBestseller: true,
  },
];

export const categories: Category[] = [
  { name: 'Anillos', value: 'anillos' },
  { name: 'Collares', value: 'collares' },
  { name: 'Caravanas', value: 'caravanas' },
  { name: 'Pulseras', value: 'pulseras' },
];
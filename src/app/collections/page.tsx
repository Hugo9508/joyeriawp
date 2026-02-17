'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts, getCategories } from '@/services/productService';
import { Product, Category } from '@/lib/products';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WhatsappIcon } from '@/components/icons';
import { LayoutGrid, Eye, Package } from 'lucide-react';
import { VirtualTryOn } from '@/components/virtual-try-on';
import { WhatsAppProductButton } from '@/components/whatsapp-product-button';

function FilterContent({ categories }: { categories: Category[] }) {
    return (
        <div className="space-y-8">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-medium tracking-wide uppercase">Filtros</h2>
              <Link href="/collections" className="text-xs text-primary hover:underline">Limpiar</Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <LayoutGrid className="h-5 w-5" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">Categorías</h3>
              </div>
              <ul className="space-y-2 pl-2">
                {categories.map((cat) => (
                  <li key={cat.value}>
                    <Link className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1" href={`/collections?category=${cat.value}`}>
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
        </div>
    );
}

function CollectionsContent() {
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const categoryFilter = searchParams.get('category');

  useEffect(() => {
    async function loadData() {
      const [prodData, catData] = await Promise.all([getProducts(), getCategories()]);
      setAllProducts(prodData);
      setAllCategories(catData);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!categoryFilter) return allProducts;
    return allProducts.filter(p => 
      p.category === categoryFilter || 
      (p.categories && p.categories.includes(categoryFilter))
    );
  }, [allProducts, categoryFilter]);

  return (
    <div className="bg-background text-foreground min-h-screen pt-20">
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row">
        <aside className="hidden lg:block w-72 flex-shrink-0 border-r p-6">
          <div className="sticky top-24">
            <FilterContent categories={allCategories} />
          </div>
        </aside>

        <section className="flex-1 p-4 md:p-6 lg:p-10">
          <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-light text-foreground tracking-tight">
                Colección <span className="font-serif italic text-primary">Eterna</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {!loading ? (
              filteredProducts.map((product) => (
                <div key={product.id} className="group flex flex-col gap-4">
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary rounded-lg">
                    <Link href={`/products/${product.id}`}>
                        <Image
                        src={product.images?.[0] || 'https://placehold.co/600x800?text=No+Img'}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        unoptimized
                        />
                    </Link>
                    <div className="absolute top-3 right-3 z-10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <VirtualTryOn product={product}>
                        <Button size="icon" className="h-10 w-10 bg-white/90 rounded-full shadow-lg text-foreground">
                            <Eye className="h-5 w-5" />
                        </Button>
                      </VirtualTryOn>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 px-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-base font-medium text-foreground">
                        <Link href={`/products/${product.id}`}>{product.name}</Link>
                      </h3>
                      <span className="text-sm font-semibold text-primary">
                        $U {(product.price?.uyu || product.regularPrice).toLocaleString()}
                      </span>
                    </div>
                    <WhatsAppProductButton product={product} className="mt-3 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-widest h-10">
                      Consultar
                      <WhatsappIcon className="w-4 h-4 fill-current ml-2" />
                    </WhatsAppProductButton>
                  </div>
                </div>
              ))
            ) : (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-lg" />
              ))
            )}
          </div>

          {!loading && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Package className="h-16 w-16 opacity-10 mb-4" />
                  <p>No se encontraron piezas.</p>
              </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando colección...</div>}>
      <CollectionsContent />
    </Suspense>
  );
}

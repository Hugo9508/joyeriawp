'use client';

import { useState, useEffect } from 'react';
import { getProducts } from '@/services/productService';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/products';

const heroImage = PlaceHolderImages.find(p => p.id === 'hero-1');
const personalizedServiceImage = PlaceHolderImages.find(p => p.id === 'service-1');

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const allProducts = await getProducts({ per_page: 3 });
        setFeaturedProducts(allProducts);
      } catch (error) {
        console.error("Error cargando destacados:", error);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[90vh] md:h-screen w-full overflow-hidden bg-foreground">
        {heroImage && (
            <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover brightness-75"
                priority
            />
        )}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative flex h-full flex-col items-center justify-center text-center text-white p-6">
          <h2 className="mb-4 md:mb-8 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-primary animate-fade-in-up">
            Alta Joyería Montevideo
          </h2>
          <h1 className="font-headline text-4xl leading-tight text-white md:text-7xl lg:text-8xl mb-6 md:mb-8 max-w-5xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Luminosidad <span className="italic font-light">Etérea</span>
          </h1>
          <p className="mb-8 md:mb-12 max-w-sm md:max-w-lg text-xs md:text-sm font-light leading-relaxed md:leading-loose tracking-wide text-gray-200 md:text-base animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Descubra piezas únicas diseñadas para capturar la luz y celebrar sus momentos más memorables.
          </p>
          <div className="flex animate-fade-in-up flex-col gap-4 md:flex-row" style={{ animationDelay: '0.6s' }}>
            <Button asChild size="lg" variant="outline" className="bg-white text-foreground hover:bg-primary hover:text-white border-none uppercase tracking-[0.2em] font-bold text-[10px] md:text-xs">
              <Link href="/collections">Explorar Catálogo</Link>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 transform">
            <div className="flex animate-bounce flex-col items-center gap-2">
                <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-white/60">Descubrir</span>
                <ArrowDown className="h-3 w-3 md:h-4 md:w-4 text-white/60" />
            </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-32 bg-background">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-4 md:gap-6">
            <div className="max-w-xl">
              <span className="block text-primary text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-2">
                Colección Exclusiva
              </span>
              <h2 className="font-headline text-3xl md:text-4xl text-foreground leading-tight">Piezas Destacadas</h2>
            </div>
            <Link href="/collections" className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] border-b border-foreground/20 pb-1 hover:border-primary hover:text-primary transition-all">
                Ver Catálogo Completo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 md:gap-y-16">
            {!loading ? (
              featuredProducts.length > 0 ? (
                featuredProducts.map((product, index) => (
                  <div key={product.id} className={index === 1 ? 'lg:mt-16' : ''}>
                      <ProductCard product={product} />
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-muted-foreground">
                    Próximamente nuevas piezas en nuestro catálogo.
                </div>
              )
            ) : (
                <div className="col-span-full py-20 text-center text-muted-foreground animate-pulse">
                    Cargando piezas exclusivas...
                </div>
            )}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="bg-secondary py-16 md:py-24 border-t">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-10 md:gap-16 lg:gap-24">
            <div className="w-full lg:w-1/2 relative">
              <div className="aspect-[4/5] overflow-hidden shadow-lg rounded-lg">
                {personalizedServiceImage && <Image
                  alt={personalizedServiceImage.description}
                  className="w-full h-full object-cover"
                  src={personalizedServiceImage.imageUrl}
                  width={600}
                  height={750}
                />}
              </div>
            </div>
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <span className="block text-primary text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-4">Experiencia Personalizada</span>
              <h2 className="font-headline text-2xl md:text-5xl text-foreground leading-tight mb-6">Joyas con alma y propósito</h2>
              <p className="text-base md:text-lg font-light leading-relaxed mb-6 md:mb-8 text-muted-foreground">
                Cada pieza en Aurum Luz es seleccionada por su calidad excepcional y su capacidad para contar una historia única. Nuestro compromiso es brindarle no solo una joya, sino una herencia.
              </p>
              <Button asChild size="lg" className="bg-foreground text-background hover:bg-primary uppercase tracking-[0.2em] font-bold text-[10px]">
                  <Link href="/collections">Ir a Colecciones</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

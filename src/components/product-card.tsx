import type { Product } from "@/lib/products";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VirtualTryOn } from "@/components/virtual-try-on";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const placeholderImage = product.imageIds && product.imageIds.length > 0 
    ? PlaceHolderImages.find(p => p.id === product.imageIds[0])
    : null;
    
  const displayImageUrl = (product.images && product.images.length > 0)
    ? product.images[0]
    : (placeholderImage?.imageUrl || 'https://placehold.co/600x800?text=No+Img');

  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-6 rounded-lg">
        <Link href={`/products/${product.id}`}>
            <Image
                src={displayImageUrl}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            />
        </Link>
        {product.isBestseller && (
            <Badge variant="secondary" className="absolute top-4 right-4 text-xs uppercase tracking-widest shadow-sm">
                Más Vendido
            </Badge>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
            <VirtualTryOn product={product}>
              <Button variant="secondary" className="w-full backdrop-blur-sm bg-white/80 hover:bg-white text-foreground">
                  Prueba Virtual
              </Button>
            </VirtualTryOn>
            <Button variant="secondary" className="w-full backdrop-blur-sm bg-white/80 hover:bg-white text-foreground">
                Añadir a Lista de Deseos
            </Button>
        </div>
      </div>
      <div className="text-center">
        <h3 className="font-headline text-xl text-foreground mb-1">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          {product.material} • {product.stone}
        </p>
        <p className="text-primary font-medium">
          USD {product.price.usd.toLocaleString()} / UYU {product.price.uyu.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

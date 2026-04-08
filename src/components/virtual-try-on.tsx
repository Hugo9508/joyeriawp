"use client";

import { useState, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gem } from 'lucide-react';
import type { Product } from '@/lib/products';

interface VirtualTryOnProps {
  children: ReactNode;
  product: Product;
}

export function VirtualTryOn({ children, product }: VirtualTryOnProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border-primary/20">
        <DialogHeader className="flex flex-col items-center justify-center pt-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Gem className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <DialogTitle className="font-headline text-3xl text-center mb-2 tracking-tight">Próximamente</DialogTitle>
          <div className="space-y-4 px-4">
            <p className="text-muted-foreground text-center text-sm leading-relaxed">
              Estamos perfeccionando la experiencia de <span className="font-semibold text-foreground">Prueba Virtual</span> para el <span className="italic">{product.name}</span>.
            </p>
            <p className="text-muted-foreground text-center text-xs font-light tracking-wide uppercase">
              Lujo digital en desarrollo
            </p>
          </div>
        </DialogHeader>
        <div className="py-6 text-center px-6">
            <p className="text-xs md:text-sm font-light leading-relaxed text-muted-foreground/80 italic">
                "Pronto podrá descubrir cómo nuestras piezas capturan la luz sobre su propia piel, desde la intimidad de su hogar."
            </p>
        </div>
        <div className="flex justify-center pb-8">
            <Button 
                onClick={() => setOpen(false)} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-[0.2em] font-bold text-[10px] h-11 px-10 rounded-none shadow-lg shadow-primary/20"
            >
                Cerrar
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

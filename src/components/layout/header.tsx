"use client";

import { cn } from "@/lib/utils";
import { Gem, Heart, Menu, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/collections", label: "Colecciones" },
  { href: "/contact", label: "Contacto" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  
  const isHome = pathname === '/';
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Evitar renderizado inconsistente durante la hidratación en rutas admin
  if (isAdmin) {
    return null;
  }

  const headerClasses = cn(
    "fixed top-0 w-full z-50 transition-all duration-300 group",
    isHome && !isScrolled
      ? "text-white bg-transparent"
      : "text-foreground bg-background/90 backdrop-blur-sm shadow-sm"
  );
  
  const logoClasses = cn(
      "font-headline tracking-[0.2em] uppercase font-light transition-all duration-300",
      isHome && !isScrolled ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
  );

  return (
    <header className={headerClasses}>
      {isHome && !isScrolled && (
         <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent pointer-events-none group-hover:hidden transition-opacity duration-300"></div>
      )}
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className={cn("flex items-center justify-between", isHome && !isScrolled ? "h-20 md:h-24" : "h-16 md:h-20")}>
          <nav className="hidden lg:flex items-center gap-10 flex-1">
            <Link href="/collections" className="text-xs font-semibold tracking-[0.15em] uppercase hover:text-primary transition-colors">
                Colecciones
            </Link>
          </nav>
          
          <div className="lg:hidden flex-1">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="-ml-2 hover:text-primary">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Abrir menú</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] bg-background">
                    <div className="flex flex-col h-full pt-4">
                        <Link href="/" className="flex items-center gap-2 mb-10">
                            <Gem className="text-primary h-6 w-6" />
                            <span className="font-headline text-2xl tracking-widest uppercase">Aurum Luz</span>
                        </Link>
                        <nav className="flex flex-col gap-8">
                            {navLinks.map(link => (
                                <Link key={link.href} href={link.href} className="text-sm font-bold tracking-[0.2em] uppercase hover:text-primary transition-colors border-b border-muted pb-4">
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                        <div className="mt-auto pb-10">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Montevideo, Uruguay</p>
                            <Link href="/admin" className="text-xs font-semibold uppercase tracking-widest text-primary">Panel Admin</Link>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
          </div>

          <div className="flex-shrink-0 flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            <Link href="/" className="flex flex-col items-center group/logo transition-all duration-300">
                <span className={logoClasses}>
                    Aurum Luz
                </span>
            </Link>
          </div>

          <div className="flex items-center justify-end gap-1 md:gap-2 flex-1">
            <nav className="hidden lg:flex items-center gap-10 mr-4">
                <Link href="/contact" className="text-xs font-semibold tracking-[0.15em] uppercase hover:text-primary transition-colors">
                    Contacto
                </Link>
            </nav>
            <Button variant="ghost" size="icon" className="hidden sm:flex hover:text-primary h-9 w-9">
              <Search className="h-4 w-4 md:h-5 md:w-5" />
              <span className="sr-only">Buscar</span>
            </Button>
            <Button variant="ghost" size="icon" className="hover:text-primary h-9 w-9">
              <Heart className="h-4 w-4 md:h-5 md:w-5" />
              <span className="sr-only">Favoritos</span>
            </Button>
             <Button asChild variant="ghost" size="icon" className="hover:text-primary h-9 w-9">
              <Link href="/admin">
                <User className="h-4 w-4 md:h-5 md:w-5" />
                <span className="sr-only">Admin</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

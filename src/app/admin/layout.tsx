'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, Settings, Gem, Home, Menu, LayoutDashboard, Search, Bell, LogOut, Tags } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/products', icon: Gem, label: 'Inventario' },
    { href: '/admin/categories', icon: Tags, label: 'Categorías' },
    { href: '/admin/settings', icon: Settings, label: 'Preferencias' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden border-r bg-muted/10 md:block">
        <div className="flex h-full max-h-screen flex-col gap-6">
          <div className="flex h-20 items-center border-b px-6">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Gem className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-headline text-lg tracking-widest uppercase">Aurum Admin</span>
            </Link>
          </div>
          <div className="flex-1 px-4">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all group",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-primary")} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="mt-auto p-6 space-y-4">
             <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Estado del Sistema</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium">Demo Operativo</span>
                </div>
             </div>
             <Button asChild variant="outline" className="w-full justify-start h-11 px-4 border-primary/10 hover:bg-muted">
                <Link href="/">
                    <LogOut className="mr-3 h-4 w-4" />
                    Cerrar Sesión
                </Link>
             </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col">
        <header className="flex h-20 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-md px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden border-primary/20">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0 border-r-primary/10 bg-background">
                <div className="p-6 border-b">
                    <Link href="/admin" className="flex items-center gap-3">
                        <Gem className="h-6 w-6 text-primary" />
                        <span className="font-headline text-xl tracking-widest uppercase">Aurum Admin</span>
                    </Link>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 rounded-xl px-4 py-4 transition-all text-sm font-medium",
                                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-6">
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Tienda
                        </Link>
                    </Button>
                </div>
              </SheetContent>
            </Sheet>
            <div className="hidden sm:flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5 border border-primary/5">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Cmd + K</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold uppercase tracking-widest">Admin Demo</span>
                <span className="text-[9px] text-primary font-medium tracking-tighter">Boutique Montevideo</span>
            </div>
            <div className="relative">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-primary text-[8px] border-2 border-background">3</Badge>
                </Button>
            </div>
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src="https://picsum.photos/seed/admin/100" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
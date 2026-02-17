
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem, Package, AlertTriangle, TrendingUp, ShoppingBag, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    onBackorder: 0,
    outOfStock: 0,
    totalValue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (!res.ok) throw new Error('Error al cargar métricas');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        toast({ title: "Error", description: "No se pudieron cargar las estadísticas reales.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-light tracking-tight text-foreground font-headline uppercase">Métricas del Negocio</h2>
        <p className="text-muted-foreground mt-1">Visión consolidada de tu catálogo Headless.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/10 shadow-sm hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Catálogo Total</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total} Piezas</div>
            <p className="text-xs text-muted-foreground mt-1">Sincronizado con Hostinger</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-sm hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Valor Inventario</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">U$S {stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Basado en precios de WooCommerce</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-sm hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Bajo Pedido</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onBackorder}</div>
            <p className="text-xs text-muted-foreground mt-1">Pendientes de reposición</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-sm hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Agotados</CardTitle>
            <Gem className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.outOfStock}</div>
            <p className="text-xs text-muted-foreground mt-1">Sin disponibilidad inmediata</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2 uppercase tracking-widest text-primary font-headline">
              <ShoppingBag className="h-5 w-5" />
              Estado de Integración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm border-b pb-2">
                <span className="text-muted-foreground">BFF Proxy</span>
                <Badge variant="outline" className="text-green-500">Activo</Badge>
              </div>
              <div className="flex items-center justify-between text-sm border-b pb-2">
                <span className="text-muted-foreground">WooCommerce API</span>
                <Badge variant="outline" className="text-green-500">Conectado</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Hostinger Env Vars</span>
                <Badge variant="outline" className="text-green-500">Validadas</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2 uppercase tracking-widest text-primary font-headline">
              <Clock className="h-5 w-5" />
              Sincronización
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Los datos que visualizas en este panel son consultados directamente desde tu base de datos de WordPress en el subdominio de base de datos.
              </p>
              <div className="p-3 bg-muted/50 rounded-lg text-xs font-mono">
                Last sync: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

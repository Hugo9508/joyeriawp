'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProducts } from '@/services/productService';
import { Product } from '@/lib/products';
import { Gem, Package, AlertTriangle, TrendingUp, ShoppingBag, Clock } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    totalValue: 0
  });

  useEffect(() => {
    async function loadStats() {
      const products = await getProducts();
      const inStock = products.filter(p => p.stockStatus === 'in_stock').length;
      const lowStock = products.filter(p => p.stockStatus === 'on_backorder').length;
      const totalValue = products.reduce((acc, p) => acc + (p.price?.uyu || p.regularPrice), 0);
      
      setStats({
        total: products.length,
        inStock,
        lowStock,
        totalValue
      });
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-light tracking-tight text-foreground">Visión General</h2>
        <p className="text-muted-foreground mt-1">Estado actual de tu inventario en modo demo.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">+2 piezas este mes</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">En Stock</CardTitle>
            <Gem className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inStock}</div>
            <p className="text-xs text-muted-foreground mt-1">{((stats.inStock/stats.total)*100).toFixed(0)}% del catálogo</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Bajo Pedido</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground mt-1">Requieren atención</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Valor Estimado</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$U {stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Valor de inventario</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 text-sm border-b pb-3 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Producto agregado al catálogo</p>
                    <p className="text-xs text-muted-foreground">Hace {i * 2} horas</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Tareas Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="text-xs font-bold text-primary">#1</div>
                <p className="text-sm">Actualizar precios de Oro 18k</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="text-xs font-bold text-primary">#2</div>
                <p className="text-sm">Subir fotos de la colección "Luz Verano"</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo, useEffect } from 'react';
import { Product, StockStatus } from '@/lib/products';
import { getProducts } from '@/services/productService';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader2, Info, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const prodData = await getProducts();
      setProducts(prodData);
    } catch (error) {
      toast({ 
        title: "Error de Sincronización", 
        description: "No se pudieron obtener los datos de WooCommerce. Verifique sus credenciales.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  const getStockBadge = (status: StockStatus, quantity?: number) => {
    switch (status) {
      case 'in_stock': 
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">En Stock {quantity !== undefined ? `(${quantity})` : ''}</Badge>;
      case 'out_of_stock': 
        return <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">Agotado</Badge>;
      case 'on_backorder': 
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">Bajo Pedido</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-foreground">Inventario Real</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión sincronizada con WooCommerce.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 border-primary/20 bg-background/50"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchData} disabled={isLoading}>
            <Loader2 className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          </Button>
        </div>
      </div>

      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-xs text-foreground/80">
          <strong>Panel Headless:</strong> La edición de inventario se realiza en WordPress para asegurar la integridad de los datos. Aquí visualizas el estado en tiempo real.
        </AlertDescription>
      </Alert>

      <Card className="border-primary/10 bg-background shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50 text-[10px] uppercase tracking-widest font-bold">
            <TableRow>
              <TableHead className="w-[80px]">Pieza</TableHead>
              <TableHead>Producto / SKU</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="w-[100px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={5} className="h-20 bg-muted/5 animate-pulse" /></TableRow>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="relative h-14 w-14 overflow-hidden rounded-md border bg-muted shadow-sm">
                      <Image
                        alt={product.name}
                        fill
                        src={product.images?.[0] || 'https://placehold.co/150x150?text=Joyeria'}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-mono mt-1">
                      SKU: {product.sku || 'N/A'} • {product.category}
                    </div>
                  </TableCell>
                  <TableCell>{getStockBadge(product.stockStatus, product.stockQuantity)}</TableCell>
                  <TableCell className="text-right">
                    <div className="font-bold text-primary text-sm">USD {product.price.usd.toLocaleString()}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild className="h-8 text-xs font-bold uppercase tracking-widest">
                      <a href={`https://joyeriabd.a380.com.br/wp-admin/post.php?post=${product.id}&action=edit`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Editar
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No se encontraron piezas sincronizadas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/lib/products';
import { getCategories, saveCategory, deleteCategory } from '@/services/productService';
import { Button } from '@/components/ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Pencil, Trash2, Loader2 } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [catName, setCatName] = useState('');
  const [catValue, setCatValue] = useState('');

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron cargar las categorías.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catValue) return;
    
    setIsSaving(true);
    try {
      await saveCategory({ 
        name: catName, 
        value: catValue.toLowerCase().trim().replace(/\s+/g, '-') 
      });
      toast({ title: "Éxito", description: "Categoría guardada correctamente." });
      setIsFormOpen(false);
      setCatName('');
      setCatValue('');
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      toast({ title: "Error", description: "Fallo al guardar.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatValue(cat.value);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (!confirm("¿Eliminar esta categoría permanentemente?")) return;
    
    try {
      await deleteCategory(id);
      toast({ title: "Eliminado", description: "Categoría removida correctamente.", variant: "destructive" });
      fetchCategories();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar de WooCommerce.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-foreground">Gestión de Categorías</h1>
          <p className="text-sm text-muted-foreground mt-1">Organice su catálogo sincronizado con WooCommerce.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) {
              setEditingCategory(null);
              setCatName('');
              setCatValue('');
            }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Editar' : 'Nueva'} Categoría</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Visible</Label>
                <Input 
                  id="name" 
                  value={catName} 
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (!editingCategory) setCatValue(e.target.value.toLowerCase().trim().replace(/\s+/g, '-'));
                  }} 
                  placeholder="Ej: Relojes de Lujo" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Slug (Identificador)</Label>
                <Input 
                  id="value" 
                  value={catValue} 
                  onChange={(e) => setCatValue(e.target.value)} 
                  placeholder="ej-relojes-lujo" 
                  disabled={!!editingCategory}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-primary/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-[100px] text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={3} className="h-12 bg-muted/10 animate-pulse" /></TableRow>
              ))
            ) : categories.map((cat) => (
              <TableRow key={cat.value}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{cat.value}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)} className="h-8 w-8 text-primary">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Gem, Loader2, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        toast({ 
          title: "Acceso Concedido", 
          description: "Desbloqueando panel de control...",
        });
        
        // Usamos window.location para forzar una carga limpia de la sesión y las cookies
        // Esto es más robusto en Hostinger para evitar bucles de redirección
        window.location.href = '/admin';
      } else {
        toast({ 
          title: "Acceso Denegado", 
          description: "Contraseña incorrecta. Por favor, intente de nuevo.", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo conectar con el servidor.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-body">
      <Card className="w-full max-w-md border-primary/20 shadow-2xl bg-card/80 backdrop-blur-md">
        <CardHeader className="space-y-4 flex flex-col items-center">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Gem className="text-primary-foreground h-7 w-7" />
          </div>
          <div className="text-center">
            <CardTitle className="font-headline text-3xl tracking-widest uppercase mb-1">Alianza Admin</CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60">
              Control de Boutique • Acceso Restringido
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">Clave Maestra</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted/50 border-primary/10 pl-10 h-12 focus-visible:ring-primary"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 text-xs font-bold uppercase tracking-widest" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Desbloquear Panel"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

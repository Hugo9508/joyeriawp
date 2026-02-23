'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Gem, Loader2, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Verificar si ya está autenticado
  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/admin');
    });
  }, [router]);

  // Mostrar errores de la URL
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'auth_failed') {
      toast({ title: 'Error de autenticación', description: 'El enlace ha expirado o es inválido.', variant: 'destructive' });
    } else if (error === 'unauthorized') {
      toast({ title: 'Acceso Denegado', description: 'Tu email no tiene permisos de administrador.', variant: 'destructive' });
    }
  }, [searchParams, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: 'Enlace Enviado ✉️',
        description: `Revisa tu bandeja de entrada en ${email}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo enviar el enlace. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        {emailSent ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h3 className="font-headline text-xl tracking-wide mb-2">Revisa tu Email</h3>
              <p className="text-sm text-muted-foreground">
                Enviamos un enlace de acceso a<br />
                <span className="text-primary font-medium">{email}</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground/60">
              El enlace expira en 1 hora. Revisa spam si no lo encuentras.
            </p>
            <Button
              variant="ghost"
              className="text-xs uppercase tracking-widest"
              onClick={() => { setEmailSent(false); setEmail(''); }}
            >
              Usar otro email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email de Administrador</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@joyeriaalianza.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted/50 border-primary/10 pl-10 h-12 focus-visible:ring-primary"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-muted-foreground/50 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                Recibirás un enlace seguro para ingresar
              </p>
            </div>
            <Button type="submit" className="w-full h-12 text-xs font-bold uppercase tracking-widest" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enviar Magic Link'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-body">
      <Suspense fallback={
        <div className="w-full max-w-md h-64 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}

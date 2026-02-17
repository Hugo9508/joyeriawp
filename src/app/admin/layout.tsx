import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Layout desactivado para apagar la interfaz administrativa
  return <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="text-center space-y-4">
      <h1 className="text-2xl font-headline uppercase tracking-widest">Acceso Restringido</h1>
      <p className="text-muted-foreground text-sm">La interfaz administrativa ha sido desactivada temporalmente.</p>
    </div>
  </div>;
}

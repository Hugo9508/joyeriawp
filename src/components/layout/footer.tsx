
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-foreground text-background pt-24 pb-12 border-t border-white/5">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between gap-16 mb-20">
          <div className="lg:w-1/3">
            <Link className="font-headline text-3xl tracking-[0.1em] uppercase mb-8 block" href="/">
              Joyeria Alianza
            </Link>
            <p className="text-white/60 text-sm font-light mb-8 max-w-sm">
              Suscríbase a nuestro boletín para acceso exclusivo a nuevas colecciones y eventos de Joyeria Alianza.
            </p>
            <div className="flex border-b border-white/20 pb-2 max-w-xs">
              <Input
                className="bg-transparent border-none text-white placeholder-white/40 w-full focus:ring-0 px-0 py-1 text-sm font-light focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Correo Electrónico"
                type="email"
              />
              <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors hover:bg-transparent">
                Unirse
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-24 lg:w-2/3">
            <div className="flex flex-col gap-6">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Boutique</h4>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-light text-white/80">Montevideo Flagship</p>
                <p className="text-xs text-white/50 leading-relaxed">
                  Calle Arocena 1592<br/>Carrasco, Montevideo 11500
                </p>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <p className="text-sm font-light text-white/80">Horario</p>
                <p className="text-xs text-white/50 leading-relaxed">
                  Lun - Vie: 10:00 - 19:30<br/>Sáb: 11:00 - 15:00
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Servicio al Cliente</h4>
              <Link className="text-sm font-light text-white/60 hover:text-white transition-colors" href="/contact">Contáctenos</Link>
              <Link className="text-sm font-light text-white/60 hover:text-white transition-colors" href="/contact">Agendar Cita</Link>
              <Link className="text-sm font-light text-white/60 hover:text-white transition-colors" href="#">Guía de Tallas</Link>
            </div>
            <div className="flex flex-col gap-6">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Social</h4>
              <a className="text-sm font-light text-white/60 hover:text-white transition-colors" href="#">Instagram</a>
              <a className="text-sm font-light text-white/60 hover:text-white transition-colors" href="#">Facebook</a>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 gap-4">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">
            © 2026 Joyeria Alianza. Todos los derechos reservados. Desarrollado por{" "}
            <a 
              href="https://axion380.com.br" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-primary transition-colors underline decoration-white/10"
            >
              Axion380
            </a>
          </p>
          <div className="flex gap-6">
            <Link className="text-[10px] text-white/30 hover:text-white uppercase tracking-widest transition-colors" href="/admin">Acceso Admin</Link>
            <Link className="text-[10px] text-white/30 hover:text-white uppercase tracking-widest transition-colors" href="#">Política de Privacidad</Link>
            <Link className="text-[10px] text-white/30 hover:text-white uppercase tracking-widest transition-colors" href="#">Términos y Condiciones</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

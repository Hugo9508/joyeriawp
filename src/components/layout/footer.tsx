'use client';

import { useState } from 'react';
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, X } from "lucide-react";

export function Footer() {
  const [showMap, setShowMap] = useState(false);

  return (
    <>
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
                    Calle Arocena 1592<br />Carrasco, Montevideo 11500
                  </p>
                </div>
                {/* Mapa clickeable */}
                <button
                  onClick={() => setShowMap(true)}
                  className="group relative w-full max-w-[220px] aspect-[16/9] rounded-lg overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-300 cursor-pointer"
                >
                  <img
                    src="https://staticmap.openstreetmap.de/staticmap.php?center=-34.8844,-56.0826&zoom=15&size=440x248&maptype=mapnik&markers=-34.8844,-56.0826,lightblue"
                    alt="Ubicación Joyería Alianza — Carrasco"
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors duration-300">
                    <div className="flex items-center gap-1.5 bg-white/90 text-foreground px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                      <MapPin className="w-3 h-3 text-primary" />
                      Ver Mapa
                    </div>
                  </div>
                </button>
                <div className="flex flex-col gap-2 mt-2">
                  <p className="text-sm font-light text-white/80">Horario</p>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Lun - Vie: 10:00 - 19:30<br />Sáb: 11:00 - 15:00
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

      {/* ── Modal de Mapa Interactivo ── */}
      {showMap && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowMap(false)}
        >
          <div
            className="relative w-[95vw] max-w-3xl bg-foreground rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Joyería Alianza</h3>
                  <p className="text-[11px] text-white/50">Calle Arocena 1592, Carrasco, Montevideo</p>
                </div>
              </div>
              <button
                onClick={() => setShowMap(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            {/* Mapa Interactivo */}
            <div className="aspect-[16/10] w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3272.5!2d-56.0826!3d-34.8844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zCalle+Arocena+1592,+Carrasco,+Montevideo,+Uruguay!5e0!3m2!1ses!2suy!4v1"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Joyería Alianza"
              />
            </div>
            {/* Footer del modal */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-white/10">
              <p className="text-[10px] text-white/40">Lun - Vie: 10:00 - 19:30 · Sáb: 11:00 - 15:00</p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Calle+Arocena+1592,+Carrasco,+Montevideo,+Uruguay"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
              >
                Abrir en Google Maps →
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

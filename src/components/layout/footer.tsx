'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, X } from "lucide-react";

const GOOGLE_MAPS_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3272.8!2d-56.065!3d-34.883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f802b6c8aaaab%3A0x1234567890!2sCalle+Arocena+1592%2C+11500+Montevideo%2C+Uruguay!5e0!3m2!1ses!2suy!4v1";
const GOOGLE_MAPS_SEARCH_URL = "https://www.google.com/maps/search/?api=1&query=Calle+Arocena+1592%2C+Carrasco%2C+Montevideo%2C+11500%2C+Uruguay";

// Usamos Google Maps embed en modo place para buscar la dirección exacta
const EMBED_PLACE_URL = "https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Calle+Arocena+1592,Carrasco,Montevideo,Uruguay&zoom=16";
// Fallback sin API key: usar el modo de búsqueda estándar
const EMBED_SEARCH_URL = "https://maps.google.com/maps?q=Calle+Arocena+1592,+Carrasco,+Montevideo,+11500,+Uruguay&t=&z=16&ie=UTF8&iwloc=&output=embed";

export function Footer() {
  const [showMap, setShowMap] = useState(false);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (showMap) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showMap]);

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
                {/* Mapa clickeable — miniatura CSS */}
                <button
                  onClick={() => setShowMap(true)}
                  className="group relative w-full max-w-[220px] aspect-[16/9] rounded-lg overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-300 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%)',
                  }}
                >
                  {/* Lineas decorativas simulando calles */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-white/40" />
                    <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-white/30" />
                    <div className="absolute left-1/4 top-0 bottom-0 w-[1px] bg-white/30" />
                    <div className="absolute left-2/3 top-0 bottom-0 w-[1px] bg-white/25" />
                    <div className="absolute top-[45%] left-[35%] right-[20%] h-[2px] bg-white/50" />
                    <div className="absolute top-[20%] left-[55%] bottom-[30%] w-[2px] bg-white/50" />
                  </div>
                  {/* Pin central */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <MapPin className="w-6 h-6 text-primary drop-shadow-lg" />
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-black/30 rounded-full blur-sm" />
                    </div>
                  </div>
                  {/* Overlay con botón */}
                  <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
          onClick={() => setShowMap(false)}
        >
          <div
            className="relative w-[95vw] max-w-3xl bg-foreground rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
            style={{ animation: 'zoomIn 0.3s ease-out' }}
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
            {/* Mapa Interactivo — iframe con dirección exacta */}
            <div className="aspect-[16/10] w-full relative">
              <iframe
                src={EMBED_SEARCH_URL}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Joyería Alianza"
                style={{ pointerEvents: 'auto' }}
              />
            </div>
            {/* Footer del modal */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-white/10">
              <p className="text-[10px] text-white/40">Lun - Vie: 10:00 - 19:30 · Sáb: 11:00 - 15:00</p>
              <a
                href={GOOGLE_MAPS_SEARCH_URL}
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

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}

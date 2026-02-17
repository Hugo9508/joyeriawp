import Link from "next/link";
import { WhatsappIcon } from "./icons";
import { appSettings } from "@/lib/settings";

export function WhatsappButton() {
    const phoneNumber = appSettings.whatsAppNumber;
    const message = "Hola, vengo de la tienda virtual y quisiera más información";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <Link 
            href={whatsappUrl}
            target="_blank"
            aria-label="Contactar por WhatsApp"
            className="fixed bottom-6 right-6 z-50 group flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
        >
            <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 group-hover:opacity-50 animate-ping"></span>
            <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-100"></span>
            <WhatsappIcon className="w-8 h-8 fill-current relative z-10" />
        </Link>
    )
}

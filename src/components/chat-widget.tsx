
'use client';

import { useState, useEffect, useRef } from 'react';
import { appSettings } from '@/lib/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, User, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { io, Socket } from 'socket.io-client';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: `¡Hola! Soy ${appSettings.chatAgentName} de Joyería Alianza. ¿En qué puedo asesorarte hoy? ✨`,
      sender: 'agent',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Conexión Socket.io para tiempo real
    socketRef.current = io(appSettings.socketUrl);

    socketRef.current.on('new_message', (data: any) => {
      if (data.type === 'whatsapp_incoming' || (data.sender && data.sender.includes(appSettings.whatsAppNumber))) {
        addMessage(data.text, 'agent');
      }
    });

    // Escuchar evento de apertura con mensaje de producto
    const handleOpenChat = (e: any) => {
      setIsOpen(true);
      if (e.detail?.message) {
        sendMessage(e.detail.message);
      }
    };

    window.addEventListener('open-chat-with-message', handleOpenChat);
    window.addEventListener('open-chat-only', () => setIsOpen(true));

    return () => {
      socketRef.current?.disconnect();
      window.removeEventListener('open-chat-with-message', handleOpenChat);
      window.removeEventListener('open-chat-only', () => setIsOpen(true));
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const addMessage = (text: string, sender: 'user' | 'agent') => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text,
        sender,
        timestamp: new Date(),
      },
    ]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Solo añadir a la UI si es un mensaje manual del usuario
    // (Los mensajes automáticos de producto ya vienen con el sender correcto si se disparan aquí)
    addMessage(text, 'user');
    setIsSending(true);

    try {
      const response = await fetch(appSettings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: appSettings.whatsAppNumber,
          text: text,
          senderName: 'Cliente Boutique Web',
        }),
      });

      if (!response.ok) throw new Error('Error al enviar mensaje');
    } catch (error) {
      console.warn('Fallo en Webhook, usando fallback wa.me');
      // No abrimos ventana aquí para no interrumpir la UI del chat, 
      // pero el mensaje ya quedó registrado en el estado local.
    } finally {
      setIsSending(false);
      setInputValue('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] h-[550px] bg-background border border-primary/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[100] animate-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <div className="bg-primary p-4 flex items-center justify-between text-primary-foreground shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest">{appSettings.chatAgentName}</h3>
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold opacity-80">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Asesor en línea
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="hover:bg-white/10 text-white">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-secondary/30">
        <div className="space-y-4" ref={scrollRef}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[85%] p-3 rounded-2xl text-sm shadow-sm",
                msg.sender === 'user'
                  ? "ml-auto bg-primary text-primary-foreground rounded-tr-none"
                  : "mr-auto bg-card text-card-foreground border border-primary/10 rounded-tl-none"
              )}
            >
              <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
              <span className="text-[9px] opacity-50 mt-1 block text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-primary/10 bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputValue);
          }}
          className="flex gap-2"
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escriba su consulta..."
            className="flex-1 bg-secondary/50 border-none focus-visible:ring-1 focus-visible:ring-primary rounded-full px-4"
            disabled={isSending}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isSending || !inputValue.trim()}
            className="rounded-full h-10 w-10 flex-shrink-0"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}

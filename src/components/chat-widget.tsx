
'use client';

import { useState, useEffect, useRef } from 'react';
import { appSettings } from '@/lib/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, User, Loader2, Phone, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { io, Socket } from 'socket.io-client';
import { sendMessageAction } from '@/app/actions/chat';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
};

type UserInfo = {
  name: string;
  phone: string;
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [onboardingForm, setOnboardingForm] = useState({ name: '', phone: '' });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: `¡Hola! Soy ${appSettings.chatAgentName}. ¿En qué puedo ayudarte hoy? ✨`,
      sender: 'agent',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [pendingText, setPendingText] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('alianza_user_info');
    if (saved) setUserInfo(JSON.parse(saved));

    // Inicialización de Sockets para producción
    socketRef.current = io(appSettings.siteUrl);
    socketRef.current.on('new_message', (data: any) => {
      if (data.type === 'whatsapp_incoming') {
        addMessage(data.text, 'agent');
      }
    });

    const handleOpenWithMsg = (e: any) => {
      setIsOpen(true);
      const msg = e.detail?.message;
      if (!localStorage.getItem('alianza_user_info')) {
        setPendingText(msg);
        setShowOnboarding(true);
      } else if (msg) {
        processMessage(msg);
      }
    };

    const handleOpenOnly = () => {
      setIsOpen(true);
      if (!localStorage.getItem('alianza_user_info')) setShowOnboarding(true);
    };

    window.addEventListener('open-chat-with-message', handleOpenWithMsg);
    window.addEventListener('open-chat-only', handleOpenOnly);

    return () => {
      socketRef.current?.disconnect();
      window.removeEventListener('open-chat-with-message', handleOpenWithMsg);
      window.removeEventListener('open-chat-only', handleOpenOnly);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showOnboarding, isOpen]);

  const addMessage = (text: string, sender: 'user' | 'agent') => {
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      text,
      sender,
      timestamp: new Date()
    }]);
  };

  const handleOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingForm.name.trim() || onboardingForm.phone.length < 9) return;

    const data = { name: onboardingForm.name.trim(), phone: onboardingForm.phone };
    localStorage.setItem('alianza_user_info', JSON.stringify(data));
    setUserInfo(data);
    setShowOnboarding(false);

    if (pendingText) {
      processMessage(pendingText, data);
      setPendingText(null);
    }
  };

  const processMessage = async (text: string, forcedUser?: UserInfo) => {
    const user = forcedUser || userInfo;
    if (!text.trim() || !user) return;

    setIsSending(true);
    const result = await sendMessageAction({
      text,
      senderName: user.name,
      senderPhone: user.phone
    });

    if (result.success) {
      addMessage(text, 'user');
      setInputValue('');
    } else {
      toast({ 
        variant: "destructive", 
        title: "Error de Envío", 
        description: result.error 
      });
    }
    setIsSending(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] h-[550px] bg-background border border-primary/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[100] animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-primary p-4 flex items-center justify-between text-primary-foreground shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest">{appSettings.chatAgentName}</h3>
            <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold opacity-80">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Asesoría en vivo
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="hover:bg-white/10 text-white h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {showOnboarding ? (
        <div className="flex-1 p-8 flex flex-col justify-center bg-secondary/10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="text-primary h-6 w-6" />
            </div>
            <h4 className="text-lg font-headline">Identificación</h4>
            <p className="text-xs text-muted-foreground mt-2">Ingrese sus datos para una atención personalizada.</p>
          </div>

          <form onSubmit={handleOnboarding} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Nombre</Label>
              <Input
                value={onboardingForm.name}
                onChange={e => setOnboardingForm({...onboardingForm, name: e.target.value})}
                placeholder="Nombre completo"
                className="h-12 bg-background border-primary/10"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Teléfono (Uruguay)</Label>
              <Input
                value={onboardingForm.phone}
                onChange={e => setOnboardingForm({...onboardingForm, phone: e.target.value.replace(/\D/g, '').slice(0, 9)})}
                placeholder="099 123 456"
                className="h-12 bg-background border-primary/10"
                required
              />
            </div>
            <Button type="submit" className="w-full h-12 text-xs font-bold uppercase tracking-widest">
              Conectar con Asesor
            </Button>
          </form>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 p-4 bg-secondary/5">
            <div className="space-y-4" ref={scrollRef}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "max-w-[85%] p-3 rounded-2xl text-sm shadow-sm",
                    msg.sender === 'user'
                      ? "ml-auto bg-primary text-primary-foreground rounded-tr-none"
                      : "mr-auto bg-card text-card-foreground border border-primary/5 rounded-tl-none"
                  )}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <span className="text-[8px] opacity-40 mt-1 block text-right">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {isSending && (
                <div className="text-[10px] text-muted-foreground animate-pulse italic pl-2">
                  Enviando mensaje a {appSettings.chatAgentName}...
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-primary/5 bg-background">
            <form
              onSubmit={(e) => { e.preventDefault(); processMessage(inputValue); }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escriba su consulta aquí..."
                className="flex-1 bg-secondary/30 border-none rounded-full px-4 h-10 text-sm focus-visible:ring-1 focus-visible:ring-primary"
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
            {userInfo && (
              <div className="flex items-center justify-center gap-2 mt-3 opacity-40">
                <CheckCircle2 className="h-2.5 w-2.5 text-green-600" />
                <span className="text-[8px] uppercase font-bold tracking-widest">
                  Identificado como {userInfo.name}
                </span>
                <button 
                  onClick={() => { localStorage.removeItem('alianza_user_info'); setUserInfo(null); setShowOnboarding(true); }}
                  className="text-[8px] underline ml-1 hover:text-primary"
                >
                  (Cambiar)
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

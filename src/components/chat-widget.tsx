'use client';

import { useState, useEffect, useRef } from 'react';
import { appSettings } from '@/lib/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, User, MessageSquare, Loader2, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { io, Socket } from 'socket.io-client';
import { sendMessageToEvolutionAction } from '@/app/actions/chat';
import { Label } from '@/components/ui/label';

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
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState({ name: '', phone: '' });
  const [phoneError, setPhoneError] = useState<string | null>(null);
  
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
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('alianza_user_info');
    if (saved) {
      setUserInfo(JSON.parse(saved));
    }

    // Conexión a Socket (Producción)
    socketRef.current = io(appSettings.socketUrl);
    socketRef.current.on('new_message', (data: any) => {
      if (data.type === 'whatsapp_incoming' || (data.sender && data.sender.includes(appSettings.whatsAppNumber))) {
        addMessage(data.text, 'agent');
      }
    });

    // LÓGICA DE TEST: Escuchar simulaciones desde el Panel Admin
    const handleTestMessage = (e: any) => {
      const { text, senderName } = e.detail;
      setIsOpen(true);
      addMessage(text, 'agent');
    };

    const handleOpenChat = (e: any) => {
      setIsOpen(true);
      const text = e.detail?.message;
      
      const currentSaved = localStorage.getItem('alianza_user_info');
      if (!currentSaved && !userInfo) {
        setPendingMessage(text || null);
        setShowOnboarding(true);
      } else if (text) {
        handleSendMessage(text);
      }
    };

    window.addEventListener('simulate-whatsapp-message', handleTestMessage);
    window.addEventListener('open-chat-with-message', handleOpenChat);
    window.addEventListener('open-chat-only', () => {
      setIsOpen(true);
      if (!localStorage.getItem('alianza_user_info')) {
        setShowOnboarding(true);
      }
    });

    return () => {
      socketRef.current?.disconnect();
      window.removeEventListener('simulate-whatsapp-message', handleTestMessage);
      window.removeEventListener('open-chat-with-message', handleOpenChat);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, showOnboarding]);

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

  const validateUruguayPhone = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return /^09\d{7}$/.test(cleanPhone);
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);

    if (!onboardingData.name.trim() || !onboardingData.phone.trim()) return;

    if (!validateUruguayPhone(onboardingData.phone)) {
      setPhoneError("El número debe comenzar con 0 y tener exactamente 9 dígitos.");
      return;
    }

    const data = { 
      name: onboardingData.name.trim(), 
      phone: onboardingData.phone.trim()
    };
    
    localStorage.setItem('alianza_user_info', JSON.stringify(data));
    setUserInfo(data);
    setShowOnboarding(false);

    if (pendingMessage) {
      handleSendMessage(pendingMessage, data);
      setPendingMessage(null);
    }
  };

  const handleSendMessage = async (text: string, forcedUserInfo?: UserInfo) => {
    const currentInfo = forcedUserInfo || userInfo;
    
    if (!text.trim()) return;
    if (!currentInfo) {
      setPendingMessage(text);
      setShowOnboarding(true);
      return;
    }

    addMessage(text, 'user');
    setIsSending(true);

    try {
      const result = await sendMessageToEvolutionAction(
        text, 
        currentInfo.name, 
        currentInfo.phone
      );
      
      if (!result.success) throw new Error(result.error);
    } catch (error) {
      console.warn('Fallo en el envío:', error);
    } finally {
      setIsSending(false);
      setInputValue('');
    }
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

      {showOnboarding ? (
        <div className="flex-1 p-8 flex flex-col justify-center bg-secondary/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="text-primary h-8 w-8" />
            </div>
            <h4 className="text-lg font-headline">Identificación</h4>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Por favor, ingrese sus datos para comenzar la asesoría personalizada.
            </p>
          </div>

          <form onSubmit={handleOnboardingSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="userName" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Su Nombre</Label>
              <Input
                id="userName"
                value={onboardingData.name}
                onChange={(e) => setOnboardingData({...onboardingData, name: e.target.value})}
                placeholder="Ej: Juan Pérez"
                className="bg-background border-primary/10 h-12"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="userPhone" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Su WhatsApp (9 dígitos)</Label>
              <Input
                id="userPhone"
                value={onboardingData.phone}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length > 0 && val[0] !== '0') {
                    val = '';
                  }
                  if (val.length > 9) {
                    val = val.slice(0, 9);
                  }
                  setOnboardingData({...onboardingData, phone: val});
                  if (phoneError) setPhoneError(null);
                }}
                placeholder="099 123 456"
                className={cn(
                  "bg-background border-primary/10 h-12",
                  phoneError && "border-destructive focus-visible:ring-destructive"
                )}
                required
              />
              {phoneError && (
                <div className="flex items-center gap-1.5 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-3 w-3 text-destructive" />
                  <p className="text-[10px] text-destructive font-bold uppercase tracking-tighter">{phoneError}</p>
                </div>
              )}
            </div>
            
            <Button type="submit" className="w-full h-12 text-xs font-bold uppercase tracking-widest mt-4">
              Comenzar Asesoría
            </Button>
          </form>
        </div>
      ) : (
        <>
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
              {isSending && (
                <div className="mr-auto bg-card p-3 rounded-2xl text-[10px] text-muted-foreground animate-pulse italic">
                  Enviando a {appSettings.chatAgentName}...
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-primary/10 bg-background">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
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
            {userInfo && (
              <div className="flex items-center justify-center gap-2 mt-2 opacity-40 hover:opacity-100 transition-opacity">
                <CheckCircle2 className="h-2.5 w-2.5 text-green-600" />
                <span className="text-[8px] uppercase font-bold tracking-tighter">
                  Sesión de {userInfo.name} ({userInfo.phone})
                </span>
                <button 
                  onClick={() => { localStorage.removeItem('alianza_user_info'); setUserInfo(null); setShowOnboarding(true); }}
                  className="text-[8px] underline ml-1"
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

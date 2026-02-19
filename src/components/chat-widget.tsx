'use client';

import { useState, useEffect, useRef } from 'react';
import { appSettings } from '@/lib/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, User, Loader2, Phone, CheckCircle2, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
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

type DebugLog = {
  timestamp: string;
  success: boolean;
  error?: string;
  data: any;
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
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const debugScrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('alianza_user_info');
    if (saved) setUserInfo(JSON.parse(saved));

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

  useEffect(() => {
    if (debugScrollRef.current) {
      debugScrollRef.current.scrollTop = debugScrollRef.current.scrollHeight;
    }
  }, [debugLogs]);

  const addMessage = (text: string, sender: 'user' | 'agent') => {
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      text,
      sender,
      timestamp: new Date()
    }]);
  };

  const addDebugLog = (success: boolean, data: any, error?: string) => {
    setDebugLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      success,
      error,
      data
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

    // Registrar log de diagnóstico
    addDebugLog(result.success, result.debug, result.error);

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
    <div className="fixed bottom-24 right-6 w-[350px] sm:w-[450px] h-[650px] bg-background border border-primary/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[100] animate-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <div className="bg-primary p-4 flex items-center justify-between text-primary-foreground shadow-md shrink-0">
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
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowDebug(!showDebug)} 
            className={cn("h-8 w-8 hover:bg-white/10", showDebug ? "text-white" : "text-white/50")}
            title="Consola de Diagnóstico"
          >
            <Terminal className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="hover:bg-white/10 text-white h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col flex-1 relative overflow-hidden">
        {/* Debug Console Overlay */}
        {showDebug && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 text-green-400 font-mono text-[10px] p-4 flex flex-col border-b border-white/10 overflow-hidden animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-2 border-b border-green-400/20 pb-2">
              <span className="flex items-center gap-2 uppercase tracking-widest font-bold">
                <Terminal className="h-3 w-3" /> Consola de Diagnóstico n8n
              </span>
              <button onClick={() => setShowDebug(false)} className="hover:text-white"><X className="h-3 w-3" /></button>
            </div>
            <ScrollArea className="flex-1" ref={debugScrollRef}>
              <div className="space-y-4">
                {debugLogs.length === 0 ? (
                  <div className="text-green-400/40 italic">Esperando actividad de red...</div>
                ) : debugLogs.map((log, i) => (
                  <div key={i} className={cn("border-l-2 pl-3 py-1", log.success ? "border-green-500" : "border-red-500")}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="bg-slate-800 px-1.5 rounded text-[8px]">{log.timestamp}</span>
                      <span className={log.success ? "text-green-400" : "text-red-400"}>
                        {log.success ? "SUCCESS" : "ERROR"}
                      </span>
                    </div>
                    {log.error && <div className="text-red-400 mb-1">Reason: {log.error}</div>}
                    <div className="text-slate-400 text-[9px] mb-1">
                      Status: <span className="text-white">{log.data?.status || 'N/A'}</span> | 
                      Duration: <span className="text-white">{log.data?.duration || 'N/A'}</span>
                    </div>
                    <details className="mt-1 cursor-pointer">
                      <summary className="hover:text-white/80 opacity-60">Payload Enviado</summary>
                      <pre className="bg-black/50 p-2 rounded mt-1 overflow-x-auto text-[8px] text-white/90">
                        {JSON.stringify(log.data?.payload, null, 2)}
                      </pre>
                    </details>
                    <details className="mt-1 cursor-pointer">
                      <summary className="hover:text-white/80 opacity-60">Respuesta n8n</summary>
                      <pre className="bg-black/50 p-2 rounded mt-1 overflow-x-auto text-[8px] text-white/90">
                        {JSON.stringify(log.data?.response, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

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

            <div className="p-4 border-t border-primary/5 bg-background shrink-0">
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
    </div>
  );
}

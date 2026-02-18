'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appSettings } from '@/lib/settings';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Globe, User, Phone, Save, Loader2, Beaker, Play } from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [testMessage, setTestMessage] = useState('¡Hola! Esto es un mensaje de prueba desde el simulador de Maya. ✨');
  
  const [settings, setSettings] = useState({
    whatsAppNumber: appSettings.whatsAppNumber,
    chatAgentName: appSettings.chatAgentName,
    webhookUrl: appSettings.webhookUrl,
    socketUrl: appSettings.socketUrl,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Nota: En un entorno real esto persistiría en una DB
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Configuración Actualizada",
        description: "Los parámetros se han guardado temporalmente en memoria.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudieron actualizar los ajustes.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // FUNCIÓN PARA SIMULAR MENSAJE ENTRANTE
  const handleSimulateMessage = () => {
    if (!testMessage.trim()) return;
    
    // Disparamos un evento personalizado que el ChatWidget capturará
    const event = new CustomEvent('simulate-whatsapp-message', {
      detail: {
        text: testMessage,
        senderName: settings.chatAgentName
      }
    });
    window.dispatchEvent(event);
    
    toast({
      title: "Simulación Enviada",
      description: "Revisa la burbuja del chat abajo a la derecha.",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-light tracking-tight">Configuración del Sistema</h2>
        <p className="text-sm text-muted-foreground">Administre la integración con Evolution API y herramientas de prueba.</p>
      </div>

      {/* SECCIÓN DE SIMULADOR PARA PRUEBAS UI */}
      <Card className="border-accent/20 bg-accent/5 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
              <Beaker className="text-accent-foreground h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Herramientas de Diagnóstico (Test UI)</CardTitle>
              <CardDescription>Simule mensajes entrantes sin configurar n8n.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testMsg">Texto del mensaje a simular</Label>
            <div className="flex gap-2">
              <Input 
                id="testMsg" 
                value={testMessage} 
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Escribe algo..."
                className="bg-background"
              />
              <Button onClick={handleSimulateMessage} variant="secondary" className="flex-shrink-0">
                <Play className="mr-2 h-4 w-4" />
                Simular POST
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              * Esto dispara el evento 'new_message' internamente para que veas cómo aparece la respuesta de WhatsApp en el chat.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <MessageSquare className="text-primary-foreground h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Integración Evolution API</CardTitle>
              <CardDescription>Parámetros reales para producción.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <Phone className="h-3 w-3" /> Número de WhatsApp
              </Label>
              <Input
                id="whatsapp"
                value={settings.whatsAppNumber}
                onChange={(e) => setSettings({...settings, whatsAppNumber: e.target.value})}
                placeholder="59895435644"
                className="bg-muted/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="agent" className="flex items-center gap-2">
                <User className="h-3 w-3" /> Nombre del Asesor (IA)
              </Label>
              <Input
                id="agent"
                value={settings.chatAgentName}
                onChange={(e) => setSettings({...settings, chatAgentName: e.target.value})}
                placeholder="Maya"
                className="bg-muted/30"
              />
            </div>
          </div>

          <Separator className="opacity-50" />

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="webhook" className="flex items-center gap-2">
                <Globe className="h-3 w-3" /> Webhook URL (Producción)
              </Label>
              <Input
                id="webhook"
                value={settings.webhookUrl}
                disabled
                className="bg-muted/10 opacity-60"
              />
              <p className="text-[10px] text-muted-foreground">Esta URL solo funcionará tras el despliegue a producción.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="h-11 px-8">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar Configuración
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

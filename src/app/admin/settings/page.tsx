
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appSettings } from '@/lib/settings';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Globe, User, Phone, Save, Loader2, Beaker, Play, Wifi } from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [testMessage, setTestMessage] = useState('¡Hola! Soy Maya. Recibí tu consulta sobre el anillo solitario. ✨');
  
  const [settings, setSettings] = useState({
    whatsAppNumber: appSettings.whatsAppNumber,
    chatAgentName: appSettings.chatAgentName,
    webhookUrl: appSettings.webhookUrl,
    socketUrl: appSettings.socketUrl,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Configuración Actualizada",
        description: "Parámetros guardados correctamente.",
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

  const handleSimulateMessage = () => {
    if (!testMessage.trim()) return;
    
    // Disparamos un evento que simula exactamente lo que llegaría por Webhook
    const event = new CustomEvent('simulate-whatsapp-message', {
      detail: {
        text: testMessage,
        senderName: settings.chatAgentName,
        type: 'whatsapp_incoming'
      }
    });
    window.dispatchEvent(event);
    
    toast({
      title: "Respuesta Simulada",
      description: "El chat ha recibido el mensaje de WhatsApp.",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-light tracking-tight">Configuración del Sistema</h2>
        <p className="text-sm text-muted-foreground">Administre la integración con n8n y la Evolution API.</p>
      </div>

      <Card className="border-blue-500/20 bg-blue-500/5 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Beaker className="text-white h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Simulador de WhatsApp (Modo Test)</CardTitle>
              <CardDescription>Use esto para probar la interfaz del chat sin necesidad de n8n.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testMsg">Mensaje del Vendedor</Label>
            <div className="flex gap-2">
              <Input 
                id="testMsg" 
                value={testMessage} 
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Escriba la respuesta simulada..."
                className="bg-background"
              />
              <Button onClick={handleSimulateMessage} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Play className="mr-2 h-4 w-4" />
                Simular Entrada
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              * Esto abrirá el chat y mostrará el mensaje como si viniera de WhatsApp. Ideal para validar colores y diseño.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Wifi className="text-primary-foreground h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Endpoints de Conexión</CardTitle>
              <CardDescription>URLs para configurar en su flujo de n8n.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">URL de Webhook (n8n → Web)</Label>
            <div className="flex gap-2">
              <Input
                value="https://joyeria.a380.com.br/api/webhook"
                readOnly
                className="bg-muted/30 font-mono text-xs"
              />
              <Button variant="outline" size="sm" onClick={() => {
                navigator.clipboard.writeText("https://joyeria.a380.com.br/api/webhook");
                toast({ title: "Copiado", description: "URL lista para n8n" });
              }}>Copiar</Button>
            </div>
            <p className="text-[10px] text-orange-600 font-medium">Nota: Esta URL solo recibirá datos reales tras el despliegue final.</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <Phone className="h-3 w-3" /> Número WhatsApp de la Tienda
              </Label>
              <Input
                id="whatsapp"
                value={settings.whatsAppNumber}
                onChange={(e) => setSettings({...settings, whatsAppNumber: e.target.value})}
                placeholder="59895435644"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="agent" className="flex items-center gap-2">
                <User className="h-3 w-3" /> Nombre del Asesor
              </Label>
              <Input
                id="agent"
                value={settings.chatAgentName}
                onChange={(e) => setSettings({...settings, chatAgentName: e.target.value})}
                placeholder="Maya"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="h-11 px-8">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar Cambios
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

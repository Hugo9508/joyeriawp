
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appSettings } from '@/lib/settings';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Globe, User, Phone, Save, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    whatsAppNumber: appSettings.whatsAppNumber,
    chatAgentName: appSettings.chatAgentName,
    webhookUrl: appSettings.webhookUrl,
    socketUrl: appSettings.socketUrl,
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulación de guardado
    try {
      console.log("Saving Evolution API Settings:", settings);
      // Aquí se llamaría a una API real para persistir
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuración Actualizada",
        description: "Los parámetros de Evolution API se han guardado correctamente.",
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-light tracking-tight">Configuración del Sistema</h2>
        <p className="text-sm text-muted-foreground">Administre la integración con Evolution API y los datos de contacto.</p>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <MessageSquare className="text-primary-foreground h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Integración Evolution API</CardTitle>
              <CardDescription>Configure el canal de WhatsApp y el servidor de eventos.</CardDescription>
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
              <p className="text-[10px] text-muted-foreground">Formato internacional sin el signo +. Ejemplo: 59895435644</p>
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
              <p className="text-[10px] text-muted-foreground">Nombre que aparecerá en la cabecera del chat.</p>
            </div>
          </div>

          <Separator className="opacity-50" />

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="webhook" className="flex items-center gap-2">
                <Globe className="h-3 w-3" /> Webhook URL (n8n / Evolution)
              </Label>
              <Input
                id="webhook"
                value={settings.webhookUrl}
                onChange={(e) => setSettings({...settings, webhookUrl: e.target.value})}
                placeholder="https://tu-n8n.com/webhook/..."
                className="bg-muted/30"
              />
              <p className="text-[10px] text-muted-foreground">Dirección donde se enviarán los mensajes salientes desde la web.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="socket" className="flex items-center gap-2">
                <Globe className="h-3 w-3" /> Socket Server URL
              </Label>
              <Input
                id="socket"
                value={settings.socketUrl}
                onChange={(e) => setSettings({...settings, socketUrl: e.target.value})}
                placeholder="https://joyeria.a380.com.br"
                className="bg-muted/30"
              />
              <p className="text-[10px] text-muted-foreground">URL base del servidor de sockets para recibir mensajes en tiempo real.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="h-11 px-8">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Configuración
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

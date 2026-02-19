
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appSettings } from '@/lib/settings';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Save, Loader2, Wifi, Copy } from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    whatsAppNumber: appSettings.whatsAppNumber,
    chatAgentName: appSettings.chatAgentName,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulación de persistencia de ajustes
      await new Promise(resolve => setTimeout(resolve, 800));
      toast({
        title: "Configuración Actualizada",
        description: "Los parámetros de producción han sido guardados.",
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-light tracking-tight">Configuración de Producción</h2>
        <p className="text-sm text-muted-foreground">Administre los parámetros operativos de la Boutique Alianza.</p>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Wifi className="text-primary-foreground h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Integración con n8n</CardTitle>
              <CardDescription>Parámetros de conexión para el ecosistema de mensajería.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">URL de Webhook (Destino n8n)</Label>
            <div className="flex gap-2">
              <Input
                value={appSettings.n8nWebhookUrl}
                readOnly
                className="bg-muted/30 font-mono text-xs"
              />
              <Button variant="outline" size="sm" onClick={() => {
                navigator.clipboard.writeText(appSettings.n8nWebhookUrl);
                toast({ title: "Copiado", description: "URL de n8n copiada al portapapeles." });
              }}>Copiar</Button>
            </div>
            <p className="text-[10px] text-muted-foreground">Esta URL es el destino de todas las consultas de clientes realizadas desde la web.</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <Phone className="h-3 w-3" /> WhatsApp de la Boutique
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
                <User className="h-3 w-3" /> Nombre del Agente (Boutique)
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

      <Card className="border-muted bg-muted/5">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest">Información de Retorno</CardTitle>
          <CardDescription className="text-xs">Configure esta URL en su nodo HTTP de n8n para enviar respuestas a la web.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value="https://joyeria.a380.com.br/api/webhook"
              readOnly
              className="bg-background font-mono text-xs"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

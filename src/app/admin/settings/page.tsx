'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appSettings } from '@/lib/settings';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();
  const [whatsAppNumber, setWhatsAppNumber] = useState(appSettings.whatsAppNumber);

  const handleSave = () => {
    // In a real application, you'd call an API to save this setting.
    // For this prototype, we'll just show a toast message.
    console.log("Saving new WhatsApp number:", whatsAppNumber);
    toast({
      title: "Configuración guardada",
      description: "El número de WhatsApp ha sido actualizado.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración Global</CardTitle>
        <CardDescription>
          Administre la configuración de su tienda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatsapp-number">Número de WhatsApp</Label>
            <Input
              id="whatsapp-number"
              value={whatsAppNumber}
              onChange={(e) => setWhatsAppNumber(e.target.value)}
              placeholder="Ej: 59895435644"
            />
            <p className="text-sm text-muted-foreground">
              Este número se utilizará para todos los botones de contacto de WhatsApp en la tienda.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={handleSave}>Guardar Cambios</Button>
      </CardFooter>
    </Card>
  );
}

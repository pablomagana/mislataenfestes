import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Cookie, Settings, X } from 'lucide-react';
import { useCookieConsent, type CookieConsent } from '@/hooks/use-cookie-consent';
import { cn } from '@/lib/utils';

interface CookieBannerProps {
  className?: string;
}

export default function CookieBanner({ className }: CookieBannerProps) {
  const { showBanner, acceptAll, acceptNecessary, setCustomConsent } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);
  const [customSettings, setCustomSettings] = useState<CookieConsent>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  if (!showBanner) return null;

  const handleCustomSave = () => {
    setCustomConsent(customSettings);
    setShowSettings(false);
  };

  return (
    <>
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 p-4 transform transition-transform duration-500 ease-in-out",
          showBanner ? "translate-y-0" : "translate-y-full",
          className
        )}
      >
        <Card className="mx-auto max-w-4xl bg-white/95 backdrop-blur-sm border-festival-orange shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Cookie className="w-8 h-8 text-festival-orange" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🍪 Consentimiento de Cookies y Términos de Uso
                </h3>
                <div className="text-sm text-gray-600 mb-4 leading-relaxed space-y-2">
                  <p>
                    Utilizamos cookies para mejorar tu experiencia en nuestra web, analizar el tráfico y personalizar el contenido. 
                    Las cookies necesarias son esenciales para el funcionamiento del sitio y siempre están activas.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                    <p className="text-sm font-medium text-amber-800 mb-1">
                      📸 <strong>Importante - Subida de Imágenes:</strong>
                    </p>
                    <p className="text-xs text-amber-700">
                      Al subir fotos a nuestros eventos, confirmas que tienes todos los derechos sobre las imágenes y autorizas su publicación. 
                      Eres completamente responsable del contenido subido. Las fiestas se reservan el derecho de moderar y eliminar contenido inapropiado.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={acceptAll}
                    className="bg-festival-orange hover:bg-festival-orange/90 text-white font-medium"
                  >
                    Aceptar todas
                  </Button>
                  
                  <Button 
                    onClick={acceptNecessary}
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Solo necesarias
                  </Button>
                  
                  <Dialog open={showSettings} onOpenChange={setShowSettings}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="text-gray-600 hover:text-festival-orange"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Personalizar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-festival-orange">
                          Configuración de Cookies
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-600">
                          Gestiona tus preferencias de cookies. Las cookies necesarias no se pueden desactivar.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium">Cookies Necesarias</h4>
                            <p className="text-xs text-gray-500">
                              Esenciales para el funcionamiento del sitio
                            </p>
                          </div>
                          <Switch 
                            checked={true}
                            disabled={true}
                            className="opacity-50"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium">Cookies de Análisis</h4>
                            <p className="text-xs text-gray-500">
                              Nos ayudan a entender cómo usas el sitio
                            </p>
                          </div>
                          <Switch 
                            checked={customSettings.analytics}
                            onCheckedChange={(checked) => 
                              setCustomSettings(prev => ({ ...prev, analytics: checked }))
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium">Cookies de Marketing</h4>
                            <p className="text-xs text-gray-500">
                              Para mostrarte contenido personalizado
                            </p>
                          </div>
                          <Switch 
                            checked={customSettings.marketing}
                            onCheckedChange={(checked) => 
                              setCustomSettings(prev => ({ ...prev, marketing: checked }))
                            }
                          />
                        </div>
                      </div>
                      
                      <DialogFooter className="gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowSettings(false)}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleCustomSave}
                          className="bg-festival-orange hover:bg-festival-orange/90"
                        >
                          Guardar preferencias
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Overlay to prevent interaction with content below */}
      {showBanner && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={acceptNecessary}
        />
      )}
    </>
  );
}

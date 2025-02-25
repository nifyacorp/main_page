import React from 'react';
import { Shield, LogOut } from 'lucide-react';

export const SecuritySection: React.FC = () => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5" />
        Seguridad
      </h2>
      <div className="space-y-4">
        <button className="w-full p-4 rounded-lg border bg-card text-left hover:bg-muted/50 transition-colors">
          <p className="font-medium">Cambiar contraseña</p>
          <p className="text-sm text-muted-foreground">
            Actualiza tu contraseña de acceso
          </p>
        </button>

        <button className="w-full p-4 rounded-lg border bg-destructive/10 text-left hover:bg-destructive/20 transition-colors">
          <div className="flex items-center gap-2 text-destructive">
            <LogOut className="h-5 w-5" />
            <div>
              <p className="font-medium">Cerrar sesión en todos los dispositivos</p>
              <p className="text-sm opacity-90">
                Cierra la sesión en todos los dispositivos donde hayas iniciado sesión
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
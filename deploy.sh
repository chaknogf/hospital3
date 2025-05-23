#!/bin/bash

echo "🚀 Iniciando despliegue de la app 'cartelera'..."

# Ruta al proyecto Angular
PROYECTO_DIR="/home/matrix/Programas/carteleraDocencia"
DIST_DIR="$PROYECTO_DIR/dist/cartelera/browser"
DESTINO="/var/www/cartelera"

# 1. Ir al directorio del proyecto
cd "$PROYECTO_DIR" || { echo "❌ No se pudo acceder al proyecto"; exit 1; }

# 2. Compilar con base-href
echo "🏗️ Ejecutando build..."
ng build --base-href=/cartelera/ || { echo "❌ Error en el build"; exit 1; }

# 3. Verificar que el dist existe
if [ ! -d "$DIST_DIR" ]; then
    echo "❌ No se encontró el directorio de salida: $DIST_DIR"
    exit 1
fi

# 4. Crear destino si no existe
sudo mkdir -p "$DESTINO"

# 5. Copiar archivos
echo "📂 Copiando archivos a $DESTINO"
sudo cp -r "$DIST_DIR"/* "$DESTINO"/

# 6. Asignar permisos (ajustar usuario si no es www-data)
echo "🔐 Ajustando permisos..."
sudo chown -R nginx:nginx "$DESTINO"
sudo chmod -R 755 "$DESTINO"

# 7. Verificar y recargar nginx
echo "🔁 Verificando configuración de Nginx..."
sudo nginx -t || { echo "❌ Error en la configuración de Nginx"; exit 1; }

echo "🔄 Recargando Nginx..."
sudo systemctl reload nginx

echo "✅ Despliegue completado correctamente. Visite: https://hgtecpan.duckdns.org/cartelera/"

#!/bin/bash

echo "🚀 Iniciando despliegue de la app 'Medical App'..."

# Ruta al proyecto Angular
PROYECTO_DIR="/home/matrix/Programas/hospital3"
DIST_DIR="$PROYECTO_DIR/dist/medicapp/browser"
DESTINO="/var/www/medicapp"
BASE_HREF="/medicapp/"

# 1. Ir al directorio del proyecto
cd "$PROYECTO_DIR" || { echo "❌ No se pudo acceder al proyecto"; exit 1; }

# 2. Ejecutar build con base-href personalizado
echo "🏗️ Ejecutando build con base-href=$BASE_HREF..."
ng build --base-href="$BASE_HREF" --configuration=production || { echo "❌ Error durante el build"; exit 1; }

# 3. Verificar que el dist existe
if [ ! -d "$DIST_DIR" ]; then
    echo "❌ No se encontró el directorio de salida: $DIST_DIR"
    exit 1
fi

# 4. Crear destino si no existe
sudo mkdir -p "$DESTINO"

# 5. Limpiar destino anterior
echo "🧹 Limpiando archivos antiguos en $DESTINO"
sudo rm -rf "$DESTINO"/*

# 6. Copiar archivos
echo "📂 Copiando archivos a $DESTINO"
sudo cp -r "$DIST_DIR"/* "$DESTINO"/

# 7. Asignar permisos (ajusta si usas otro usuario)
echo "🔐 Ajustando permisos..."
sudo chown -R nginx:nginx "$DESTINO"
sudo chmod -R 755 "$DESTINO"

# 8. Verificar y recargar nginx
echo "🔁 Verificando configuración de Nginx..."
sudo nginx -t || { echo "❌ Error en la configuración de Nginx"; exit 1; }

echo "🔄 Recargando Nginx..."
sudo systemctl reload nginx

# 9. Mensaje final
echo "✅ Despliegue completado correctamente. Visite:"
echo "🌐 https://hgtecpan.duckdns.org/medicapp/"

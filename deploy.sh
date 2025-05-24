#!/bin/bash

set -e  # Detener en cualquier error inesperado
set -o pipefail

echo "🚀 Iniciando despliegue de la app 'hospital3'..."

# Variables de entorno
PROYECTO_DIR="/home/matrix/Programas/hospital3"
DIST_DIR="$PROYECTO_DIR/dist/hospital3"
DESTINO="/var/www/hospital3"
BASE_HREF="/hospital3/"
USUARIO_SERVIDOR="nginx"

# 1. Ir al directorio del proyecto
echo "📁 Navegando al directorio del proyecto..."
cd "$PROYECTO_DIR" || { echo "❌ No se pudo acceder al proyecto"; exit 1; }

# 2. Compilar Angular con baseHref
echo "🏗️ Ejecutando build con baseHref=$BASE_HREF..."
yarn build --base-href="$BASE_HREF" || { echo "❌ Error durante el build"; exit 1; }

# 3. Verificar que el build fue exitoso
if [ ! -d "$DIST_DIR" ]; then
    echo "❌ No se encontró el directorio de salida: $DIST_DIR"
    exit 1
fi

# 4. Crear destino si no existe
echo "🧱 Creando directorio de destino si no existe..."
sudo mkdir -p "$DESTINO"

# 5. Eliminar archivos antiguos (opcional, para evitar basura previa)
echo "🧹 Limpiando destino anterior..."
sudo rm -rf "$DESTINO"/*

# 6. Copiar los archivos del build
echo "📦 Copiando archivos del build a $DESTINO"
sudo cp -r "$DIST_DIR"/* "$DESTINO"/

# 7. Asignar permisos
echo "🔐 Ajustando permisos de archivos..."
sudo chown -R $USUARIO_SERVIDOR:$USUARIO_SERVIDOR "$DESTINO"
sudo chmod -R 755 "$DESTINO"

# 8. Verificar y recargar Nginx
echo "🔍 Verificando configuración de Nginx..."
sudo nginx -t || { echo "❌ Configuración de Nginx inválida"; exit 1; }

echo "🔄 Recargando Nginx..."
sudo systemctl reload nginx

# 9. Mensaje final
echo "✅ Despliegue completado correctamente. Puede acceder en:"
echo "🌐 https://hgtecpan.duckdns.org/hospital3/"

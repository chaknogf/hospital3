#!/bin/bash

echo "🚀 Iniciando despliegue de la app 'Medical App'..."

# Ruta al proyecto Angular
PROYECTO_DIR="/home/matrix/Programas/hospital3"
DIST_DIR="$PROYECTO_DIR/dist/medicapp/browser"
DESTINO="/var/www/medicapp"
BASE_HREF="/medicapp/"

# 1. Ir al directorio del proyecto
cd "$PROYECTO_DIR" || { echo "❌ No se pudo acceder al proyecto"; exit 1; }

# 2. Git pull para obtener últimos cambios
echo "📥 Actualizando código desde git..."
git pull origin main || { echo "❌ Error en git pull"; exit 1; }

# 3. Cargar nvm e instalar Node.js 24 (si no está presente)
echo "🔧 Configurando Node.js..."
\. "$HOME/.nvm/nvm.sh"
nvm install 24 || { echo "❌ Error instalando Node.js"; exit 1; }

# 4. Configurar pnpm vía corepack
echo "📦 Configurando pnpm..."
corepack enable pnpm
pnpm install --frozen-lockfile || pnpm install || { echo "❌ Error instalando dependencias"; exit 1; }

# 5. Ejecutar build con base-href personalizado
echo "🏗️ Ejecutando build con base-href=$BASE_HREF..."
pnpm ng build --base-href="$BASE_HREF" --configuration=production || { echo "❌ Error durante el build"; exit 1; }

# 6. Verificar que el dist existe
if [ ! -d "$DIST_DIR" ]; then
    echo "❌ No se encontró el directorio de salida: $DIST_DIR"
    exit 1
fi

# 7. Crear destino si no existe
sudo mkdir -p "$DESTINO"

# 8. Limpiar destino anterior
echo "🧹 Limpiando archivos antiguos en $DESTINO"
sudo rm -rf "$DESTINO"/*

# 9. Copiar archivos
echo "📂 Copiando archivos a $DESTINO"
sudo cp -r "$DIST_DIR"/* "$DESTINO"/

# 10. Asignar permisos (ajusta si usas otro usuario)
echo "🔐 Ajustando permisos..."
sudo chown -R nginx:nginx "$DESTINO"
sudo chmod -R 755 "$DESTINO"

# 11. Verificar y recargar nginx
echo "🔁 Verificando configuración de Nginx..."
sudo nginx -t || { echo "❌ Error en la configuración de Nginx"; exit 1; }

echo "🔄 Recargando Nginx..."
sudo systemctl reload nginx

# 12. Mensaje final
echo "✅ Despliegue completado correctamente. Visite:"
echo "🌐 https://hgtecpan.duckdns.org/medicapp/"

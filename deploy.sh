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

# 3. Node.js (versión desde NODE_VERSION, .node-version o 24)
NODE_VERSION="${NODE_VERSION:-$(cat .node-version 2>/dev/null || echo 24)}"
NODE_MAJOR="${NODE_VERSION%%.*}"
NODE_MAJOR="${NODE_MAJOR//[!0-9]/}"
echo "🔧 Node.js objetivo: $NODE_VERSION (major $NODE_MAJOR)"

if ! command -v node &>/dev/null || [ "$(node -v | sed 's/^v//;s/\..*//')" != "$NODE_MAJOR" ]; then
  NVM_SH="${NVM_DIR:-$HOME/.nvm}/nvm.sh"
  if [ ! -s "$NVM_SH" ]; then
    echo "❌ nvm no encontrado en $NVM_SH. Instala Node.js $NODE_VERSION manualmente."
    exit 1
  fi
  # shellcheck disable=SC1090
  \. "$NVM_SH"
  echo "📥 Instalando/activando Node.js $NODE_VERSION..."
  nvm install "$NODE_VERSION" || { echo "❌ Error instalando Node.js"; exit 1; }
  nvm use "$NODE_VERSION" || { echo "❌ Error activando Node.js"; exit 1; }
  nvm alias default "$NODE_VERSION" >/dev/null 2>&1 || true
else
  echo "✅ Node.js $(node -v) ya está disponible"
fi
node -v

# 4. pnpm (versión desde PNPM_VERSION, packageManager o 12.15.0)
PNPM_VERSION="${PNPM_VERSION:-$(node -p "require('./package.json').packageManager?.split('@')[1] || ''" 2>/dev/null)}"
PNPM_VERSION="${PNPM_VERSION:-12.15.0}"
echo "📦 pnpm objetivo: $PNPM_VERSION"

if command -v corepack &>/dev/null; then
  corepack enable >/dev/null 2>&1 || true
  corepack install -g "pnpm@$PNPM_VERSION" >/dev/null 2>&1 \
    || corepack prepare "pnpm@$PNPM_VERSION" --activate >/dev/null 2>&1 \
    || true
fi

if ! command -v pnpm &>/dev/null || [ "$(pnpm -v 2>/dev/null)" != "$PNPM_VERSION" ]; then
  echo "📥 Instalando pnpm $PNPM_VERSION..."
  npm install -g "pnpm@$PNPM_VERSION" || { echo "❌ Error instalando pnpm"; exit 1; }
  hash -r 2>/dev/null || true
fi

command -v pnpm &>/dev/null || { echo "❌ pnpm no disponible"; exit 1; }
echo "✅ pnpm $(pnpm -v)"

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
echo "🌐 https://hgtecpan.com/medicapp/"

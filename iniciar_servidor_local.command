#!/bin/bash
# =====================================================================
# iniciar_servidor_local.command
# Doble-click este archivo en Finder para abrir la calculadora ENDES
# en tu navegador con servidor HTTP local (evita restricciones file://).
# =====================================================================
# Autor: Dr. Joshuan J. Barboza · Universidad Señor de Sipán
# =====================================================================

cd "$(dirname "$0")"

# Encontrar puerto libre
PORT=8000
while lsof -i :$PORT >/dev/null 2>&1; do
  PORT=$((PORT+1))
done

echo "======================================================"
echo "  Calculadora ENDES Perú - Servidor local"
echo "  Dr. Joshuan J. Barboza · Universidad Señor de Sipán"
echo "======================================================"
echo ""
echo "Sirviendo en: http://localhost:$PORT"
echo ""
echo "Abriendo navegador en 2 segundos..."
echo "Para detener el servidor: cierra esta ventana (Cmd+W)"
echo "======================================================"
echo ""

# Abrir navegador en 2s en paralelo
(sleep 2 && open "http://localhost:$PORT") &

# Detectar Python disponible (Mac trae Python 3 instalado)
if command -v python3 &>/dev/null; then
  python3 -m http.server $PORT
elif command -v python &>/dev/null; then
  python -m http.server $PORT
else
  echo "❌ Python no encontrado. Instala Python 3 desde python.org"
  read -p "Presiona Enter para cerrar..."
fi

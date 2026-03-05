#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# Charger le .env principal (TOKEN, CLIENT_ID, GUILD_ID, etc.)
if [ ! -f .env ]; then
  echo "Erreur : fichier .env introuvable à la racine du projet."
  echo "Copie .env.sample en .env et renseigne TOKEN, CLIENT_ID et GUILD_ID."
  exit 1
fi

set -a
source .env
set +a

# Injecter les credentials de la DB locale (écrase les valeurs du .env)
export DB_HOST=127.0.0.1
export DB_USER=root
export DB_PASSWORD=localdev
export DB_NAME=meteion_local

# Démarrer la base de données
echo "Démarrage de la base de données..."
docker compose -f local-run/docker-compose.yml up -d

# Attendre que MySQL soit prêt
echo "Attente de MySQL..."
until docker exec meteion_db_local mysqladmin ping -h localhost -u root -plocaldev --silent 2>/dev/null; do
  sleep 2
done
echo "MySQL prêt."

# Créer les tables depuis les modèles Sequelize
echo "Synchronisation du schéma..."
node local-run/sync-db.js

# Démarrer le bot en mode développement
echo "Démarrage du bot..."
npm run dev

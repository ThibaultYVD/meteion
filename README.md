# Météion

Météion is a NodeJs app with the DiscordJs module. This application is used to create and organise events with other people in Discord.

## Lancer en local

### Prérequis

- Node.js ≥ 18
- Une instance MySQL accessible
- Un bot Discord créé sur le [Discord Developer Portal](https://discord.com/developers/applications)

### 1. Configurer l'environnement

```bash
cp .env.sample .env
```

Remplir les variables dans `.env` :

| Variable | Description |
|---|---|
| `TOKEN` | Token du bot Discord |
| `CLIENT_ID` | ID de l'application Discord |
| `GUILD_ID` | ID du serveur Discord de développement |
| `DB_HOST` | Hôte MySQL (ex: `localhost`) |
| `DB_USER` | Utilisateur MySQL |
| `DB_PASSWORD` | Mot de passe MySQL |
| `DB_NAME` | Nom de la base de données |
| `APP_ENV` | Mettre `local` pour désactiver les gardes de production |
| `SUPERADMIN1` | (Optionnel) ID Discord d'un super-admin |
| `IMAGE_BASE_URL` | URL publique du serveur Fastify — requis pour afficher les images dans les embeds (voir ci-dessous) |

### 2. Inviter le bot sur le serveur

Sur le Discord Developer Portal, générer un lien OAuth2 en cochant les scopes **`bot`** et **`applications.commands`**, avec les permissions nécessaires.

### 3. Installer les dépendances et migrer la base

```bash
npm install
npx sequelize-cli db:migrate
```

### 4. Exposer le serveur Fastify (requis pour les images)

Le bot embarque un serveur Fastify qui sert les images uploadées. Discord doit pouvoir y accéder — en local, il faut un tunnel public. [localtunnel](https://theboroer.github.io/localtunnel-www/) est recommandé (pas d'interstitiel, gratuit) :

```bash
npx localtunnel --port 3000
```

Copier l'URL générée (ex: `https://xxxx.loca.lt`) dans `.env` :

```
IMAGE_BASE_URL=https://xxxx.loca.lt
```

> L'URL change à chaque démarrage de localtunnel. En production, `IMAGE_BASE_URL` est l'URL fixe du serveur.

### 5. Démarrer

```bash
npm run dev
```

Le bot se relance automatiquement à chaque modification dans `src/`. Le lint est exécuté avant chaque redémarrage.

---

## Lancer en debug

Deux configurations VS Code sont disponibles dans `.vscode/launch.json`.

### "Debug Bot"

Lance le bot une seule fois avec le debugger attaché. Les breakpoints sont actifs dès le démarrage.

**Via VS Code** : ouvrir le panneau *Run & Debug* (`Ctrl+Shift+D`) → sélectionner **Debug Bot** → `F5`.

**Via terminal** (sans VS Code) :

```bash
node --inspect -r module-alias/register src/index.js
```

Puis attacher un debugger sur `ws://127.0.0.1:9229` (Chrome DevTools → `chrome://inspect`, ou n'importe quel client DAP).

### "Debug Bot (watch)"

Identique à `npm run dev` mais avec le debugger attaché — le bot se relance automatiquement et le debugger se reconnecte à chaque redémarrage.

**Via VS Code** : sélectionner **Debug Bot (watch)** → `F5`.

> Le fichier `.env` est chargé automatiquement par les deux configurations VS Code.

---

## Migrations

```bash
# Créer une migration
npx sequelize-cli migration:generate --name feature-{id}

# Appliquer les migrations en attente
npx sequelize-cli db:migrate

# Annuler la dernière migration
npx sequelize-cli db:migrate:undo
```

## Tests

```bash
npm test                                          # tous les tests
npx jest src/Tests/path/to/file.test.js          # un fichier
npx jest -t "nom du test"                        # un test par nom
```

## Usage

Pour créer un événement, utiliser `/event` ou `/quickevent` dans un salon Discord.

- `/event` — ouvre un modal pour renseigner titre, description, date, heure et lieu. Accepte une image d'illustration en pièce jointe (optionnel).
- `/quickevent` — crée un événement directement avec titre et date en langage naturel (ex: *"demain à 21h"*).

Pour s'inscrire à un événement, cliquer sur les boutons sous le message (**✅ Participant**, **❓ Indécis**, **🪑 En réserve**, **❌ Absent**). Cliquer à nouveau sur le même bouton pour se désinscrire.

Le créateur peut modifier ou annuler l'événement via les boutons **Modifier** et **Supprimer**.

### Cycle de vie d'un événement

| Moment | Action |
|---|---|
| 1h avant le début | Message de rappel envoyé dans le salon |
| À l'heure du début | Statut → `ongoing`, rappel mis à jour |
| 3h après le début | Statut → `finished`, interactions verrouillées |
| 3 jours après le début | Statut → `archived`, messages de rappel supprimés |

Les administrateurs peuvent configurer ces comportements via `/settings`.

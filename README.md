# Protocol Vault

Plateforme de gestion de smart contracts EVM : dépôt de contrats Solidity, workspace d'équipe, validations (juridique / sécurité) et cycle de vie de déploiement.

- **Frontend** : React 19 + TanStack Start (v1), TanStack Router, TanStack Query
- **Style** : Tailwind CSS v4 (tokens de design dans `src/styles.css`) + composants shadcn/ui
- **Backend** : Lovable Cloud (Supabase) — auth, base de données, RLS
- **Wallet** : Reown AppKit (WalletConnect) + wagmi/viem
- **Mobile** : Capacitor (iOS / Android) — voir [MOBILE.md](./MOBILE.md)

## Prérequis

- **Node.js** 20 ou plus récent
- **Bun** (recommandé) :

  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

Tu peux aussi utiliser `npm` : remplace simplement `bun install` par `npm install` et `bun run <script>` par `npm run <script>`.

## 1. Cloner le dépôt

```bash
git clone https://github.com/raedkhd/<nom-du-depot>.git
cd <nom-du-depot>
```

## 2. Installer les dépendances

```bash
bun install
```

## 3. Lancer le projet

```bash
bun dev
```

Ouvre **http://localhost:8080** dans ton navigateur. Le serveur recharge à chaud dès que tu modifies un fichier dans `src/`.

## 4. Build et prévisualisation

```bash
bun run build      # build de production
bun run preview    # sert le build de production
```

## Variables d'environnement

Aucune configuration n'est nécessaire pour démarrer : le fichier `.env` est versionné et contient déjà l'URL du backend, la clé publiable, l'identifiant du projet et l'identifiant Reown.

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
VITE_REOWN_PROJECT_ID
```

Les clés secrètes (service role, mot de passe base de données) ne sont **jamais** dans le dépôt et ne sont pas disponibles sur Lovable Cloud.

## Scripts

| Commande | Effet |
| --- | --- |
| `bun dev` | Serveur de développement sur le port 8080 |
| `bun run build` | Build de production |
| `bun run build:dev` | Build en mode développement |
| `bun run preview` | Sert le build de production |
| `bun run lint` | Lint ESLint |
| `bun run format` | Formatte le code avec Prettier |

## Structure du projet

```
src/
  routes/            Routage par fichier (TanStack Start)
    __root.tsx       Shell de l'app : providers AppKit, <Toaster />, <Outlet />
    index.tsx        /
    auth.tsx         Connexion / inscription
    _authenticated/  Pages protégées (dépôt, contrat, cycle de vie, équipe, audits)
  components/        Composants réutilisables (sidebar, wallet-button, solidity-code…)
  integrations/      Clients backend et auth générés — ne pas éditer à la main
  lib/               Server functions et utilitaires
  styles.css         Thème Tailwind v4 (tokens de couleurs, ombres, gradients)
supabase/            Migrations et configuration du backend
capacitor.config.ts  Configuration mobile (iOS / Android)
```

## Notes

- `src/routeTree.gen.ts` est généré automatiquement : ne l'édite pas à la main.
- `src/integrations/supabase/` est auto-généré : ne modifie pas ces fichiers.
- `bunfig.toml` applique une garde supply-chain de 24 h sur les nouvelles versions de paquets.
- Pour empaqueter l'app en iOS ou Android, suis [MOBILE.md](./MOBILE.md).

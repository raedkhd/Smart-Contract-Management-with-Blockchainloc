# Build mobile (iOS / Android) avec Capacitor

L'app tourne normalement en SSR sur Cloudflare Workers pour le web. Pour la version mobile, Capacitor emballe un build **statique côté client** dans un webview natif — même interface, même code React.

## Prérequis

- Node.js + Bun installés
- **iOS** : macOS + Xcode 15+ + CocoaPods (`sudo gem install cocoapods`)
- **Android** : Android Studio + JDK 17

## 1. Exporter le projet vers GitHub

Clique sur le bouton **GitHub** en haut à droite de Lovable, puis clone le repo localement :

```bash
git clone <ton-repo>
cd <ton-repo>
bun install
```

## 2. Ajouter les plateformes natives (une fois)

```bash
bunx cap add ios
bunx cap add android
```

## 3. Builder le web puis synchroniser

L'app utilise TanStack Start (SSR). Pour Capacitor on a besoin d'un bundle client statique — on utilise le build standard puis Capacitor pointe sur `dist/`.

```bash
bun run build
bunx cap sync
```

> Note : si `dist/` contient une structure SSR incompatible, exécute `bunx cap copy` après un build pré-rendu. Pour un vrai app mobile 100% client, envisage de basculer sur SPA (voir plus bas).

## 4. Lancer l'app

```bash
# iOS (macOS uniquement)
bunx cap run ios

# Android
bunx cap run android
```

Ou ouvre les projets natifs :

```bash
bunx cap open ios
bunx cap open android
```

## Dev live (hot reload sur ton téléphone)

Décommente le bloc `server.url` dans `capacitor.config.ts` en pointant vers ton URL Lovable preview, puis `bunx cap sync`. L'app mobile chargera directement le site en ligne — chaque modif Lovable apparaît instantanément.

## Après chaque `git pull`

```bash
bun install
bun run build
bunx cap sync
```

## Notes

- **Supabase / Lovable Cloud** : fonctionne tel quel dans le webview (auth, DB, storage).
- **Wallet EVM** : `window.ethereum` n'existe pas en natif — pour production mobile, utilise WalletConnect (à ajouter séparément).
- **SSR vs SPA** : le build actuel est SSR-first. Pour un vrai app mobile offline, il faudrait un mode SPA/prerender — dis-le-moi si besoin.

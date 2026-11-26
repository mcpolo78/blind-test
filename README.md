# Blind test

Projet perso de blind test musical avec Vue.js : on choisit une playlist (dessins animés, séries TV…) et on reconnaît les génériques.

## API (fonctions Vercel, dossier `api/`)

Les playlists et leurs sons sont en base (Postgres Neon, tables `playlists` et `tracks`) et se gèrent depuis `/admin`. Au premier démarrage, la base est remplie une seule fois avec `api/_lib/seed.js` (les génériques de dessins animés d'origine) ; ce fichier n'a plus d'effet ensuite. Les extraits (30 s) et les pochettes viennent de l'API publique Deezer.

- `GET /api/playlists` : playlists jouables (4 sons minimum).
- `GET /api/questions?playlist=<slug>|all&seed=N` : 10 questions (même graine = même partie, pour le mode défi).
- `GET /api/cartoons?playlist=<slug>` : nom + vignette de chaque son.
- `POST /api/scores` et `GET /api/scores/top?period=day|week|all` : scores.
- Admin, protégé par l'en-tête `x-admin-password` :
  - `/api/admin/playlists` : lister, créer, renommer, réordonner, supprimer les playlists ; `?id=` liste les sons d'une playlist.
  - `/api/admin/tracks` : recherche Deezer (`?q=`), ajouter, modifier (nom, image, playlist), retirer un son.
  - `/api/admin/scores` : lister et supprimer les scores.

Variables d'environnement Vercel : `DATABASE_URL` (ajoutée par l'intégration Neon) et `ADMIN_PASSWORD`.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
#

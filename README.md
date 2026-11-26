# mon-projet-vue

Projet perso de blind test avec Vue.js

## API (fonctions Vercel, dossier `api/`)

- `GET /api/questions` : 10 questions tirées au hasard dans `api/_lib/cartoons.js`. Les extraits (30 s) et les vignettes viennent de l'API publique Deezer.
- `GET /api/cartoons` : nom + vignette de chaque dessin animé.
- `POST /api/scores` et `GET /api/scores/top` : scores stockés dans Postgres (Neon).
- `GET|DELETE /api/admin/scores` : gestion des scores, page `/admin`, protégée par mot de passe.

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

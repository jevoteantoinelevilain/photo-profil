# V10 — correctif portrait

Le portrait n'apparaissait pas alors que le HTML/CSS V9 était bien chargé.
Cette version force un nouveau chargement de l'asset avec des noms de fichiers uniques et un fallback :

- `assets/antoine-portrait-v10.webp` — version optimisée (~260 Ko)
- `assets/antoine-portrait-v10.png` — fallback PNG
- balise `<picture>` avec WebP + PNG
- `loading=eager` + `fetchpriority=high`
- cache-busting `?v=10`
- visibilité/opacity du portrait explicitement forcées dans le CSS

Le reste de la V9 est conservé.

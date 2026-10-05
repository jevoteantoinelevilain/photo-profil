# V32 — Correction du partage social

- Le dépôt était syntaxiquement valide et tous les assets locaux étaient présents.
- Le partage utilisait toujours l'URL racine, déjà susceptible d'être mise en cache par les plateformes sociales.
- Le texte JavaScript de partage était à jour, mais les métadonnées Open Graph/Twitter ne reprenaient pas exactement ce texte.
- Ajout d'une page de partage dédiée `partage-v32.html` avec une URL unique pour forcer une nouvelle récupération des métadonnées.
- Nouveau nom d'asset `share-preview-saint-amand-v32.png` afin d'éviter le cache de l'ancienne image.
- Ajout de `og:image:type`, `og:image:width`, `og:image:height` et `og:image:secure_url`.
- La page dédiée redirige les visiteurs humains vers la page principale via JavaScript.
- Le workflow GitHub Pages actuel reste déclenché automatiquement uniquement sur la branche `main`.

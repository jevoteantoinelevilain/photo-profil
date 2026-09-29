# V9 — refonte UI/UX complète

Cette version repart de zéro pour l’interface visuelle.

## Principes
- Une seule famille de rose premium sur toute la page.
- Une seule carte blanche principale : le choix de la photo.
- Portrait détouré utilisé comme illustration indépendante.
- Étapes 2 et 3 intégrées directement dans le fond rose.
- Footer dans la même palette que le reste du site.
- Responsive mobile + desktop.
- Overlay 1080×1080 actuel conservé.
- Flux Facebook mobile/desktop conservé.

## Fichiers à remplacer / ajouter
- `index.html`
- `css/style.css`
- `js/app.js`
- `js/config.js`
- `assets/antoine-cutout.png`
- `assets/overlay-antoine-le-vilain-v2.png`

Les fichiers `js/facebook.js`, `js/editor.js` et `js/share.js` sont inclus par commodité.

## Important
Le design ne dépend plus d’un background image complet. Le portrait est désormais un composant responsive séparé.

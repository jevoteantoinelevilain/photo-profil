# V33 — Correctif immédiat Facebook

- Le diagnostic précédent « Application inactive » vient du statut de l'application Meta, pas du canvas.
- En attendant sa réactivation, le bouton « Utiliser ma photo Facebook » ouvre directement la photothèque/fichier de l'utilisateur afin de ne plus bloquer le parcours.
- L'ancien flux OAuth est conservé dans `js/facebook.js` et peut être réactivé en remplaçant `FACEBOOK_IMPORT_MODE: "local-fallback"` par `"oauth"` dans `js/config.js`.
- Le bouton « Ouvrir Facebook » pointe désormais vers `https://www.facebook.com/me`, qui ouvre le profil du compte Facebook connecté.

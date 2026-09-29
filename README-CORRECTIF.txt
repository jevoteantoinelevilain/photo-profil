CORRECTIF COMPLET V4

Ce patch corrige les trois points demandés :

1. Facebook mobile
   - Sur mobile/iPhone/Android, plus de popup JavaScript.
   - Le bouton lance une redirection OAuth pleine page vers Facebook.
   - Après authentification, le site revient automatiquement sur :
     https://jevoteantoinelevilain.github.io/photo-profil/
   - Le token est lu dans le fragment d'URL, validé avec un state, puis retiré de l'URL.
   - Sur desktop, le SDK Facebook et le popup restent utilisés.

2. Background homepage
   - Le fichier fourni "Design background homepage.png" est réellement intégré :
     assets/homepage-background.png
   - CSS configuré pour mobile et desktop.

3. Overlay / bandeau
   - Le PNG fourni "Overlay:bandeau Antoine Le Vilain.png" est réellement intégré :
     assets/overlay-antoine-le-vilain.png
   - js/config.js pointe vers ce fichier.
   - Le fichier fourni possède une couche alpha : il est donc superposé à la photo utilisateur dans le Canvas.

FICHIERS À REMPLACER / AJOUTER

index.html
css/style.css
js/config.js
js/facebook.js
js/app.js
assets/homepage-background.png
assets/overlay-antoine-le-vilain.png

NE PAS SUPPRIMER
js/editor.js
js/share.js
privacy.html
delete-data.html
terms.html
.github/workflows/main.yml

META
Conserver comme URI OAuth valide :
https://jevoteantoinelevilain.github.io/photo-profil/

Le domaine SDK reste :
jevoteantoinelevilain.github.io

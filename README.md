# Photo de profil — Antoine Le Vilain

Microsite statique hébergé sur GitHub Pages permettant de créer localement un visuel de photo de soutien.

## Fonctionnement

- sélection d’une photo depuis l’appareil ;
- recadrage, déplacement et zoom dans un canvas 1080 × 1080 ;
- application de l’overlay de campagne ;
- génération du visuel final ;
- téléchargement et partage natif lorsque le navigateur le permet ;
- aucun stockage de photo côté serveur.

## Facebook

Le site ne dépend plus de Facebook Login, du SDK Facebook, de Graph API ni d’une application Meta pour importer la photo.

Le bouton « Ouvrir Facebook » de l’étape finale est uniquement un lien externe vers `https://www.facebook.com/me` pour faciliter l’accès au profil de l’utilisateur connecté. Il n’effectue aucune authentification pour le site.

## Déploiement

Le projet est statique et peut être déployé directement sur GitHub Pages.

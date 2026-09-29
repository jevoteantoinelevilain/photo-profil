# Photo campagne — V1

Mini-site statique compatible GitHub Pages.

## Fonctionnalités

- import manuel d’une photo ;
- Facebook Login avec récupération de la photo de profil lorsque Meta et le navigateur l’autorisent ;
- recadrage carré 1080×1080 ;
- déplacement souris / tactile ;
- zoom au curseur et pincement à deux doigts ;
- superposition d’un habillage SVG/PNG ;
- génération JPEG locale ;
- Web Share API lorsque le navigateur sait partager le fichier ;
- téléchargement en fallback desktop ;
- aucun backend applicatif requis pour la V1.

## 1. Personnaliser le bandeau

Remplacez `assets/bandeau.svg` par votre visuel final.

Recommandation :
- 1080×1080 px ;
- SVG ou PNG avec transparence ;
- conservez les zones de la photo que vous voulez laisser visibles.

Si vous changez le nom du fichier, modifiez `OVERLAY_SRC` dans `js/config.js`.

## 2. Activer Facebook Login

Dans `js/config.js`, remplacez :

```js
FACEBOOK_APP_ID: "VOTRE_APP_ID_META"
```

par l’identifiant public de votre application Meta.

La V1 est configurée pour :

```js
GRAPH_API_VERSION: "v26.0"
```

Dans Meta for Developers, configurez Facebook Login pour votre URL finale et ajoutez le domaine du site.
L’intitulé exact des écrans Meta peut évoluer.

Pour un site GitHub Pages de projet, l’URL ressemble à :

`https://VOTRE-COMPTE.github.io/NOM-DU-DEPOT/`

Si vous utilisez un domaine personnalisé, configurez ce domaine côté GitHub Pages et côté application Meta.

### Important : CORS de la photo Facebook

La connexion Facebook et la lecture de l’URL de photo peuvent réussir alors que le navigateur refuse ensuite
d’utiliser cette image distante dans un `<canvas>` en raison des règles CORS du CDN.

La V1 gère ce cas proprement : elle affiche un message et conserve l’import manuel en fallback.

Si ce blocage se produit de façon régulière en production, l’étape suivante est d’ajouter un petit proxy
serverless contrôlé (par exemple une fonction edge) afin de récupérer l’image puis de la renvoyer avec des
en-têtes CORS adaptés. GitHub Pages seul ne peut pas exécuter ce proxy.

## 3. Tester localement

Ne double-cliquez pas simplement sur `index.html`, car certaines API navigateur nécessitent HTTP/HTTPS.

Exemple avec Python :

```bash
python3 -m http.server 8080
```

Puis ouvrez :

`http://localhost:8080`

Facebook Login demandera une URL autorisée dans la configuration de l’app Meta.

## 4. Déployer avec GitHub Pages

Le dépôt contient `.github/workflows/pages.yml`.

Après avoir poussé les fichiers sur la branche `main` :

1. ouvrez `Settings` > `Pages` dans GitHub ;
2. sélectionnez GitHub Actions comme source de déploiement si nécessaire ;
3. le workflow déploiera automatiquement le site à chaque push sur `main`.

## 5. Ce que le site ne fait pas

- il ne remplace pas automatiquement la photo de profil Facebook ;
- il ne peut pas forcer Facebook comme cible du menu de partage ;
- il ne stocke pas les photos dans une base de données ;
- il ne contient aucun secret Meta : l’App ID est public, mais ne mettez jamais un App Secret dans ce dépôt.

## Fichiers principaux

- `index.html` : interface ;
- `css/style.css` : styles ;
- `js/config.js` : paramètres ;
- `js/facebook.js` : Facebook Login ;
- `js/editor.js` : Canvas, zoom et déplacement ;
- `js/share.js` : partage mobile ;
- `js/app.js` : orchestration ;
- `assets/bandeau.svg` : overlay à remplacer ;
- `privacy.html` : base à adapter avant publication.

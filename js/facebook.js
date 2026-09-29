(() => {
  const cfg = window.APP_CONFIG;
  let sdkPromise = null;

  function configured() {
    return Boolean(
      cfg.FACEBOOK_APP_ID &&
      cfg.FACEBOOK_APP_ID !== "VOTRE_APP_ID_META"
    );
  }

  function loadSdk() {
    if (!configured()) {
      return Promise.reject(new Error(
        "Facebook Login n’est pas encore configuré. Ajoutez votre App ID Meta dans js/config.js."
      ));
    }

    if (window.FB) return Promise.resolve(window.FB);
    if (sdkPromise) return sdkPromise;

    sdkPromise = new Promise((resolve, reject) => {
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: cfg.FACEBOOK_APP_ID,
          cookie: true,
          xfbml: false,
          version: cfg.GRAPH_API_VERSION
        });
        resolve(window.FB);
      };

      const script = document.createElement("script");
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.src = "https://connect.facebook.net/fr_FR/sdk.js";
      script.onerror = () => reject(new Error("Le SDK Facebook n’a pas pu être chargé."));
      document.head.appendChild(script);
    });

    return sdkPromise;
  }

  function login() {
    return new Promise(async (resolve, reject) => {
      try {
        const FB = await loadSdk();

        FB.login((loginResponse) => {
          if (!loginResponse.authResponse) {
            reject(new Error("Connexion Facebook annulée ou non autorisée."));
            return;
          }

          FB.api(
            "/me",
            "GET",
            { fields: "id,name,picture.width(1080).height(1080)" },
            (profile) => {
              if (!profile || profile.error) {
                reject(new Error(profile?.error?.message || "Impossible de lire le profil Facebook."));
                return;
              }

              const url = profile?.picture?.data?.url;
              if (!url) {
                reject(new Error("Facebook n’a pas renvoyé d’URL de photo de profil."));
                return;
              }

              resolve({
                name: profile.name || "",
                pictureUrl: url
              });
            }
          );
        }, { scope: "public_profile" });
      } catch (error) {
        reject(error);
      }
    });
  }

  window.FacebookImport = {
    configured,
    loadSdk,
    login
  };
})();

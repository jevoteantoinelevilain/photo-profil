(() => {
  const cfg = window.APP_CONFIG;

  let sdkPromise = null;
  let sdkReady = false;

  function configured() {
    return Boolean(
      cfg.FACEBOOK_APP_ID &&
      cfg.FACEBOOK_APP_ID !== "VOTRE_APP_ID_META"
    );
  }

  function isMobileBrowser() {
    const ua = navigator.userAgent || "";
    const mobileUA = /iPhone|iPad|iPod|Android|Mobile/i.test(ua);
    const touchDevice = (navigator.maxTouchPoints || 0) > 0;
    return mobileUA || (touchDevice && window.innerWidth < 1100);
  }

  function cleanOAuthHash() {
    const cleanUrl = window.location.pathname + window.location.search;
    history.replaceState(null, document.title, cleanUrl);
  }

  function randomState() {
    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }

    const bytes = new Uint32Array(4);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, n => n.toString(16)).join("");
  }

  async function fetchPictureAsLocalBlob(accessToken) {
    const pictureEndpoint = new URL(
      `https://graph.facebook.com/${cfg.GRAPH_API_VERSION}/me/picture`
    );

    pictureEndpoint.searchParams.set("width", "1080");
    pictureEndpoint.searchParams.set("height", "1080");
    pictureEndpoint.searchParams.set("access_token", accessToken);

    try {
      const response = await fetch(pictureEndpoint.toString(), {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        redirect: "follow",
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`Facebook image HTTP ${response.status}`);
      }

      const blob = await response.blob();

      if (!blob.type.startsWith("image/")) {
        throw new Error("Facebook n’a pas renvoyé une image.");
      }

      return {
        pictureUrl: URL.createObjectURL(blob),
        objectUrl: true
      };
    } catch (error) {
      // Fallback : récupération de l’URL publique de la photo.
      const profileEndpoint = new URL(
        `https://graph.facebook.com/${cfg.GRAPH_API_VERSION}/me`
      );

      profileEndpoint.searchParams.set(
        "fields",
        "id,picture.width(1080).height(1080)"
      );
      profileEndpoint.searchParams.set("access_token", accessToken);

      const response = await fetch(profileEndpoint.toString(), {
        mode: "cors",
        credentials: "omit",
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Impossible de récupérer la photo Facebook.");
      }

      const profile = await response.json();
      const url = profile?.picture?.data?.url;

      if (!url) {
        throw new Error("Facebook n’a pas renvoyé de photo de profil.");
      }

      return {
        pictureUrl: url,
        objectUrl: false
      };
    }
  }

  function startRedirectLogin() {
    if (!configured()) {
      throw new Error("Facebook Login n’est pas configuré.");
    }

    const state = randomState();
    sessionStorage.setItem("fb_oauth_state", state);

    const redirectUri =
      cfg.FACEBOOK_REDIRECT_URI ||
      `${window.location.origin}${window.location.pathname}`;

    const authUrl = new URL(
      `https://www.facebook.com/${cfg.GRAPH_API_VERSION}/dialog/oauth`
    );

    authUrl.searchParams.set("client_id", cfg.FACEBOOK_APP_ID);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("response_type", "token");
    authUrl.searchParams.set("scope", "public_profile");
    authUrl.searchParams.set("display", "touch");

    window.location.assign(authUrl.toString());
  }

  async function consumeRedirectLogin() {
    if (!window.location.hash) {
      return null;
    }

    const params = new URLSearchParams(window.location.hash.slice(1));

    const oauthError = params.get("error");
    if (oauthError) {
      const description =
        params.get("error_description") ||
        "Connexion Facebook interrompue.";

      cleanOAuthHash();
      throw new Error(description);
    }

    const accessToken = params.get("access_token");

    if (!accessToken) {
      return null;
    }

    const returnedState = params.get("state");
    const expectedState = sessionStorage.getItem("fb_oauth_state");

    sessionStorage.removeItem("fb_oauth_state");
    cleanOAuthHash();

    if (!expectedState || returnedState !== expectedState) {
      throw new Error(
        "La réponse Facebook n’a pas pu être vérifiée. Relancez la connexion."
      );
    }

    return fetchPictureAsLocalBlob(accessToken);
  }

  function loadSdk() {
    if (!configured()) {
      return Promise.reject(
        new Error("Facebook Login n’est pas configuré.")
      );
    }

    if (window.FB && sdkReady) {
      return Promise.resolve(window.FB);
    }

    if (sdkPromise) {
      return sdkPromise;
    }

    sdkPromise = new Promise((resolve, reject) => {
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: cfg.FACEBOOK_APP_ID,
          cookie: true,
          xfbml: false,
          version: cfg.GRAPH_API_VERSION
        });

        sdkReady = true;
        resolve(window.FB);
      };

      const script = document.createElement("script");
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.src = "https://connect.facebook.net/fr_FR/sdk.js";

      script.onerror = () => {
        sdkPromise = null;
        reject(
          new Error("Le SDK Facebook n’a pas pu être chargé.")
        );
      };

      document.head.appendChild(script);
    });

    return sdkPromise;
  }

  function popupLogin() {
    return new Promise((resolve, reject) => {
      if (!window.FB || !sdkReady) {
        reject(
          new Error("Facebook est encore en cours de préparation.")
        );
        return;
      }

      window.FB.login(async (loginResponse) => {
        const accessToken =
          loginResponse?.authResponse?.accessToken;

        if (!accessToken) {
          reject(
            new Error("Connexion Facebook annulée ou non autorisée.")
          );
          return;
        }

        try {
          resolve(await fetchPictureAsLocalBlob(accessToken));
        } catch (error) {
          reject(error);
        }
      }, {
        scope: "public_profile"
      });
    });
  }

  function usesRedirectFlow() {
    return isMobileBrowser();
  }

  window.FacebookImport = {
    configured,
    usesRedirectFlow,
    startRedirectLogin,
    consumeRedirectLogin,
    loadSdk,
    popupLogin,
    isReady: () => sdkReady && Boolean(window.FB)
  };
})();

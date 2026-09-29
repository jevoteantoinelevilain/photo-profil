(() => {
  const facebookButton = document.getElementById("facebookButton");
  const facebookNotice = document.getElementById("facebookNotice");
  const fileInput = document.getElementById("fileInput");
  const editorSection = document.getElementById("editorSection");
  const resultSection = document.getElementById("resultSection");
  const resetButton = document.getElementById("resetButton");
  const generateButton = document.getElementById("generateButton");
  const resultImage = document.getElementById("resultImage");
  const shareButton = document.getElementById("shareButton");
  const downloadButton = document.getElementById("downloadButton");
  const facebookButtonLabel = facebookButton.querySelector(".button-label");
  const generateButtonLabel = generateButton.querySelector(".button-label");

  let resultBlob = null;
  let resultUrl = null;

  function showNotice(message, isError = false) {
    facebookNotice.hidden = false;
    facebookNotice.textContent = message;
    facebookNotice.classList.toggle("error", isError);
  }

  function hideNotice() {
    facebookNotice.hidden = true;
    facebookNotice.textContent = "";
    facebookNotice.classList.remove("error");
  }

  function showEditor() {
    editorSection.hidden = false;
    resultSection.hidden = true;

    editorSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  async function useFacebookPicture(profile) {
    try {
      await window.PhotoEditor.setSourceImage(
        profile.pictureUrl,
        profile.objectUrl
          ? {}
          : { crossOrigin: "anonymous" }
      );

      if (profile.objectUrl) {
        URL.revokeObjectURL(profile.pictureUrl);
      }

      hideNotice();
      showEditor();
    } catch (error) {
      if (profile.objectUrl) {
        URL.revokeObjectURL(profile.pictureUrl);
      }

      showNotice(
        "La connexion Facebook a réussi, mais votre navigateur empêche l’utilisation directe de cette photo. Choisissez la même photo depuis votre appareil pour continuer.",
        true
      );
    }
  }

  async function loadLocalFile(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotice(
        "Choisissez un fichier image pour continuer.",
        true
      );
      return;
    }

    hideNotice();

    const localUrl = URL.createObjectURL(file);

    try {
      await window.PhotoEditor.setSourceImage(localUrl);
      showEditor();
    } catch (error) {
      showNotice(
        error.message ||
          "Impossible de charger cette photo. Essayez avec une autre image.",
        true
      );
    } finally {
      setTimeout(
        () => URL.revokeObjectURL(localUrl),
        1000
      );
    }
  }

  fileInput.addEventListener("change", () => {
    loadLocalFile(fileInput.files?.[0]);
  });

  facebookButton.addEventListener("click", () => {
    hideNotice();

    if (window.FacebookImport.usesRedirectFlow()) {
      facebookButton.disabled = true;
      facebookButtonLabel.textContent = "Ouverture de Facebook…";

      try {
        window.FacebookImport.startRedirectLogin();
      } catch (error) {
        facebookButton.disabled = false;
        facebookButtonLabel.textContent =
          "Utiliser ma photo Facebook";

        showNotice(
          error.message ||
            "Impossible d’ouvrir Facebook.",
          true
        );
      }

      return;
    }

    if (!window.FacebookImport.isReady()) {
      showNotice(
        "Facebook est encore en cours de préparation. Réessayez dans un instant.",
        true
      );
      return;
    }

    facebookButton.disabled = true;
    facebookButtonLabel.textContent =
      "Connexion à Facebook…";

    window.FacebookImport.popupLogin()
      .then(useFacebookPicture)
      .catch((error) => {
        showNotice(
          error.message ||
            "La connexion Facebook n’a pas abouti.",
          true
        );
      })
      .finally(() => {
        facebookButton.disabled = false;
        facebookButtonLabel.textContent =
          "Utiliser ma photo Facebook";
      });
  });

  resetButton.addEventListener("click", () => {
    window.PhotoEditor.reset();
  });

  generateButton.addEventListener("click", async () => {
    generateButton.disabled = true;
    generateButtonLabel.textContent =
      "Création de votre photo…";

    try {
      resultBlob =
        await window.PhotoEditor.exportBlob();

      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }

      resultUrl = URL.createObjectURL(resultBlob);

      resultImage.src = resultUrl;
      downloadButton.href = resultUrl;

      shareButton.hidden = !(
        await window.ShareTools.canShareBlob(
          resultBlob
        )
      );

      resultSection.hidden = false;

      resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    } catch (error) {
      alert(
        error.message ||
          "Impossible de générer le visuel."
      );
    } finally {
      generateButton.disabled = false;
      generateButtonLabel.textContent =
        "Créer ma photo de soutien";
    }
  });

  shareButton.addEventListener("click", async () => {
    if (!resultBlob) return;

    try {
      await window.ShareTools.shareBlob(
        resultBlob
      );
    } catch (error) {
      if (error?.name !== "AbortError") {
        alert(
          error.message ||
            "Le partage n’a pas pu être ouvert."
        );
      }
    }
  });

  async function bootstrapFacebook() {
    if (!window.FacebookImport.configured()) {
      facebookButton.disabled = true;

      showNotice(
        "L’import Facebook n’est pas disponible pour le moment. Vous pouvez choisir une photo sur votre appareil.",
        true
      );

      return;
    }

    try {
      const redirectProfile =
        await window.FacebookImport.consumeRedirectLogin();

      if (redirectProfile) {
        facebookButton.disabled = true;
        facebookButtonLabel.textContent =
          "Récupération de votre photo…";

        await useFacebookPicture(
          redirectProfile
        );
      }
    } catch (error) {
      showNotice(
        error.message ||
          "La connexion Facebook n’a pas abouti.",
        true
      );
    }

    if (window.FacebookImport.usesRedirectFlow()) {
      facebookButton.disabled = false;
      facebookButtonLabel.textContent =
        "Utiliser ma photo Facebook";
      return;
    }

    facebookButton.disabled = true;
    facebookButtonLabel.textContent =
      "Préparation de Facebook…";

    try {
      await window.FacebookImport.loadSdk();

      facebookButton.disabled = false;
      facebookButtonLabel.textContent =
        "Utiliser ma photo Facebook";
    } catch (error) {
      facebookButton.disabled = false;
      facebookButtonLabel.textContent =
        "Réessayer Facebook";

      showNotice(
        "Facebook n’a pas pu être préparé. Vous pouvez réessayer ou choisir une photo sur votre appareil.",
        true
      );
    }
  }

  bootstrapFacebook();
})();

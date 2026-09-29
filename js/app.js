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
    editorSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function loadLocalFile(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotice("Choisissez un fichier image pour continuer.", true);
      return;
    }

    hideNotice();
    const localUrl = URL.createObjectURL(file);

    try {
      await window.PhotoEditor.setSourceImage(localUrl);
      showEditor();
    } catch (error) {
      showNotice(error.message || "Impossible de charger cette photo. Essayez avec une autre image.", true);
    } finally {
      setTimeout(() => URL.revokeObjectURL(localUrl), 1000);
    }
  }

  fileInput.addEventListener("change", () => {
    loadLocalFile(fileInput.files?.[0]);
  });

  async function prepareFacebook() {
    if (!window.FacebookImport.configured()) {
      showNotice("L’import Facebook n’est pas disponible pour le moment. Vous pouvez choisir une photo sur votre appareil.", true);
      facebookButton.disabled = true;
      return;
    }

    facebookButton.disabled = true;
    facebookButton.textContent = "Préparation de Facebook…";

    try {
      await window.FacebookImport.loadSdk();
      facebookButton.disabled = false;
      facebookButton.textContent = "Importer ma photo Facebook";
    } catch (error) {
      facebookButton.disabled = false;
      facebookButton.textContent = "Réessayer l’import Facebook";
      showNotice("Facebook n’a pas pu être préparé. Vous pouvez réessayer ou choisir une photo sur votre appareil.", true);
    }
  }

  facebookButton.addEventListener("click", () => {
    hideNotice();

    if (!window.FacebookImport.isReady()) {
      showNotice("Facebook se prépare. Touchez à nouveau le bouton dans un instant.", true);
      prepareFacebook();
      return;
    }

    facebookButton.disabled = true;
    facebookButton.textContent = "Connexion à Facebook…";

    const loginPromise = window.FacebookImport.login();

    loginPromise
      .then(async (profile) => {
        try {
          await window.PhotoEditor.setSourceImage(profile.pictureUrl, {
            crossOrigin: "anonymous"
          });

          showEditor();
        } catch (corsError) {
          showNotice(
            "La connexion Facebook a réussi, mais votre navigateur empêche l’import direct de la photo. Choisissez la même photo depuis votre appareil pour continuer.",
            true
          );
        }
      })
      .catch((error) => {
        showNotice(error.message || "La connexion Facebook n’a pas abouti. Vous pouvez réessayer ou choisir une photo sur votre appareil.", true);
      })
      .finally(() => {
        facebookButton.disabled = false;
        facebookButton.textContent = "Importer ma photo Facebook";
      });
  });

  resetButton.addEventListener("click", () => {
    window.PhotoEditor.reset();
  });

  generateButton.addEventListener("click", async () => {
    generateButton.disabled = true;
    generateButton.textContent = "Création de votre visuel…";

    try {
      resultBlob = await window.PhotoEditor.exportBlob();

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      resultUrl = URL.createObjectURL(resultBlob);

      resultImage.src = resultUrl;
      downloadButton.href = resultUrl;
      shareButton.hidden = !(await window.ShareTools.canShareBlob(resultBlob));

      resultSection.hidden = false;
      resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      alert(error.message || "Impossible de générer le visuel.");
    } finally {
      generateButton.disabled = false;
      generateButton.textContent = "Créer ma photo de soutien";
    }
  });

  shareButton.addEventListener("click", async () => {
    if (!resultBlob) return;

    try {
      await window.ShareTools.shareBlob(resultBlob);
    } catch (error) {
      if (error?.name !== "AbortError") {
        alert(error.message || "Le partage n’a pas pu être ouvert. Vous pouvez enregistrer l’image puis la partager depuis votre téléphone.");
      }
    }
  });

  prepareFacebook();
})();

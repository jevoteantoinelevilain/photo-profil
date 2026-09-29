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
      showNotice("Le fichier choisi n’est pas une image.", true);
      return;
    }

    hideNotice();
    const localUrl = URL.createObjectURL(file);

    try {
      await window.PhotoEditor.setSourceImage(localUrl);
      showEditor();
    } catch (error) {
      showNotice(error.message || "Impossible de charger cette photo.", true);
    } finally {
      // L'image a déjà été décodée par le navigateur.
      setTimeout(() => URL.revokeObjectURL(localUrl), 1000);
    }
  }

  fileInput.addEventListener("change", () => {
    loadLocalFile(fileInput.files?.[0]);
  });

  facebookButton.addEventListener("click", async () => {
    hideNotice();
    facebookButton.disabled = true;
    facebookButton.textContent = "Connexion à Facebook…";

    try {
      const profile = await window.FacebookImport.login();

      try {
        // Le CDN Meta peut refuser l'utilisation cross-origin dans Canvas
        // selon l'URL renvoyée. On tente le chargement CORS ; le fallback
        // manuel reste disponible si le navigateur le bloque.
        await window.PhotoEditor.setSourceImage(profile.pictureUrl, {
          crossOrigin: "anonymous"
        });
        showEditor();
      } catch (corsError) {
        showNotice(
          "La connexion Facebook a réussi, mais le navigateur a bloqué l’utilisation directe de la photo dans l’éditeur. Choisissez la même photo depuis votre appareil pour continuer.",
          true
        );
      }
    } catch (error) {
      showNotice(error.message || "Connexion Facebook impossible.", true);
    } finally {
      facebookButton.disabled = false;
      facebookButton.textContent = "Utiliser ma photo Facebook";
    }
  });

  resetButton.addEventListener("click", () => {
    window.PhotoEditor.reset();
  });

  generateButton.addEventListener("click", async () => {
    generateButton.disabled = true;
    generateButton.textContent = "Création…";

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
      alert(error.message || "Impossible de générer l’image.");
    } finally {
      generateButton.disabled = false;
      generateButton.textContent = "Créer l’image";
    }
  });

  shareButton.addEventListener("click", async () => {
    if (!resultBlob) return;

    try {
      await window.ShareTools.shareBlob(resultBlob);
    } catch (error) {
      if (error?.name !== "AbortError") {
        alert(error.message || "Le partage n’a pas pu être ouvert.");
      }
    }
  });

  if (!window.FacebookImport.configured()) {
    showNotice(
      "Mode V1 : l’import manuel fonctionne immédiatement. Pour activer « Utiliser ma photo Facebook », renseignez l’App ID Meta dans js/config.js."
    );
  }
})();

(() => {
  const uploadNotice = document.getElementById("uploadNotice");
  const fileInput = document.getElementById("fileInput");
  const editorSection = document.getElementById("editorSection");
  const resultSection = document.getElementById("resultSection");
  const resetButton = document.getElementById("resetButton");
  const generateButton = document.getElementById("generateButton");
  const resultImage = document.getElementById("resultImage");
  const shareButton = document.getElementById("shareButton");
  const downloadButton = document.getElementById("downloadButton");
  const friendShareSection = document.querySelector(".friend-share-section");
  const shareSiteButton = document.getElementById("shareSiteButton");
  const shareSiteFeedback = document.getElementById("shareSiteFeedback");
  const SITE_SHARE_URL = "https://jevoteantoinelevilain.github.io/photo-profil/partage-v36.html";
  const SITE_SHARE_TITLE = "Antoine Le Vilain — Photo de soutien";
  const SITE_SHARE_TEXT = "Ajoutez votre photo de profil pour créer un visuel personnalisé et partagez un soutien fort à Antoine Le Vilain pour les élections municipales à Saint-Amand-Montrond.";
  const generateButtonLabel = generateButton.querySelector(".button-label");

  let resultBlob = null;
  let resultUrl = null;

  function showNotice(message, isError = false) {
    uploadNotice.hidden = false;
    uploadNotice.textContent = message;
    uploadNotice.classList.toggle("error", isError);
  }

  function hideNotice() {
    uploadNotice.hidden = true;
    uploadNotice.textContent = "";
    uploadNotice.classList.remove("error");
  }

  function showEditor() {
    editorSection.hidden = false;
    resultSection.hidden = true;
    if (friendShareSection) friendShareSection.hidden = true;

    editorSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
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
      if (friendShareSection) friendShareSection.hidden = false;

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

  function showShareSiteFeedback(message) {
    if (!shareSiteFeedback) return;

    shareSiteFeedback.textContent = message;
    shareSiteFeedback.hidden = false;

    window.clearTimeout(shareSiteFeedback._timeout);
    shareSiteFeedback._timeout = window.setTimeout(() => {
      shareSiteFeedback.hidden = true;
    }, 3500);
  }

  async function copySiteLink() {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(SITE_SHARE_URL);
      return;
    }

    const input = document.createElement("textarea");
    input.value = SITE_SHARE_URL;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();

    if (!copied) throw new Error("Copie impossible");
  }

  async function shareSite() {
    const shareData = {
      title: SITE_SHARE_TITLE,
      text: SITE_SHARE_TEXT,
      url: SITE_SHARE_URL
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await copySiteLink();
      showShareSiteFeedback("Lien copié dans le presse-papiers.");
    } catch (error) {
      if (error?.name === "AbortError") return;

      try {
        await copySiteLink();
        showShareSiteFeedback("Lien copié dans le presse-papiers.");
      } catch {
        showShareSiteFeedback("Impossible d’ouvrir le partage sur cet appareil.");
      }
    }
  }

  if (shareSiteButton) {
    shareSiteButton.addEventListener("click", shareSite);
  }

})();

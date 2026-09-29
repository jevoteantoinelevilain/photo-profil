(() => {
  const cfg = window.APP_CONFIG;

  async function canShareBlob(blob) {
    if (!blob || !navigator.share || !navigator.canShare) return false;

    const file = new File([blob], cfg.OUTPUT_FILENAME, { type: "image/jpeg" });
    return navigator.canShare({ files: [file] });
  }

  async function shareBlob(blob) {
    const file = new File([blob], cfg.OUTPUT_FILENAME, { type: "image/jpeg" });

    if (!navigator.share || !navigator.canShare?.({ files: [file] })) {
      throw new Error("Le partage de fichiers n’est pas disponible sur ce navigateur.");
    }

    await navigator.share({
      files: [file]
    });
  }

  window.ShareTools = {
    canShareBlob,
    shareBlob
  };
})();

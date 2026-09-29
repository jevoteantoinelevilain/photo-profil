(() => {
  const cfg = window.APP_CONFIG;
  const canvas = document.getElementById("editorCanvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const zoomRange = document.getElementById("zoomRange");

  canvas.width = cfg.OUTPUT_SIZE;
  canvas.height = cfg.OUTPUT_SIZE;

  const state = {
    source: null,
    overlay: null,
    baseScale: 1,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    pointers: new Map(),
    lastPointer: null,
    pinchDistance: null,
    pinchZoomStart: 1
  };

  function loadImage(src, crossOrigin = null) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (crossOrigin) img.crossOrigin = crossOrigin;
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Impossible de charger l’image."));
      img.src = src;
    });
  }

  async function loadOverlay() {
    if (!state.overlay) state.overlay = await loadImage(cfg.OVERLAY_SRC);
    return state.overlay;
  }

  function computeBaseScale() {
    const img = state.source;
    state.baseScale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
  }

  function clampOffsets() {
    if (!state.source) return;
    const scale = state.baseScale * state.zoom;
    const drawW = state.source.naturalWidth * scale;
    const drawH = state.source.naturalHeight * scale;
    const maxX = Math.max(0, (drawW - canvas.width) / 2);
    const maxY = Math.max(0, (drawH - canvas.height) / 2);
    state.offsetX = Math.min(maxX, Math.max(-maxX, state.offsetX));
    state.offsetY = Math.min(maxY, Math.max(-maxY, state.offsetY));
  }

  function draw() {
    if (!state.source) return;
    const scale = state.baseScale * state.zoom;
    const drawW = state.source.naturalWidth * scale;
    const drawH = state.source.naturalHeight * scale;
    const x = (canvas.width - drawW) / 2 + state.offsetX;
    const y = (canvas.height - drawH) / 2 + state.offsetY;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(state.source, x, y, drawW, drawH);
    if (state.overlay) ctx.drawImage(state.overlay, 0, 0, canvas.width, canvas.height);
  }

  async function setSourceImage(src, options = {}) {
    const img = await loadImage(src, options.crossOrigin || null);
    state.source = img;
    state.zoom = 1;
    state.offsetX = 0;
    state.offsetY = 0;
    zoomRange.value = "1";
    computeBaseScale();
    await loadOverlay();
    clampOffsets();
    draw();
  }

  function reset() {
    if (!state.source) return;
    state.zoom = 1;
    state.offsetX = 0;
    state.offsetY = 0;
    zoomRange.value = "1";
    computeBaseScale();
    clampOffsets();
    draw();
  }

  zoomRange.addEventListener("input", () => {
    state.zoom = Number(zoomRange.value);
    clampOffsets();
    draw();
  });

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function pointerDistance() {
    const pts = Array.from(state.pointers.values());
    if (pts.length < 2) return null;
    return Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
  }

  canvas.addEventListener("pointerdown", (event) => {
    canvas.setPointerCapture(event.pointerId);
    const p = canvasPoint(event);
    state.pointers.set(event.pointerId, p);
    if (state.pointers.size === 1) {
      state.lastPointer = p;
      state.pinchDistance = null;
    } else if (state.pointers.size === 2) {
      state.pinchDistance = pointerDistance();
      state.pinchZoomStart = state.zoom;
      state.lastPointer = null;
    }
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!state.pointers.has(event.pointerId)) return;
    const p = canvasPoint(event);
    state.pointers.set(event.pointerId, p);
    if (state.pointers.size === 1 && state.lastPointer) {
      state.offsetX += p.x - state.lastPointer.x;
      state.offsetY += p.y - state.lastPointer.y;
      state.lastPointer = p;
      clampOffsets();
      draw();
      return;
    }
    if (state.pointers.size === 2 && state.pinchDistance) {
      const d = pointerDistance();
      if (!d) return;
      const nextZoom = Math.min(3, Math.max(1, state.pinchZoomStart * (d / state.pinchDistance)));
      state.zoom = nextZoom;
      zoomRange.value = String(nextZoom);
      clampOffsets();
      draw();
    }
  });

  function endPointer(event) {
    state.pointers.delete(event.pointerId);
    if (state.pointers.size === 1) {
      state.lastPointer = Array.from(state.pointers.values())[0];
      state.pinchDistance = null;
    } else {
      state.lastPointer = null;
      state.pinchDistance = null;
    }
  }

  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", endPointer);
  canvas.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse" && state.pointers.has(event.pointerId)) endPointer(event);
  });

  function exportBlob() {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Échec de la génération JPEG.")), "image/jpeg", 0.92);
    });
  }

  window.PhotoEditor = { setSourceImage, reset, draw, exportBlob };
})();

const MEDIA_BASE = "https://pub-db2a1779ddaf4b0e84459e8e958e34de.r2.dev/";
const LOW_BASE = MEDIA_BASE + "photos/";
const HR_BASE  = MEDIA_BASE + "photos_HR/";
const VIDEO_BASE = MEDIA_BASE + "video/";

const IMAGE_EXT = ["jpg", "jpeg", "png", "gif", "webp"];
const VIDEO_EXT = ["mp4", "webm", "mov", "m4v", "avi"];

let ALL_ITEMS = [];
let CURRENT_ITEMS = [];
let CURRENT_INDEX = 0;

let SLIDESHOW_TIMER = null;
let SLIDESHOW_DELAY = 5000;
let IS_SLIDESHOW_RUNNING = false;

let RENDER_TOKEN = 0;
let RENDERED_COUNT = 0;

const INITIAL_RENDER_COUNT = 40;
const RENDER_BATCH_SIZE = 24;

let GALLERY_OBSERVER = null;

let TOUCH_START_X = 0;
let TOUCH_START_Y = 0;
let TOUCH_START_DISTANCE = 0;
let TOUCH_START_SCALE = 1;
let TOUCH_LAST_X = 0;
let TOUCH_LAST_Y = 0;
let DRAGGING = false;
let SCALE = 1;
let PAN_X = 0;
let PAN_Y = 0;

function normalize(path) {
  return String(path || "")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^photos_HR\//i, "")
    .replace(/^photos\//i, "")
    .replace(/^videos?\//i, "");
}

function mediaKind(path) {
  const ext = String(path || "").split(".").pop().toLowerCase();
  if (IMAGE_EXT.includes(ext)) return "image";
  if (VIDEO_EXT.includes(ext)) return "video";
  return "other";
}

function extractYear(text) {
  const match = String(text || "").match(/\b(19[0-9]{2}|20[0-9]{2})\b/);
  return match ? match[1] : "";
}

function mediaUrlFromRel(rel, kind) {
  if (kind === "video") return VIDEO_BASE + encodeURI(rel);
  return LOW_BASE + encodeURI(rel);
}

function buildItems(data) {
  ALL_ITEMS = data.map(i => {
    const rel = normalize(i.path || i.fileName || "");
    const year = extractYear(rel + " " + JSON.stringify(i));
    const name = rel.split("/").pop();
    const folder = rel.split("/").slice(0, -1).join("/");
    const ext = rel.split(".").pop().toLowerCase();
    const kind = mediaKind(rel);
    const keywords = Array.isArray(i.keywords) ? i.keywords.map(k => String(k || "").trim()).filter(Boolean) : [];

    return {
      rel,
      year,
      name,
      folder,
      ext,
      kind,
      keywords,
      low: mediaUrlFromRel(rel, kind),
      hr: kind === "image" ? HR_BASE + encodeURI(rel) : "",
      search: (
        JSON.stringify(i) + " " +
        rel + " " +
        name + " " +
        folder + " " +
        year + " " +
        ext + " " +
        (kind === "video" ? "video vidéo film" : "photo image")
      ).toLowerCase()
    };
  }).filter(i => i.rel && (i.kind === "image" || i.kind === "video"));

  // Index de recherche sans accents, pour que "Émile", "emile", "Emile" donnent le même résultat.
  if (typeof normalizeSearchText === "function") {
    ALL_ITEMS.forEach(item => {
      item.searchNormalized = normalizeSearchText(item.search);
    });
  }
}

function renderGallery(items) {
  CURRENT_ITEMS = items;
  CURRENT_INDEX = 0;
  RENDERED_COUNT = 0;

  const grid = document.getElementById("grid");
  const count = document.getElementById("count");
  const sentinel = document.getElementById("gallerySentinel");

  RENDER_TOKEN++;
  const token = RENDER_TOKEN;

  grid.innerHTML = "";

  const photos = items.filter(i => i.kind === "image").length;
  const videos = items.filter(i => i.kind === "video").length;
  count.textContent = `${items.length} / ${ALL_ITEMS.length} média(s) — ${photos} photo(s), ${videos} vidéo(s)`;

  if (sentinel) {
    sentinel.style.display = items.length > 0 ? "block" : "none";
    sentinel.textContent = "Chargement des médias suivants…";
  }

  appendGalleryBatch(token, INITIAL_RENDER_COUNT);
  setupGalleryObserver(token);
}

function appendGalleryBatch(token, batchSize) {
  if (token !== RENDER_TOKEN) return;

  const grid = document.getElementById("grid");
  const sentinel = document.getElementById("gallerySentinel");
  if (!grid) return;

  const fragment = document.createDocumentFragment();
  const startIndex = RENDERED_COUNT;
  const endIndex = Math.min(startIndex + batchSize, CURRENT_ITEMS.length);

  for (let index = startIndex; index < endIndex; index++) {
    const item = CURRENT_ITEMS[index];
    const card = document.createElement("div");
    card.className = "card loading-card" + (item.kind === "video" ? " video-card" : "");
    card.title = item.name;

    const loader = document.createElement("div");
    loader.className = "card-loader";
    loader.innerHTML = item.kind === "video" ? "<span>Vidéo…</span>" : "<span>Chargement…</span>";
    card.appendChild(loader);

    if (item.kind === "video") {
      const video = document.createElement("video");
      video.className = "photo video-thumb";
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.src = item.low;
      video.onloadedmetadata = () => {
        card.classList.remove("loading-card");
        card.classList.add("loaded-card");
      };
      video.onerror = () => {
        loader.innerHTML = "<span>Vidéo indisponible</span>";
        card.classList.add("image-error");
      };
      card.appendChild(video);

      const badge = document.createElement("div");
      badge.className = "media-badge";
      badge.textContent = "▶ Vidéo";
      card.appendChild(badge);
    } else {
      const img = document.createElement("img");
      img.className = "photo";
      img.title = item.name;
      img.alt = item.name;
      img.loading = index < 8 ? "eager" : "lazy";
      img.decoding = "async";
      if (index < 8) img.fetchPriority = "high";
      img.onload = () => {
        card.classList.remove("loading-card");
        card.classList.add("loaded-card");
      };
      img.onerror = () => {
        loader.innerHTML = "<span>Image indisponible</span>";
        card.classList.add("image-error");
      };
      card.appendChild(img);
      img.src = item.low;
    }

    card.addEventListener("click", () => openLightbox(index));
    fragment.appendChild(card);
  }

  grid.appendChild(fragment);
  RENDERED_COUNT = endIndex;

  if (sentinel) {
    if (RENDERED_COUNT >= CURRENT_ITEMS.length) {
      sentinel.textContent = "Tous les médias affichés";
      sentinel.style.display = CURRENT_ITEMS.length > 0 ? "block" : "none";
    } else {
      sentinel.textContent = `Chargement progressif… ${RENDERED_COUNT} / ${CURRENT_ITEMS.length}`;
      sentinel.style.display = "block";
    }
  }
}

function setupGalleryObserver(token) {
  const sentinel = document.getElementById("gallerySentinel");
  if (!sentinel) return;

  if (GALLERY_OBSERVER) GALLERY_OBSERVER.disconnect();

  GALLERY_OBSERVER = new IntersectionObserver(entries => {
    const entry = entries[0];
    if (!entry || !entry.isIntersecting) return;
    if (token !== RENDER_TOKEN) return;
    if (RENDERED_COUNT >= CURRENT_ITEMS.length) return;
    appendGalleryBatch(token, RENDER_BATCH_SIZE);
  }, { root: null, rootMargin: "900px 0px", threshold: 0.01 });

  GALLERY_OBSERVER.observe(sentinel);
}

function openLightbox(index) {
  CURRENT_INDEX = index;
  const overlay = document.getElementById("lightbox");
  overlay.classList.add("open", "loading");
  overlay.classList.remove("controls-hidden");
  document.body.classList.add("no-scroll");
  bindTouchGestures();
  showMedia();
  updateSlideshowButton();
  updateFullscreenButton();
}

function resetZoom() {
  SCALE = 1;
  PAN_X = 0;
  PAN_Y = 0;
  applyZoom();
}

function applyZoom() {
  const img = document.getElementById("lightboxImage");
  const video = document.getElementById("lightboxVideo");
  const transform = `translate3d(${PAN_X}px, ${PAN_Y}px, 0) scale(${SCALE})`;
  if (img) img.style.transform = transform;
  if (video) video.style.transform = transform;
}

function zoomAtPoint(clientX, clientY, newScale) {
  const stage = document.getElementById("lightboxStage") || document.querySelector(".lightbox-stage");
  if (!stage) {
    SCALE = newScale;
    applyZoom();
    return;
  }

  const oldScale = SCALE || 1;
  const rect = stage.getBoundingClientRect();

  // Coordonnées de la souris par rapport au centre de la zone d'affichage.
  const x = clientX - rect.left - rect.width / 2;
  const y = clientY - rect.top - rect.height / 2;

  // Préserve sous la souris le même point de l'image pendant le changement d'échelle.
  PAN_X = x - (x - PAN_X) * (newScale / oldScale);
  PAN_Y = y - (y - PAN_Y) * (newScale / oldScale);
  SCALE = newScale;

  if (SCALE <= 1) {
    SCALE = 1;
    PAN_X = 0;
    PAN_Y = 0;
  }

  applyZoom();
}

function showMedia() {
  const item = CURRENT_ITEMS[CURRENT_INDEX];
  if (!item) return;

  const overlay = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImage");
  const video = document.getElementById("lightboxVideo");
  const title = document.getElementById("lightboxTitle");
  const meta = document.getElementById("lightboxMeta");

  resetZoom();
  overlay.classList.add("loading");
  overlay.classList.toggle("is-video", item.kind === "video");
  img.classList.remove("visible");
  video.classList.remove("visible");
  video.pause();
  video.removeAttribute("src");
  video.load();

  title.textContent = item.name;
  meta.textContent = [
    `${CURRENT_INDEX + 1} / ${CURRENT_ITEMS.length}`,
    item.kind === "video" ? "Vidéo" : "Photo",
    item.year || "",
    item.folder || ""
  ].filter(Boolean).join(" — ");

  if (item.kind === "video") {
    img.removeAttribute("src");
    img.alt = "";
    video.src = item.low;
    video.onloadedmetadata = () => {
      video.classList.add("visible");
      overlay.classList.remove("loading");
    };
    video.onerror = () => overlay.classList.remove("loading");
    video.load();
  } else {
    img.onload = () => img.classList.add("visible");
    img.src = item.low;
    img.alt = item.name;

    const hrTest = new Image();
    hrTest.onload = () => {
      if (CURRENT_ITEMS[CURRENT_INDEX] === item) {
        fadeToImage(item.hr);
        overlay.classList.remove("loading");
      }
    };
    hrTest.onerror = () => overlay.classList.remove("loading");
    hrTest.src = item.hr;
  }

  preloadNextLowMedia();
}

function fadeToImage(url) {
  const img = document.getElementById("lightboxImage");
  img.classList.remove("visible");
  setTimeout(() => {
    img.onload = () => img.classList.add("visible");
    img.src = url;
  }, 160);
}

function closeLightbox() {
  stopSlideshow();
  const overlay = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImage");
  const video = document.getElementById("lightboxVideo");

  overlay.classList.remove("open", "loading", "fullscreen-mode", "controls-hidden", "is-video");
  img.classList.remove("visible");
  video.classList.remove("visible");
  img.src = "";
  video.pause();
  video.removeAttribute("src");
  video.load();
  document.body.classList.remove("no-scroll");

  if (document.fullscreenElement) document.exitFullscreen();
  updateFullscreenButton();
}

function showPrev() {
  if (!CURRENT_ITEMS.length) return;
  CURRENT_INDEX = (CURRENT_INDEX - 1 + CURRENT_ITEMS.length) % CURRENT_ITEMS.length;
  showMedia();
  restartSlideshowIfNeeded();
}

function showNext() {
  if (!CURRENT_ITEMS.length) return;
  CURRENT_INDEX = (CURRENT_INDEX + 1) % CURRENT_ITEMS.length;
  showMedia();
  restartSlideshowIfNeeded();
}

function preloadNextLowMedia() {
  if (!CURRENT_ITEMS.length) return;
  const nextItem = CURRENT_ITEMS[(CURRENT_INDEX + 1) % CURRENT_ITEMS.length];
  if (!nextItem || nextItem.kind !== "image") return;
  const img = new Image();
  img.src = nextItem.low;
}

function toggleControls() {
  const overlay = document.getElementById("lightbox");
  if (!overlay || !overlay.classList.contains("open")) return;
  overlay.classList.toggle("controls-hidden");
}

function bindTouchGestures() {
  const stage = document.getElementById("lightboxStage") || document.querySelector(".lightbox-stage");
  if (!stage || stage.dataset.touchBound === "1") return;
  stage.dataset.touchBound = "1";

  stage.addEventListener("click", e => {
    if (e.target.closest("button") || e.target.closest("select") || e.target.closest("video")) return;
    toggleControls();
  });

  stage.addEventListener("touchstart", e => {
    if (!document.getElementById("lightbox")?.classList.contains("open")) return;

    if (e.touches.length === 1) {
      TOUCH_START_X = TOUCH_LAST_X = e.touches[0].clientX;
      TOUCH_START_Y = TOUCH_LAST_Y = e.touches[0].clientY;
      DRAGGING = SCALE > 1;
    }

    if (e.touches.length === 2) {
      TOUCH_START_DISTANCE = distance(e.touches[0], e.touches[1]);
      TOUCH_START_SCALE = SCALE;
      DRAGGING = false;
    }
  }, { passive: true });

  stage.addEventListener("touchmove", e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const d = distance(e.touches[0], e.touches[1]);
      SCALE = clamp(TOUCH_START_SCALE * (d / TOUCH_START_DISTANCE), 1, 4);
      applyZoom();
      return;
    }

    if (e.touches.length === 1 && SCALE > 1) {
      e.preventDefault();
      const t = e.touches[0];
      PAN_X += t.clientX - TOUCH_LAST_X;
      PAN_Y += t.clientY - TOUCH_LAST_Y;
      TOUCH_LAST_X = t.clientX;
      TOUCH_LAST_Y = t.clientY;
      DRAGGING = true;
      applyZoom();
    }
  }, { passive: false });

  stage.addEventListener("touchend", e => {
    if (e.touches.length > 0) return;
    const dx = TOUCH_LAST_X - TOUCH_START_X;
    const dy = TOUCH_LAST_Y - TOUCH_START_Y;

    if (SCALE <= 1 && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      dx < 0 ? showNext() : showPrev();
      return;
    }

    if (!DRAGGING && Math.abs(dx) < 8 && Math.abs(dy) < 8) {
      toggleControls();
    }
  }, { passive: true });

  let lastWheelNav = 0;

  stage.addEventListener("wheel", e => {
    if (!document.getElementById("lightbox")?.classList.contains("open")) return;
    e.preventDefault();

    if (e.ctrlKey) {
      const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
      const newScale = clamp(SCALE * factor, 1, 4);
      zoomAtPoint(e.clientX, e.clientY, newScale);
      return;
    }

    const now = Date.now();
    if (now - lastWheelNav < 350) return;
    lastWheelNav = now;

    if (e.deltaY > 0) showNext();
    else if (e.deltaY < 0) showPrev();
  }, { passive: false });
}

function distance(a, b) {
  const dx = a.clientX - b.clientX;
  const dy = a.clientY - b.clientY;
  return Math.sqrt(dx * dx + dy * dy) || 1;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function toggleSlideshow() {
  IS_SLIDESHOW_RUNNING ? stopSlideshow() : startSlideshow();
}

function startSlideshow() {
  if (!CURRENT_ITEMS.length) return;
  IS_SLIDESHOW_RUNNING = true;
  updateSlideshowButton();
  clearTimeout(SLIDESHOW_TIMER);
  SLIDESHOW_TIMER = setTimeout(showNext, SLIDESHOW_DELAY);
}

function stopSlideshow() {
  IS_SLIDESHOW_RUNNING = false;
  clearTimeout(SLIDESHOW_TIMER);
  SLIDESHOW_TIMER = null;
  updateSlideshowButton();
}

function restartSlideshowIfNeeded() {
  if (!IS_SLIDESHOW_RUNNING) return;
  clearTimeout(SLIDESHOW_TIMER);
  SLIDESHOW_TIMER = setTimeout(showNext, SLIDESHOW_DELAY);
}

function changeSlideshowDelay() {
  const select = document.getElementById("slideshowDelaySelect");
  SLIDESHOW_DELAY = parseInt(select.value, 10) || 5000;
  restartSlideshowIfNeeded();
}

function updateSlideshowButton() {
  const button = document.getElementById("slideshowButton");
  if (!button) return;
  button.textContent = IS_SLIDESHOW_RUNNING ? "⏸ Pause" : "▶ Diaporama";
  button.classList.toggle("active", IS_SLIDESHOW_RUNNING);
}

function toggleFullscreen() {
  const overlay = document.getElementById("lightbox");
  if (!overlay) return;

  if (!document.fullscreenEnabled || !overlay.requestFullscreen) {
    overlay.classList.toggle("fullscreen-mode");
    overlay.classList.add("controls-hidden");
    updateFullscreenButton();
    return;
  }

  if (!document.fullscreenElement) {
    overlay.requestFullscreen()
      .then(() => {
        overlay.classList.add("fullscreen-mode", "controls-hidden");
        updateFullscreenButton();
      })
      .catch(() => {
        overlay.classList.toggle("fullscreen-mode");
        overlay.classList.add("controls-hidden");
        updateFullscreenButton();
      });
  } else {
    document.exitFullscreen()
      .then(() => {
        overlay.classList.remove("fullscreen-mode");
        updateFullscreenButton();
      })
      .catch(() => {
        overlay.classList.remove("fullscreen-mode");
        updateFullscreenButton();
      });
  }
}

function updateFullscreenButton() {
  const button = document.getElementById("fullscreenButton");
  const overlay = document.getElementById("lightbox");
  if (!button || !overlay) return;
  const isFullscreen = !!document.fullscreenElement || overlay.classList.contains("fullscreen-mode");
  button.textContent = isFullscreen ? "⛶ Quitter plein écran" : "⛶ Plein écran";
}

document.addEventListener("fullscreenchange", () => {
  const overlay = document.getElementById("lightbox");
  if (!overlay) return;
  if (document.fullscreenElement) overlay.classList.add("fullscreen-mode", "controls-hidden");
  else overlay.classList.remove("fullscreen-mode");
  updateFullscreenButton();
});

document.addEventListener("keydown", e => {
  const overlay = document.getElementById("lightbox");
  if (!overlay || !overlay.classList.contains("open")) return;

  if (e.key === "Escape") {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (overlay.classList.contains("fullscreen-mode")) {
      overlay.classList.remove("fullscreen-mode");
      updateFullscreenButton();
    } else closeLightbox();
  }

  if (e.key === "ArrowLeft") showPrev();
  if (e.key === "ArrowRight") showNext();
  if (e.key === " ") {
    e.preventDefault();
    toggleSlideshow();
  }
  if (e.key.toLowerCase() === "f") toggleFullscreen();
  if (e.key.toLowerCase() === "i") toggleControls();
});

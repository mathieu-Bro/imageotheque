const BASE = "http://mathpro.free.fr/";
const LOW_BASE = BASE + "photos/";
const HR_BASE  = BASE + "photos_HR/";

const EXT = ["jpg", "jpeg", "png", "gif", "webp"];

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

function normalize(path) {
  return String(path || "")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^photos_HR\//i, "")
    .replace(/^photos\//i, "");
}

function isImage(path) {
  return EXT.includes(path.split(".").pop().toLowerCase());
}

function extractYear(text) {
  const match = String(text || "").match(/\b(19[0-9]{2}|20[0-9]{2})\b/);
  return match ? match[1] : "";
}

function buildItems(data) {
  ALL_ITEMS = data.map(i => {
    const rel = normalize(i.path || i.fileName || "");
    const year = extractYear(rel + " " + JSON.stringify(i));
    const name = rel.split("/").pop();
    const folder = rel.split("/").slice(0, -1).join("/");
    const ext = rel.split(".").pop().toLowerCase();

    return {
      rel,
      year,
      name,
      folder,
      ext,
      low: LOW_BASE + encodeURI(rel),
      hr: HR_BASE + encodeURI(rel),
      search: (
        JSON.stringify(i) + " " +
        rel + " " +
        name + " " +
        folder + " " +
        year + " " +
        ext
      ).toLowerCase()
    };
  }).filter(i => i.rel && isImage(i.rel));
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

  count.textContent = items.length + " / " + ALL_ITEMS.length + " photo(s)";

  if (sentinel) {
    sentinel.style.display = items.length > 0 ? "block" : "none";
    sentinel.textContent = "Chargement des photos suivantes…";
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
    card.className = "card loading-card";
    card.title = item.name;

    const loader = document.createElement("div");
    loader.className = "card-loader";
    loader.innerHTML = "<span>Chargement…</span>";

    const img = document.createElement("img");
    img.className = "photo";
    img.title = item.name;
    img.alt = item.name;
    img.loading = index < 8 ? "eager" : "lazy";
    img.decoding = "async";

    if (index < 8) {
      img.fetchPriority = "high";
    }

    img.onload = () => {
      card.classList.remove("loading-card");
      card.classList.add("loaded-card");
    };

    img.onerror = () => {
      loader.innerHTML = "<span>Image indisponible</span>";
      card.classList.add("image-error");
    };

    card.appendChild(loader);
    card.appendChild(img);

    card.addEventListener("click", () => {
      openLightbox(index);
    });

    fragment.appendChild(card);

    img.src = item.low;
  }

  grid.appendChild(fragment);
  RENDERED_COUNT = endIndex;

  if (sentinel) {
    if (RENDERED_COUNT >= CURRENT_ITEMS.length) {
      sentinel.textContent = "Toutes les photos affichées";
      sentinel.style.display = CURRENT_ITEMS.length > 0 ? "block" : "none";
    } else {
      sentinel.textContent =
        "Chargement progressif… " + RENDERED_COUNT + " / " + CURRENT_ITEMS.length;
      sentinel.style.display = "block";
    }
  }
}

function setupGalleryObserver(token) {
  const sentinel = document.getElementById("gallerySentinel");

  if (!sentinel) return;

  if (GALLERY_OBSERVER) {
    GALLERY_OBSERVER.disconnect();
    GALLERY_OBSERVER = null;
  }

  GALLERY_OBSERVER = new IntersectionObserver(entries => {
    const entry = entries[0];

    if (!entry || !entry.isIntersecting) return;
    if (token !== RENDER_TOKEN) return;
    if (RENDERED_COUNT >= CURRENT_ITEMS.length) return;

    appendGalleryBatch(token, RENDER_BATCH_SIZE);
  }, {
    root: null,
    rootMargin: "900px 0px",
    threshold: 0.01
  });

  GALLERY_OBSERVER.observe(sentinel);
}

function openLightbox(index) {
  CURRENT_INDEX = index;

  const overlay = document.getElementById("lightbox");
  overlay.classList.add("open", "loading");

  document.body.classList.add("no-scroll");

  showImage();
  updateSlideshowButton();
  updateFullscreenButton();
}

function showImage() {
  const item = CURRENT_ITEMS[CURRENT_INDEX];

  if (!item) return;

  const overlay = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImage");
  const title = document.getElementById("lightboxTitle");
  const meta = document.getElementById("lightboxMeta");

  overlay.classList.add("loading");
  img.classList.remove("visible");

  img.onload = () => {
    img.classList.add("visible");
  };

  img.src = item.low;
  img.alt = item.name;

  title.textContent = item.name;
  meta.textContent = [
    CURRENT_INDEX + 1 + " / " + CURRENT_ITEMS.length,
    item.year ? item.year : "",
    item.folder ? item.folder : ""
  ].filter(Boolean).join(" — ");

  const hrTest = new Image();

  hrTest.onload = () => {
    if (CURRENT_ITEMS[CURRENT_INDEX] === item) {
      fadeToImage(item.hr);
      overlay.classList.remove("loading");
    }
  };

  hrTest.onerror = () => {
    overlay.classList.remove("loading");
  };

  hrTest.src = item.hr;

  preloadNextLowImage();
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

  overlay.classList.remove("open", "loading", "fullscreen-mode");
  img.classList.remove("visible");
  img.src = "";

  document.body.classList.remove("no-scroll");

  if (document.fullscreenElement) {
    document.exitFullscreen();
  }

  updateFullscreenButton();
}

function showPrev() {
  if (!CURRENT_ITEMS.length) return;

  CURRENT_INDEX = (CURRENT_INDEX - 1 + CURRENT_ITEMS.length) % CURRENT_ITEMS.length;
  showImage();
  restartSlideshowIfNeeded();
}

function showNext() {
  if (!CURRENT_ITEMS.length) return;

  CURRENT_INDEX = (CURRENT_INDEX + 1) % CURRENT_ITEMS.length;
  showImage();
  restartSlideshowIfNeeded();
}

function preloadNextLowImage() {
  if (!CURRENT_ITEMS.length) return;

  const nextIndex = (CURRENT_INDEX + 1) % CURRENT_ITEMS.length;
  const nextItem = CURRENT_ITEMS[nextIndex];

  const img = new Image();
  img.src = nextItem.low;
}

function toggleSlideshow() {
  if (IS_SLIDESHOW_RUNNING) {
    stopSlideshow();
  } else {
    startSlideshow();
  }
}

function startSlideshow() {
  if (!CURRENT_ITEMS.length) return;

  IS_SLIDESHOW_RUNNING = true;
  updateSlideshowButton();

  clearTimeout(SLIDESHOW_TIMER);

  SLIDESHOW_TIMER = setTimeout(() => {
    showNext();
  }, SLIDESHOW_DELAY);
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

  SLIDESHOW_TIMER = setTimeout(() => {
    showNext();
  }, SLIDESHOW_DELAY);
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
    updateFullscreenButton();
    return;
  }

  if (!document.fullscreenElement) {
    overlay.requestFullscreen()
      .then(() => {
        overlay.classList.add("fullscreen-mode");
        updateFullscreenButton();
      })
      .catch(() => {
        overlay.classList.toggle("fullscreen-mode");
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

  const isFullscreen =
    !!document.fullscreenElement ||
    overlay.classList.contains("fullscreen-mode");

  button.textContent = isFullscreen ? "⛶ Quitter plein écran" : "⛶ Plein écran";
}

document.addEventListener("fullscreenchange", () => {
  const overlay = document.getElementById("lightbox");
  if (!overlay) return;

  if (document.fullscreenElement) {
    overlay.classList.add("fullscreen-mode");
  } else {
    overlay.classList.remove("fullscreen-mode");
  }

  updateFullscreenButton();
});

document.addEventListener("keydown", e => {
  const overlay = document.getElementById("lightbox");
  if (!overlay || !overlay.classList.contains("open")) return;

  if (e.key === "Escape") {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (overlay.classList.contains("fullscreen-mode")) {
      overlay.classList.remove("fullscreen-mode");
      updateFullscreenButton();
    } else {
      closeLightbox();
    }
  }

  if (e.key === "ArrowLeft") showPrev();
  if (e.key === "ArrowRight") showNext();

  if (e.key === " ") {
    e.preventDefault();
    toggleSlideshow();
  }

  if (e.key.toLowerCase() === "f") {
    toggleFullscreen();
  }
});
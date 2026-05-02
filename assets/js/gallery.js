let galleryItems = [];

async function loadGalleryData() {
  try {
    const response = await fetch("data/index_site.json");

    if (!response.ok) {
      throw new Error("Impossible de charger data/index_site.json");
    }

    galleryItems = await response.json();

    if (!Array.isArray(galleryItems)) {
      console.warn("Le fichier index_site.json ne contient pas un tableau.");
      galleryItems = [];
    }
  } catch (error) {
    console.error("Erreur de chargement des données :", error);
    galleryItems = [];
  }
}

function renderGallery(items) {
  const gallery = document.getElementById("gallery");
  const resultCount = document.getElementById("result-count");

  if (!gallery) return;

  gallery.innerHTML = "";

  if (resultCount) {
    resultCount.textContent = items.length + " élément(s)";
  }

  if (!items || items.length === 0) {
    gallery.innerHTML = '<p class="empty-message">Aucun élément à afficher.</p>';
    return;
  }

  items.forEach(function (item) {
    const card = createGalleryCard(item);
    gallery.appendChild(card);
  });
}

function createGalleryCard(item) {
  const article = document.createElement("article");
  article.className = "gallery-card";

  const mediaLink = document.createElement("a");
  mediaLink.className = "media-link";
  mediaLink.href = getHighResolutionPath(item);
  mediaLink.target = "_blank";
  mediaLink.rel = "noopener noreferrer";

  if (item.type === "video") {
    const video = document.createElement("video");
    video.src = item.path;
    video.controls = false;
    video.muted = true;
    video.preload = "metadata";
    video.className = "gallery-media";

    mediaLink.appendChild(video);
  } else if (item.type === "image") {
    const img = document.createElement("img");
    img.src = item.path;
    img.alt = item.displayName || item.fileName || "Photo";
    img.loading = "lazy";
    img.className = "gallery-media";

    mediaLink.appendChild(img);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "file-placeholder";
    placeholder.textContent = item.extension || "fichier";

    mediaLink.appendChild(placeholder);
  }

  const body = document.createElement("div");
  body.className = "gallery-card-body";

  const title = document.createElement("h3");
  title.textContent = item.displayName || item.fileName || "Sans titre";

  const meta = document.createElement("p");
  meta.textContent = item.folder || "";

  body.appendChild(title);
  body.appendChild(meta);

  article.appendChild(mediaLink);
  article.appendChild(body);

  return article;
}

function getHighResolutionPath(item) {
  if (!item || !item.path) return "#";

  if (item.type === "image") {
    return item.path.replace("photos/", "photos_HR/");
  }

  if (item.type === "video") {
    return item.path.replace("videos/", "videos_HR/");
  }

  return item.path;
}
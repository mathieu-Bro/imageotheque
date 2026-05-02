// ⚠️ HTTP obligatoire pour Free
const FREE_BASE_URL = "http://mathpro.free.fr/";

let galleryItems = [];

async function loadGalleryData() {
  try {
    const response = await fetch("data/index_site.json");

    if (!response.ok) {
      throw new Error("Impossible de charger index_site.json");
    }

    galleryItems = await response.json();

    if (!Array.isArray(galleryItems)) {
      galleryItems = [];
    }

  } catch (error) {
    console.error("Erreur JSON :", error);
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
    gallery.innerHTML = '<p class="empty-message">Aucun élément.</p>';
    return;
  }

  items.forEach(function (item) {
    gallery.appendChild(createCard(item));
  });
}

function createCard(item) {
  const article = document.createElement("article");
  article.className = "gallery-card";

  const link = document.createElement("a");
  link.className = "media-link";
  link.href = getHR(item);
  link.target = "_blank";

  if (item.type === "video") {
    const video = document.createElement("video");
    video.src = getMedia(item);
    video.muted = true;
    video.preload = "metadata";
    video.className = "gallery-media";
    link.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = getMedia(item);
    img.loading = "lazy";
    img.className = "gallery-media";
    link.appendChild(img);
  }

  const body = document.createElement("div");
  body.className = "gallery-card-body";

  const title = document.createElement("h3");
  title.textContent = item.displayName || item.fileName;

  body.appendChild(title);

  article.appendChild(link);
  article.appendChild(body);

  return article;
}

function getMedia(item) {
  return FREE_BASE_URL + item.path;
}

function getHR(item) {
  if (item.type === "image") {
    return FREE_BASE_URL + item.path.replace("photos/", "photos_HR/");
  }

  if (item.type === "video") {
    return FREE_BASE_URL + item.path.replace("videos/", "videos_HR/");
  }

  return getMedia(item);
}
async function loadComponent(targetId, filePath) {
  const target = document.getElementById(targetId);

  if (!target) {
    console.warn("Zone introuvable :", targetId);
    return;
  }

  try {
    const response = await fetch(filePath);

    if (!response.ok) {
      console.warn("Composant introuvable :", filePath);
      return;
    }

    const html = await response.text();
    target.innerHTML = html;
  } catch (error) {
    console.error("Erreur de chargement du composant :", filePath, error);
  }
}

async function loadLayout() {
  await loadComponent("site-header", "assets/components/header.html");
  await loadComponent("filters-container", "assets/components/filters.html");
  await loadComponent("site-footer", "assets/components/footer.html");
}
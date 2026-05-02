async function loadComponent(targetId, filePath) {
  const target = document.getElementById(targetId);
  if (!target) return;

  try {
    const response = await fetch(filePath);
    if (!response.ok) return;

    target.innerHTML = await response.text();
  } catch (e) {
    console.error(e);
  }
}

async function loadLayout() {
  await loadComponent("site-header", "assets/components/header.html");
  await loadComponent("filters-container", "assets/components/filters.html");
  await loadComponent("site-footer", "assets/components/footer.html");
}
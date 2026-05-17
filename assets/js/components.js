async function loadComponent(id, path) {
  const html = await fetch(path).then(r => r.text());
  document.getElementById(id).innerHTML = html;
}

async function loadAllComponents() {
  await loadComponent("header", "assets/components/header.html");
  await loadComponent("filters", "assets/components/filters.html");
  await loadComponent("footer", "assets/components/footer.html");
}
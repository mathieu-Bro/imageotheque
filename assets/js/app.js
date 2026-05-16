const INDEX_FILE = "http://mathpro.free.fr/data/index_site.json";

async function init(){

  await loadAllComponents();

  const res = await fetch(INDEX_FILE + "?v=" + Date.now());
  const data = await res.json();

  buildItems(data);
  initFilters();
  update();
}

window.addEventListener("DOMContentLoaded", init);
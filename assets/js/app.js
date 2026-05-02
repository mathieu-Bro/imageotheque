document.addEventListener("DOMContentLoaded", async function () {
  await loadLayout();
  await loadGalleryData();

  initFilters();
  populateFolderFilter();
  applyFiltersAndRender();
});
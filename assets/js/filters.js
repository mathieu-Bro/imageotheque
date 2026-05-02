let currentFilters = {
  search: "",
  type: "",
  folder: ""
};

function initFilters() {
  const searchInput = document.getElementById("search-input");
  const typeFilter = document.getElementById("type-filter");
  const folderFilter = document.getElementById("folder-filter");
  const resetButton = document.getElementById("reset-filters");

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      currentFilters.search = searchInput.value.toLowerCase();
      applyFiltersAndRender();
    });
  }

  if (typeFilter) {
    typeFilter.addEventListener("change", function () {
      currentFilters.type = typeFilter.value;
      applyFiltersAndRender();
    });
  }

  if (folderFilter) {
    folderFilter.addEventListener("change", function () {
      currentFilters.folder = folderFilter.value;
      applyFiltersAndRender();
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      currentFilters.search = "";
      currentFilters.type = "";
      currentFilters.folder = "";

      if (searchInput) searchInput.value = "";
      if (typeFilter) typeFilter.value = "";
      if (folderFilter) folderFilter.value = "";

      applyFiltersAndRender();
    });
  }
}

function populateFolderFilter() {
  const folderFilter = document.getElementById("folder-filter");
  if (!folderFilter || !Array.isArray(galleryItems)) return;

  const folders = [];

  galleryItems.forEach(function (item) {
    if (item.folder && folders.indexOf(item.folder) === -1) {
      folders.push(item.folder);
    }
  });

  folders.sort();

  folders.forEach(function (folder) {
    const option = document.createElement("option");
    option.value = folder;
    option.textContent = folder;
    folderFilter.appendChild(option);
  });
}

function getFilteredItems() {
  return galleryItems.filter(function (item) {
    const searchText = [
      item.path,
      item.fileName,
      item.folder,
      item.displayName,
      item.extension,
      item.type,
      Array.isArray(item.keywords) ? item.keywords.join(" ") : ""
    ].join(" ").toLowerCase();

    const matchesSearch =
      currentFilters.search === "" ||
      searchText.indexOf(currentFilters.search) !== -1;

    const matchesType =
      currentFilters.type === "" ||
      item.type === currentFilters.type;

    const matchesFolder =
      currentFilters.folder === "" ||
      item.folder === currentFilters.folder;

    return matchesSearch && matchesType && matchesFolder;
  });
}

function applyFiltersAndRender() {
  const filteredItems = getFilteredItems();
  renderGallery(filteredItems);
}
let LAST_SEARCH = "";
let LAST_BASE_ITEMS = [];

function getElements() {
  return {
    searchInput: document.getElementById("searchInput"),
    yearModeSelect: document.getElementById("yearModeSelect"),
    yearFromSelect: document.getElementById("yearFromSelect"),
    yearToSelect: document.getElementById("yearToSelect"),
    folderSelect: document.getElementById("folderSelect"),
    extensionSelect: document.getElementById("extensionSelect"),
    sortSelect: document.getElementById("sortSelect"),
    resetButton: document.getElementById("resetButton")
  };
}

function initFilters() {
  rebuildDynamicFilters(true);
  bindEvents();
  updateYearControlsVisibility();
}

function bindEvents() {
  const el = getElements();

  el.searchInput.oninput = () => {
    rebuildDynamicFilters();
    update();
  };

  el.yearModeSelect.onchange = () => {
    updateYearControlsVisibility();
    update(); // ⚠️ pas de rebuild ici → gain de perf
  };

  el.yearFromSelect.onchange = update;
  el.yearToSelect.onchange = update;
  el.folderSelect.onchange = update;
  el.extensionSelect.onchange = update;
  el.sortSelect.onchange = update;

  el.resetButton.onclick = () => {
    el.searchInput.value = "";
    el.yearModeSelect.value = "";
    el.yearFromSelect.value = "";
    el.yearToSelect.value = "";
    el.folderSelect.value = "";
    el.extensionSelect.value = "";
    el.sortSelect.value = "folder";

    updateYearControlsVisibility();
    rebuildDynamicFilters(true);
    update();
  };
}

/* ================= YEAR UI ================= */

function updateYearControlsVisibility() {
  const { yearModeSelect, yearFromSelect, yearToSelect } = getElements();

  const mode = yearModeSelect.value;

  yearFromSelect.style.display = mode ? "" : "none";
  yearToSelect.style.display = mode === "between" ? "" : "none";

  if (mode !== "between") {
    yearToSelect.value = "";
  }
}

/* ================= BASE ITEMS ================= */

function getSearchFilteredBaseItems(force = false) {
  const { searchInput } = getElements();
  const q = searchInput.value.trim().toLowerCase();

  // ⚡ cache → énorme gain de perf
  if (!force && q === LAST_SEARCH) {
    return LAST_BASE_ITEMS;
  }

  LAST_SEARCH = q;

  LAST_BASE_ITEMS = ALL_ITEMS.filter(item => {
    return !q || item.search.includes(q);
  });

  return LAST_BASE_ITEMS;
}

/* ================= REBUILD FILTERS ================= */

function rebuildDynamicFilters(force = false) {
  const {
    yearFromSelect,
    yearToSelect,
    folderSelect,
    extensionSelect
  } = getElements();

  const baseItems = getSearchFilteredBaseItems(force);

  // ⚡ sets optimisés
  const years = new Set();
  const folders = new Set();
  const exts = new Set();

  for (const i of baseItems) {
    if (i.year) years.add(i.year);
    if (i.folder) folders.add(i.folder);
    if (i.ext) exts.add(i.ext);
  }

  rebuildSelect(yearFromSelect, "Année", [...years].sort().reverse());
  rebuildSelect(yearToSelect, "Et...", [...years].sort().reverse());
  rebuildSelect(folderSelect, "Tous les dossiers", [...folders].sort());
  rebuildSelect(extensionSelect, "Tous les types", [...exts].sort(), null, v => v.toUpperCase());
}

/* ================= SELECT ================= */

function rebuildSelect(select, defaultLabel, values, previousValue, labelFormatter) {
  const current = select.value;

  select.innerHTML = "";

  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = defaultLabel;
  select.appendChild(empty);

  values.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = labelFormatter ? labelFormatter(v) : v;
    select.appendChild(opt);
  });

  // ⚡ garder la valeur si possible
  if (values.includes(current)) {
    select.value = current;
  }
}

/* ================= YEAR FILTER ================= */

function yearMatches(item) {
  const { yearModeSelect, yearFromSelect, yearToSelect } = getElements();

  const mode = yearModeSelect.value;
  const from = yearFromSelect.value;
  const to = yearToSelect.value;

  // 👉 AUCUNE sélection → TOUT PASSE
  if (!mode) return true;
  if (!from) return true;
  if (mode === "between" && !to) return true;

  if (!item.year) return false;

  const y = parseInt(item.year, 10);
  const y1 = parseInt(from, 10);
  const y2 = parseInt(to, 10);

  switch (mode) {
    case "exact": return y === y1;
    case "before": return y < y1;
    case "after": return y > y1;
    case "between":
      return y >= Math.min(y1, y2) && y <= Math.max(y1, y2);
  }

  return true;
}

/* ================= FILTER ================= */

function getFilteredItems() {
  const el = getElements();
  const q = el.searchInput.value.trim().toLowerCase();

  let items = ALL_ITEMS.filter(item =>
    (!q || item.search.includes(q)) &&
    yearMatches(item) &&
    (!el.folderSelect.value || item.folder === el.folderSelect.value) &&
    (!el.extensionSelect.value || item.ext === el.extensionSelect.value)
  );

  switch (el.sortSelect.value) {
    case "name":
      items.sort((a,b)=>a.name.localeCompare(b.name,"fr"));
      break;
    case "extension":
      items.sort((a,b)=>a.ext.localeCompare(b.ext,"fr"));
      break;
    case "year":
      items.sort((a,b)=>b.year.localeCompare(a.year,"fr"));
      break;
    default:
      items.sort((a,b)=>a.folder.localeCompare(b.folder,"fr"));
  }

  return items;
}

/* ================= UPDATE ================= */

function update() {
  renderGallery(getFilteredItems());
}
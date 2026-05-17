let LAST_SEARCH = "";
let LAST_BASE_ITEMS = [];

function getElements() {
  return {
    searchInput: document.getElementById("searchInput"),
    keywordInput: document.getElementById("keywordInput"),
    keywordDatalist: document.getElementById("keywordDatalist"),
    mediaTypeSelect: document.getElementById("mediaTypeSelect"),
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
  rebuildKeywordDatalist();
  bindEvents();
  updateYearControlsVisibility();
}

function bindEvents() {
  const el = getElements();

  el.searchInput.oninput = () => {
    rebuildDynamicFilters();
    update();
  };

  el.keywordInput.oninput = update;
  el.keywordInput.onchange = update;

  el.mediaTypeSelect.onchange = update;

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
    el.keywordInput.value = "";
    el.mediaTypeSelect.value = "";
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


/* ================= SEARCH QUERY =================
   Syntaxe volontairement simple :
   - "chat et jardin" => tous les termes doivent être présents
   - "chat ou jardin" => au moins un terme doit être présent
   - "chat jardin"    => équivalent à "chat ou jardin"
   - les accents et la casse sont ignorés
*/

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseSearchQuery(raw) {
  const normalized = normalizeSearchText(raw);
  if (!normalized) {
    return { mode: "all", terms: [] };
  }

  const words = normalized.split(/\s+/).filter(Boolean);
  const hasEt = words.includes("et");
  const hasOu = words.includes("ou");
  const terms = words.filter(w => w !== "et" && w !== "ou");

  if (!terms.length) {
    return { mode: "all", terms: [] };
  }

  // Par défaut : plusieurs mots sans opérateur = OU.
  // En cas de mélange "et" + "ou", on privilégie "et" pour éviter d'élargir par erreur.
  return {
    mode: hasEt && !hasOu ? "and" : (hasEt ? "and" : "or"),
    terms
  };
}

function itemMatchesSearch(item, query) {
  if (!query || !query.terms || !query.terms.length) return true;

  // Compatibilité : anciens index + index normalisé sans accents.
  const haystack = item.searchNormalized || normalizeSearchText(item.search);

  if (query.mode === "and") {
    return query.terms.every(term => haystack.includes(term));
  }

  return query.terms.some(term => haystack.includes(term));
}

/* ================= BASE ITEMS ================= */

function getSearchFilteredBaseItems(force = false) {
  const { searchInput } = getElements();
  const q = searchInput.value.trim();

  // ⚡ cache → énorme gain de perf
  if (!force && q === LAST_SEARCH) {
    return LAST_BASE_ITEMS;
  }

  LAST_SEARCH = q;
  const query = parseSearchQuery(q);

  LAST_BASE_ITEMS = ALL_ITEMS.filter(item => {
    return itemMatchesSearch(item, query);
  });

  return LAST_BASE_ITEMS;
}


/* ================= KEYWORDS ================= */

function splitKeywordWords(value) {
  const stop = new Set([
    "jpg", "jpeg", "png", "gif", "webp", "mp4", "webm", "mov", "m4v", "avi",
    "photo", "photos", "video", "videos", "image", "images", "hr", "br",
    "img", "dsc", "scan", "copie", "copy", "thumb", "thumbnail"
  ]);

  return String(value || "")
    .replace(/\.[a-z0-9]{2,5}$/i, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/[_.+~()[\]{}\-]+/g, " ")
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length >= 2)
    .filter(w => !/^\d+$/.test(w))
    .filter(w => !stop.has(normalizeSearchText(w)))
    .filter(w => normalizeSearchText(w));
}

function getLeadingFilenameWords(name) {
  // Les mots-clés métier sont les mots placés au début du nom.
  // On s'arrête au premier séparateur fort ou à la première année.
  const base = String(name || "").replace(/\.[a-z0-9]{2,5}$/i, "");
  const beforeSeparator = base.split(/\s[-–—_]\s|\s{2,}|[,;|]/)[0] || base;
  const beforeYear = beforeSeparator.split(/\b(?:19\d{2}|20\d{2})\b/)[0] || beforeSeparator;
  return splitKeywordWords(beforeYear);
}

function getItemKeywords(item) {
  const filename = String(item.name || "");
  const base = filename.replace(/\.[a-z0-9]{2,5}$/i, "");
  const pos = base.indexOf("_");

  // Règle : seuls les mots avant le premier _ sont des mots-clés.
  // Exemple : cerf daguet cerises_IMG_20240704_200759.jpg
  // => cerf, daguet, cerises
  if (pos <= 0) return [];

  const prefix = base.substring(0, pos).trim();
  const stop = new Set([
    "jpg", "jpeg", "png", "gif", "webp", "mp4", "webm", "mov", "m4v", "avi",
    "photo", "photos", "video", "videos", "image", "images", "hr", "br",
    "img", "dsc", "scan", "copie", "copy"
  ]);

  const map = new Map();
  const words = prefix
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length >= 2)
    .filter(w => !/^\d+$/.test(w))
    .filter(w => !stop.has(normalizeSearchText(w)));

  for (const word of words) {
    const key = normalizeSearchText(word);
    if (!key) continue;
    if (!map.has(key)) map.set(key, word);
  }

  return [...map.values()];
}

function rebuildKeywordDatalist() {
  const { keywordDatalist } = getElements();
  if (!keywordDatalist) return;

  const map = new Map();

  for (const item of ALL_ITEMS) {
    for (const keyword of getItemKeywords(item)) {
      const label = String(keyword || "").trim();
      if (!label) continue;
      const key = normalizeSearchText(label);
      if (!key) continue;
      if (!map.has(key)) map.set(key, label);
    }
  }

  const values = [...map.values()].sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
  keywordDatalist.innerHTML = "";

  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    keywordDatalist.appendChild(option);
  }
}

function itemMatchesKeyword(item, rawKeyword) {
  const q = normalizeSearchText(rawKeyword);
  if (!q) return true;

  const keywords = getItemKeywords(item).map(k => normalizeSearchText(k)).filter(Boolean);
  if (!keywords.length) return false;

  // Le filtre mot-clé travaille sur des mots simples : exact si choisi,
  // partiel si l'utilisateur tape seulement le début d'un mot.
  return keywords.some(k => k === q || k.startsWith(q));
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
  const q = el.searchInput.value.trim();
  const selectedKeyword = el.keywordInput.value.trim();
  const searchQuery = parseSearchQuery(q);

  let items = ALL_ITEMS.filter(item =>
    itemMatchesSearch(item, searchQuery) &&
    itemMatchesKeyword(item, selectedKeyword) &&
    (!el.mediaTypeSelect.value || item.kind === el.mediaTypeSelect.value) &&
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
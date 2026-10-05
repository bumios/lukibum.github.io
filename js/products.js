// Product catalog: home featured, category grid, catalog filters, detail modal
// Data model: each product has `variations` [{name, sku, price, image, stock}]
let PRODUCTS = null;

async function loadProducts() {
  if (!PRODUCTS) PRODUCTS = await loadJSON("data/products.json");
  return PRODUCTS;
}

function categoryName(id) {
  const c = (PRODUCTS.categories || []).find((x) => x.id === id);
  return c ? c.name : "";
}

// Giá khách thực trả: customerPrice (giá ngoài) nếu có, ngược lại là giá sàn
function sellPrice(v) {
  return v.customerPrice ?? v.price;
}

// Giá thấp nhất khách phải trả trong sản phẩm
function minPrice(p) {
  return p.variations.reduce((m, v) => Math.min(m, sellPrice(v)), Infinity);
}

// Nhãn giá trên card:
// - 1 mức giá (1 phân loại, hoặc nhiều phân loại cùng giá) → ghi thẳng giá
// - nhiều mức giá khác nhau → ghi range "giá thấp nhất - giá cao nhất"
function cardPriceLabel(p) {
  const prices = p.variations.map(sellPrice);
  if (new Set(prices).size === 1) return formatMoney(prices[0]);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return `${formatMoney(min)} - ${formatMoney(max)}`;
}

// Giá sàn thấp nhất (để gạch ngang so sánh)
function shopeeMinPrice(p) {
  return p.variations.reduce((m, v) => Math.min(m, v.price), Infinity);
}

// HTML khối giá: giá bán (cam) + giá sàn gạch ngang (nếu có giảm)
function priceHTML(v) {
  const sell = sellPrice(v);
  const old =
    v.customerPrice != null && v.price > v.customerPrice
      ? `<span class="price-old">${formatMoney(v.price)}</span>`
      : "";
  return `<span class="price-now">${formatMoney(sell)}</span>${old}`;
}

// Chuẩn hoá về alphabet không dấu để tìm kiếm: "nấm" → "nam", "đáy" → "day"
function normalizeText(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function productCard(p, i = 0) {
  return `
  <article class="product-card" style="--d:${(i % 8) * 0.06}s">
    <div class="product-image" data-detail="${p.id}">
      <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">
    </div>
    <div class="product-body">
      <h3 class="product-name" data-detail="${p.id}">${esc(p.name)}</h3>
      <div class="product-cat">${esc(categoryName(p.category))}</div>
      <div class="price-row">
        <span class="price-now">${cardPriceLabel(p)}</span>
        ${shopeeMinPrice(p) > minPrice(p) ? `<span class="price-old">${formatMoney(shopeeMinPrice(p))}</span>` : ""}
      </div>
      <div class="product-actions">
        <button class="btn btn-ghost" data-detail="${p.id}">Chi tiết</button>
        <button class="btn btn-primary" data-add="${p.id}">Thêm vào đơn</button>
      </div>
    </div>
  </article>`;
}

function wireProductGrid(container) {
  $$("[data-add]", container).forEach((b) =>
    b.addEventListener("click", () => {
      const p = PRODUCTS.products.find((x) => x.id === b.dataset.add);
      if (!p) return;
      if (p.variations.length === 1) {
        addToCart(p, p.variations[0]);
      } else {
        openProductModal(p.id);
      }
    })
  );
  $$("[data-detail]", container).forEach((b) =>
    b.addEventListener("click", () => openProductModal(b.dataset.detail))
  );
}

/* ---------- Home ---------- */
async function renderHome() {
  renderCarousel();
  renderDeals();
  const data = await loadProducts();
  PRODUCTS = data;

  const catGrid = $("#category-grid");
  if (catGrid) {
    catGrid.innerHTML = data.categories
      .map(
        (c, i) => `
      <a class="category-card" style="--d:${i * 0.07}s" href="san-pham.html?cat=${c.id}">
        <div class="icon">${icon(c.icon)}</div>
        <h3>${esc(c.name)}</h3>
      </a>`
      )
      .join("");
  }

  const feat = $("#featured-grid");
  if (feat) {
    const featured = data.products.slice(0, 4);
    feat.innerHTML = featured.map((p, i) => productCard(p, i)).join("");
    wireProductGrid(feat);
  }

  const qr = $("#zalo-qr");
  if (qr && APP.settings.zaloQR) qr.src = APP.settings.zaloQR;
}

/* ---------- Catalog ---------- */
let catalogState = { category: "all", search: "" };

async function renderCatalog() {
  const data = await loadProducts();
  PRODUCTS = data;

  const params = new URLSearchParams(location.search);
  if (params.get("cat")) catalogState.category = params.get("cat");

  const filters = $("#filters");
  const grid = $("#product-grid");
  const count = $("#result-count");

  filters.innerHTML = `
    <input type="search" class="search-input" id="search-input" placeholder="Tìm sản phẩm... (vd: nấm, van khóa, ống)">
    <div class="chip-row" id="cat-chips">
      <button class="chip ${catalogState.category === "all" ? "active" : ""}" data-cat="all">Tất cả</button>
      ${data.categories
        .map(
          (c) =>
            `<button class="chip ${catalogState.category === c.id ? "active" : ""}" data-cat="${c.id}">${icon(c.icon)} ${esc(c.name)}</button>`
        )
        .join("")}
    </div>`;

  $("#search-input").addEventListener("input", (e) => {
    catalogState.search = e.target.value.trim().toLowerCase();
    renderCatalogGrid();
  });
  $$("#cat-chips .chip", filters).forEach((c) =>
    c.addEventListener("click", () => {
      catalogState.category = c.dataset.cat;
      $$("#cat-chips .chip", filters).forEach((x) => x.classList.toggle("active", x === c));
      renderCatalogGrid();
    })
  );

  renderCatalogGrid();

  function renderCatalogGrid() {
    const q = normalizeText(catalogState.search);
    let list = data.products.filter((p) => {
      if (catalogState.category !== "all" && p.category !== catalogState.category) return false;
      if (q && !normalizeText(p.name + " " + categoryName(p.category)).includes(q)) return false;
      return true;
    });
    grid.innerHTML = list.length
      ? list.map((p, i) => productCard(p, i)).join("")
      : `<p class="result-count">Không tìm thấy sản phẩm nào phù hợp.</p>`;
    count.textContent = list.length + " sản phẩm";
    wireProductGrid(grid);
  }
}

/* ---------- Gom phân loại theo độ ưu tiên: màu trước, đường kính (fi) sau ---------- */
const COLOR_ORDER = [
  "Trắng", "Đen", "Xám đậm", "Đỏ", "Cam", "Vàng",
  "Xanh lá", "Xanh dương", "Xanh ngọc lam", "Hồng",
];
function variationColor(name) {
  const n = name.toLowerCase();
  for (const c of COLOR_ORDER) if (n.includes(c.toLowerCase())) return c;
  return null;
}
function variationDiameter(name) {
  const m = name.match(/\d+/);
  return m ? parseInt(m[0], 10) : Infinity;
}
function sortVariations(vars) {
  return vars.slice().sort((a, b) => {
    const ca = variationColor(a.name);
    const cb = variationColor(b.name);
    const oa = ca ? COLOR_ORDER.indexOf(ca) : COLOR_ORDER.length;
    const ob = cb ? COLOR_ORDER.indexOf(cb) : COLOR_ORDER.length;
    if (oa !== ob) return oa - ob;
    const da = variationDiameter(a.name);
    const db = variationDiameter(b.name);
    if (da !== db) return da - db;
    return a.name.localeCompare(b.name, "vi");
  });
}

/* ---------- Detail modal ---------- */
function openProductModal(id) {
  const p = PRODUCTS.products.find((x) => x.id === id);
  if (!p) return;
  let overlay = $("#modal-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "modal-overlay";
    document.body.appendChild(overlay);
  }

  const single = p.variations.length === 1;
  const variants = sortVariations(p.variations);
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-image"><img id="modal-img" src="${esc(p.image)}" alt="${esc(p.name)}"></div>
      <div class="modal-body">
        <button class="modal-close" id="modal-close" aria-label="Đóng">${icon("x")}</button>
        <h2>${esc(p.name)}</h2>
        <div class="product-cat">${esc(categoryName(p.category))}</div>
        ${
          single
            ? ""
            : `<div class="modal-section">
                 <label>Chọn phân loại</label>
                 <div class="variant-grid" id="modal-variants">
                   ${variants
                     .map(
                       (v, i) => `
                     <button class="variant-card ${i === 0 ? "active" : ""}" data-sku="${esc(v.sku)}">
                       ${v.image ? `<img src="${esc(v.image)}" alt="" loading="lazy">` : ""}
                       <span class="variant-name">${esc(v.name)}</span>
                       <span class="variant-price">${formatMoney(sellPrice(v))}</span>
                     </button>`
                     )
                     .join("")}
                 </div>
               </div>`
        }
        <div class="modal-price" id="modal-price">${priceHTML(variants[0])}</div>
        <button class="btn btn-primary btn-block" id="modal-add">Thêm vào đơn</button>
      </div>
    </div>`;
  overlay.classList.add("open");

  let chosen = variants[0];
  $("#modal-close").addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  $$("#modal-variants .variant-card", overlay).forEach((c) =>
    c.addEventListener("click", () => {
      chosen = p.variations.find((v) => v.sku === c.dataset.sku) || chosen;
      $$("#modal-variants .variant-card", overlay).forEach((x) =>
        x.classList.toggle("active", x === c)
      );
      $("#modal-price").innerHTML = priceHTML(chosen);
      if (chosen.image) $("#modal-img").src = chosen.image;
    })
  );
  $("#modal-add").addEventListener("click", () => {
    if (!chosen) return;
    addToCart(p, chosen);
    closeModal();
  });
}

function closeModal() {
  const overlay = $("#modal-overlay");
  if (overlay) overlay.classList.remove("open");
}

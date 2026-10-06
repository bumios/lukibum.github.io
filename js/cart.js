// Cart drawer: add/edit items by SKU variation, bill, submit via Messenger
const CART_KEY = "lukibum-cart";
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
} catch (e) {
  cart = [];
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const el = $("#cart-count");
  if (!el) return;
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  if (el.textContent !== String(count)) {
    el.textContent = count;
    el.classList.remove("bump");
    void el.offsetWidth; // restart animation
    el.classList.add("bump");
  }
}

function rowTotal(item) {
  return item.price * item.qty;
}

function cartTotal() {
  return cart.reduce((sum, i) => sum + rowTotal(i), 0);
}

// p = product, v = variation {name, sku, price, image}
function addToCart(p, v, qty = 1) {
  if (!v) return;
  const key = p.id + "|" + v.sku;
  const existing = cart.find((i) => i.key === key);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      key,
      productId: p.id,
      name: p.name,
      variation: v.name,
      sku: v.sku,
      price: v.customerPrice ?? v.price,
      image: v.image || p.image,
      qty,
    });
  }
  saveCart();
  renderCart();
  showAddedToast(p.name);
}

// Toast xác nhận đã thêm vào đơn hàng (có icon + animation pop)
function showAddedToast(name) {
  showToast(`<b>${esc(name)}</b> đã được thêm vào đơn hàng`, {
    icon: icon("check-circle"),
    ms: 2400,
    html: true,
  });
}

function buildDrawer() {
  if ($("#cart-drawer")) return;
  const overlay = document.createElement("div");
  overlay.className = "drawer-overlay";
  overlay.id = "drawer-overlay";
  const drawer = document.createElement("aside");
  drawer.className = "cart-drawer";
  drawer.id = "cart-drawer";
  drawer.innerHTML = `
    <div class="drawer-header">
      <h2>Đơn hàng của bạn</h2>
      <button class="drawer-close" id="cart-close" aria-label="Đóng">${icon("x")}</button>
    </div>
    <div class="drawer-body" id="cart-body"></div>
    <div class="drawer-footer" id="cart-footer"></div>`;
  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  overlay.addEventListener("click", closeCart);
  $("#cart-close").addEventListener("click", closeCart);
  // Gắn qua event delegation: header (#cart-toggle) được render async sau
  // DOMContentLoaded, nên gắn trên document để bắt được click bất kể lúc nào.
  document.addEventListener("click", (e) => {
    if (e.target.closest("#cart-toggle")) openCart();
  });
}

function openCart() {
  renderCart();
  $("#cart-drawer").classList.add("open");
  $("#drawer-overlay").classList.add("open");
}
function closeCart() {
  $("#cart-drawer").classList.remove("open");
  $("#drawer-overlay").classList.remove("open");
}

function renderCart() {
  const body = $("#cart-body");
  const footer = $("#cart-footer");
  if (!body || !footer) return;

  if (!cart.length) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="icon">${icon("shopping-bag")}</div>
        <p>Đơn hàng trống.<br>Thêm sản phẩm để bắt đầu nhé!</p>
      </div>`;
    footer.innerHTML = "";
    return;
  }

  body.innerHTML = cart
    .map(
      (item, n) => `
    <div class="cart-item" style="--d:${n * 0.05}s">
      <div class="cart-item-top">
        <img class="cart-item-img" src="${esc(item.image)}" alt="" loading="lazy">
        <div class="cart-item-info">
          <div class="cart-item-name">${esc(item.name)}</div>
          ${item.variation ? `<div class="cart-item-meta">${esc(item.variation)}</div>` : ""}
        </div>
        <button class="cart-item-remove" data-remove="${n}" aria-label="Xóa món">${icon("trash")}</button>
      </div>
      <div class="cart-item-controls">
        <div class="stepper">
          <button data-dec="${n}" aria-label="Giảm">${icon("minus")}</button>
          <span>${item.qty}</span>
          <button data-inc="${n}" aria-label="Tăng">${icon("plus")}</button>
        </div>
        <span class="cart-item-total">${formatMoney(rowTotal(item))}</span>
      </div>
    </div>`
    )
    .join("");

  const totalUnits = cart.reduce((sum, i) => sum + i.qty, 0);
  footer.innerHTML = `
    <div class="cart-summary">${cart.length} mặt hàng • ${totalUnits} sản phẩm</div>
    <div class="cart-total-row">
      <span>Tổng cộng</span>
      <span class="amount">${formatMoney(cartTotal())}</span>
    </div>
    <p class="ship-note"><span class="ship-note-star">*</span> Giá chưa bao gồm phí ship.</p>
    <div class="drawer-actions">
      <button class="btn btn-accent btn-block" id="submit-order">${icon("message-circle")} Gửi đơn qua Messenger</button>
      <button class="btn btn-ghost btn-block" id="capture-order">${icon("camera")} Lưu ảnh đơn hàng</button>
      <button class="btn btn-ghost btn-block" id="clear-cart">Xóa đơn hàng</button>
    </div>`;

  $$("[data-remove]", body).forEach((b) =>
    b.addEventListener("click", () => {
      cart.splice(parseInt(b.dataset.remove, 10), 1);
      saveCart();
      renderCart();
    })
  );
  $$("[data-inc]", body).forEach((b) =>
    b.addEventListener("click", () => {
      const n = parseInt(b.dataset.inc, 10);
      cart[n].qty++;
      saveCart();
      updateItemQty(n);
    })
  );
  $$("[data-dec]", body).forEach((b) =>
    b.addEventListener("click", () => {
      const n = parseInt(b.dataset.dec, 10);
      cart[n].qty--;
      if (cart[n].qty <= 0) {
        cart.splice(n, 1);
        saveCart();
        renderCart();
        return;
      }
      saveCart();
      updateItemQty(n);
    })
  );

  $("#submit-order").addEventListener("click", submitOrder);
  $("#capture-order").addEventListener("click", captureCartImage);
  $("#clear-cart").addEventListener("click", () => {
    cart = [];
    saveCart();
    renderCart();
  });
}

// Cập nhật số lượng + giá tại chỗ, không render lại cả giỏ (tránh chạy lại animation)
function updateItemQty(n) {
  const b = $("#cart-body");
  const itemEl = b && b.children[n];
  if (itemEl) {
    const qtyEl = itemEl.querySelector(".stepper span");
    const totalEl = itemEl.querySelector(".cart-item-total");
    if (qtyEl) qtyEl.textContent = cart[n].qty;
    if (totalEl) totalEl.textContent = formatMoney(rowTotal(cart[n]));
  }
  const grandEl = $("#cart-footer .cart-total-row .amount");
  if (grandEl) grandEl.textContent = formatMoney(cartTotal());
}

async function submitOrder() {
  if (!cart.length) return;
  const lines = cart
    .map((i, n) => {
      const spec = i.variation ? ` (${i.variation})` : "";
      return `${n + 1}. ${i.name}${spec} — SKU: ${i.sku} — × ${i.qty} = ${formatMoney(rowTotal(i))}`;
    })
    .join("\n");
  const text =
    `Xin chào Lukibum! Mình muốn đặt hàng:\n\n${lines}\n\n` +
    `Tổng cộng: ${formatMoney(cartTotal())} (chưa bao gồm phí ship)`;

  const copied = await copyText(text);
  showToast(
    copied
      ? "Đã copy đơn hàng — mở Messenger rồi dán (Ctrl/⌘ + V) để gửi nhé!"
      : "Hãy copy nội dung đơn hàng bên dưới và dán vào Messenger.",
    { ms: 3400 }
  );
  window.open(APP.settings.messenger, "_blank");
}

// Copy chữ với fallback nhiều tầng: Clipboard API → textarea+execCommand → prompt
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e2) {
      window.prompt("Copy nội dung đơn hàng bên dưới:", text);
      return true;
    }
  }
}

// ---------- Chụp ảnh đơn hàng để khách lưu/chia sẻ ----------

// Tải html2canvas local (đã host sẵn) khi cần, không tải trước để nhẹ trang
function loadHtml2Canvas() {
  return new Promise((resolve, reject) => {
    if (window.html2canvas) return resolve();
    const s = document.createElement("script");
    s.src = "js/html2canvas.min.js";
    s.onload = resolve;
    s.onerror = () => reject(new Error("Không tải được html2canvas"));
    document.head.appendChild(s);
  });
}

// Chờ tất cả ảnh trong container load xong (để html2canvas vẽ được)
function waitForImages(root) {
  return Promise.all(
    $$("img", root).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((res) => {
            img.onload = res;
            img.onerror = res;
          })
    )
  );
}

async function captureCartImage() {
  if (!cart.length) return;
  const btn = $("#capture-order");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = "Đang chụp ảnh...";
  }

  // Sắp xếp A→Z để dễ đối chiếu khi chuẩn bị hàng (chỉ ảnh chụp, không đổi thứ tự giỏ)
  const sorted = [...cart].sort((a, b) => a.name.localeCompare(b.name, "vi"));
  const totalUnits = cart.reduce((sum, i) => sum + i.qty, 0);

  // Container chụp riêng, đặt ngoài màn hình nhưng vẫn render để vẽ được.
  // Dùng layout cố định (không dùng .cart-body đang scroll) để chụp ĐỦ toàn bộ món.
  const capture = document.createElement("div");
  capture.className = "order-capture";
  capture.innerHTML = `
    <div class="oc-header">
      <div class="oc-brand">Luki<b>bum</b></div>
      <div class="oc-sub">Đơn hàng · ${new Date().toLocaleDateString("vi-VN")}</div>
    </div>
    <div class="oc-items">
      ${sorted
        .map(
          (item) => `
        <div class="oc-item">
          <img class="oc-img" src="${esc(item.image)}" crossorigin="anonymous" alt="">
          <div class="oc-info">
            <div class="oc-name">${esc(item.name)}</div>
            ${item.variation ? `<div class="oc-meta">${esc(item.variation)}</div>` : ""}
            <div class="oc-qty">× ${item.qty}</div>
          </div>
          <div class="oc-price">${formatMoney(rowTotal(item))}</div>
        </div>`
        )
        .join("")}
    </div>
    <div class="oc-summary">${cart.length} mặt hàng • ${totalUnits} sản phẩm</div>
    <div class="oc-total">
      <span>Tổng cộng</span>
      <span>${formatMoney(cartTotal())}</span>
    </div>
    <div class="oc-note">Giá chưa bao gồm phí ship · Lukibum — phụ kiện ống UPVC cho cá cảnh &amp; DIY</div>`;
  document.body.appendChild(capture);

  try {
    await waitForImages(capture);
    await loadHtml2Canvas();
    const canvas = await html2canvas(capture, {
      useCORS: true,
      backgroundColor: "#ffffff",
      scale: 2,
      logging: false,
    });
    const dataUrl = canvas.toDataURL("image/png");
    showImageModal(dataUrl);
  } catch (e) {
    console.error("Chụp ảnh đơn hàng lỗi:", e);
    showToast("Không chụp được ảnh đơn hàng. Hãy thử lại nhé!", { ms: 3000 });
  } finally {
    if (capture.parentNode) capture.parentNode.removeChild(capture);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `${icon("camera")} Lưu ảnh đơn hàng`;
    }
  }
}

function showImageModal(dataUrl) {
  let modal = $("#image-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.className = "image-modal";
    modal.id = "image-modal";
    modal.innerHTML = `
      <div class="image-modal-card">
        <div class="image-modal-header">
          <h3>Ảnh đơn hàng</h3>
          <button class="drawer-close" id="image-modal-close" aria-label="Đóng">${icon("x")}</button>
        </div>
        <div class="image-modal-body">
          <img id="image-modal-img" src="" alt="Ảnh đơn hàng" draggable="false">
        </div>
        <div class="image-modal-actions">
          <button class="btn btn-primary btn-block" id="image-share">${icon("share")} Lưu ảnh / Chia sẻ</button>
          <a class="btn btn-ghost btn-block" id="image-download" download="don-hang-lukibum.png">${icon("camera")} Tải ảnh xuống</a>
          <p class="image-modal-hint">Trên điện thoại: bấm <b>Lưu ảnh / Chia sẻ</b> rồi chọn "Lưu vào thư viện".<br>Hoặc <b>nấn giữ</b> vào ảnh để lưu.</p>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeImageModal();
    });
    $("#image-modal-close").addEventListener("click", closeImageModal);
    $("#image-share").addEventListener("click", () => shareImage(dataUrl));
  }
  $("#image-modal-img").src = dataUrl;
  $("#image-download").href = dataUrl;
  modal.classList.add("open");
}

// Lưu/chia sẻ ảnh đơn hàng trên mobile qua Web Share API. Thuộc tính download
// bị iOS Safari bỏ qua với data URL nên không dùng được để lưu ảnh trên điện thoại.
async function shareImage(dataUrl) {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], "don-hang-lukibum.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "Đơn hàng Lukibum" });
    } else {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "don-hang-lukibum.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  } catch (e) {
    // Người dùng hủy chia sẻ hoặc trình duyệt không hỗ trợ — bỏ qua
  }
}

function closeImageModal() {
  const modal = $("#image-modal");
  if (modal) modal.classList.remove("open");
}

document.addEventListener("DOMContentLoaded", () => {
  buildDrawer();
  updateCartCount();
});

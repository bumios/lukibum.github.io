// Shared helpers + layout (header, footer, messenger FAB, carousel, toast)
const APP = { settings: null };

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

async function loadJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Không tải được " + url);
  return res.json();
}

function formatMoney(n) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

// Bộ icon Lucide (ISC license) — stroke 2px, viewBox 24x24, kế thừa currentColor
const ICONS = {
  "arrow-right": "<path d='M5 12h14' /> <path d='m12 5 7 7-7 7' />",
  "cable": "<path d='M17 21v-2a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1' /> <path d='M19 15V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V9' /> <path d='M21 21v-2h-4' /> <path d='M3 5h4V3' /> <path d='M7 5a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1V3' />",
  "chevron-left": "<path d='m15 18-6-6 6-6' />",
  "chevron-right": "<path d='m9 18 6-6-6-6' />",
  "check-circle": "<path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' /> <path d='m9 11 3 3L22 4' />",
  "camera": "<path d='M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z' /> <circle cx='12' cy='13' r='3' />",
  "facebook": "<path d='M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' />",
  "fish": "<path d='M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z' /> <path d='M18 12v.5' /> <path d='M16 17.93a9.77 9.77 0 0 1 0-11.86' /> <path d='M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33' /> <path d='M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4' /> <path d='m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98' />",
  "git-merge": "<circle cx='18' cy='18' r='3' /> <circle cx='6' cy='6' r='3' /> <path d='M6 21V9a9 9 0 0 0 9 9' />",
  "info": "<circle cx='12' cy='12' r='10' /> <path d='M12 16v-4' /> <path d='M12 8h.01' />",
  "link-2": "<path d='M9 17H7A5 5 0 0 1 7 7h2' /> <path d='M15 7h2a5 5 0 1 1 0 10h-2' /> <line x1='8' x2='16' y1='12' y2='12' />",
  "link": "<path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' /> <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />",
  "message-circle": "<path d='M7.9 20A9 9 0 1 0 4 16.1L2 22Z' />",
  "menu": "<line x1='4' x2='20' y1='6' y2='6' /> <line x1='4' x2='20' y1='12' y2='12' /> <line x1='4' x2='20' y1='18' y2='18' />",
  "minus": "<path d='M5 12h14' />",
  "music": "<path d='M9 18V5l12-2v13' /> <circle cx='6' cy='18' r='3' /> <circle cx='18' cy='16' r='3' />",
  "package": "<path d='M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z' /> <path d='M12 22V12' /> <path d='m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7' /> <path d='m7.5 4.27 9 5.15' />",
  "pin": "<path d='M12 17v5' /> <path d='M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z' />",
  "plus": "<path d='M5 12h14' /> <path d='M12 5v14' />",
  "shopping-bag": "<path d='M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z' /> <path d='M3 6h18' /> <path d='M16 10a4 4 0 0 1-8 0' />",
  "shopping-cart": "<circle cx='8' cy='21' r='1' /> <circle cx='19' cy='21' r='1' /> <path d='M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12' />",
  "sliders-horizontal": "<line x1='21' x2='14' y1='4' y2='4' /> <line x1='10' x2='3' y1='4' y2='4' /> <line x1='21' x2='12' y1='12' y2='12' /> <line x1='8' x2='3' y1='12' y2='12' /> <line x1='21' x2='16' y1='20' y2='20' /> <line x1='12' x2='3' y1='20' y2='20' /> <line x1='14' x2='14' y1='2' y2='6' /> <line x1='8' x2='8' y1='10' y2='14' /> <line x1='16' x2='16' y1='18' y2='22' />",
  "trash": "<path d='M3 6h18' /> <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' /> <path d='M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' /> <line x1='10' x2='10' y1='11' y2='17' /> <line x1='14' x2='14' y1='11' y2='17' />",
  "x": "<path d='M18 6 6 18' /> <path d='m6 6 12 12' />",
};

function icon(name, cls = "") {
  return `<svg class="icon-svg ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}

// Điền icon cho các phần tử tĩnh có thuộc tính data-icon
function fillIcons(root = document) {
  $$("[data-icon]", root).forEach((el) => {
    el.innerHTML = icon(el.dataset.icon, el.dataset.iconCls || "");
  });
}

async function initApp() {
  APP.settings = await loadJSON("data/settings.json?v=9");
  renderHeader();
  // Header (chứa #cart-count) mới vừa render xong → cập nhật số lượng giỏ hàng
  if (typeof updateCartCount === "function") updateCartCount();
  renderFooter();
  renderMessengerFab();
  fillIcons();
  initReveal();
  initHeaderShadow();
  initMenuToggle();
}

function initMenuToggle() {
  const toggle = $("#menu-toggle");
  const header = $(".site-header");
  if (!toggle || !header) return;
  const close = () => {
    header.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const open = header.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  // Đóng menu khi chọn một link
  header.querySelectorAll(".nav a").forEach((a) => a.addEventListener("click", close));
  // Đóng menu khi user cuộn trang (không chọn link)
  window.addEventListener(
    "scroll",
    () => {
      if (header.classList.contains("menu-open")) close();
    },
    { passive: true }
  );
}

function initReveal() {
  const els = $$(".reveal");
  if (!els.length) return;
  if (!("IntersectionObserver" in window)) {
    els.forEach((e) => e.classList.add("revealed"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("revealed");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  els.forEach((e) => io.observe(e));
}

function initHeaderShadow() {
  const header = $(".site-header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function renderHeader() {
  const el = $("#site-header");
  if (!el) return;
  el.className = "site-header";
  el.innerHTML = `
    <div class="header-inner">
      <a class="logo" href="index.html"><span class="logo-img" role="img" aria-label="Lukibum"></span></a>
      <nav class="nav">
        <a href="index.html">Trang chủ</a>
        <a href="san-pham.html">Sản phẩm</a>
        <a href="huong-dan-mua-hang.html">Hướng dẫn mua hàng</a>
      </nav>
      <button class="menu-toggle" id="menu-toggle" aria-label="Menu">${icon("menu")}</button>
      <button class="cart-btn" id="cart-toggle" aria-label="Đơn hàng">
        ${icon("shopping-bag")} <span class="cart-count" id="cart-count">0</span>
      </button>
    </div>`;
}

function renderFooter() {
  const el = $("#site-footer");
  if (!el) return;
  const s = APP.settings;
  const socials = [
    { key: "tiktok", label: "Tiktok", img: "assets/images/logo-tiktok.svg" },
    { key: "shopee", label: "Shopee", img: "assets/images/logo-shopee.svg" },
    { key: "facebook", label: "Facebook", img: "assets/images/logo-facebook.svg" },
  ];
  el.className = "site-footer";
  el.innerHTML = `
    <div class="footer-inner">
      <div class="footer-brand"><span class="fish-logo" role="img" aria-label="Lukibum"></span> Luki<b>bum</b> — ${esc(s.tagline)}</div>
      <div class="social-row">
        ${socials
          .map(
            (so) =>
              `<a href="${esc(s.socials[so.key] || "#")}" target="_blank" rel="noopener" ${
                s.socials[so.key] ? "" : 'style="opacity:.55"'
              }><img class="social-logo" src="${so.img}" alt="${so.label}"> ${so.label}</a>`
          )
          .join("")}
      </div>
      <p class="footer-note">© ${new Date().getFullYear()} Lukibum. Phụ kiện ống UPVC nhiều màu cho cá cảnh & DIY.</p>
    </div>`;
}

function renderMessengerFab() {
  if ($("#messenger-fab")) return;
  const btn = document.createElement("button");
  btn.className = "messenger-fab";
  btn.id = "messenger-fab";
  btn.title = "Chat với Lukibum";
  btn.innerHTML = icon("message-circle");
  btn.addEventListener("click", () => {
    window.open(APP.settings.messenger, "_blank");
  });
  document.body.appendChild(btn);
}

function renderCarousel() {
  const el = $("#carousel");
  if (!el) return;
  const banners = APP.settings.banners || [];
  if (!banners.length) return;
  let idx = 0;
  el.innerHTML =
    banners
      .map((b, i) => {
        const active = i === 0 ? "active" : "";
        if (b.image) {
          const mobileImg = b.mobileImage || b.image;
          // URL trong CSS variable được resolve so với css/style.css, nên phải dùng
          // đường dẫn tuyệt đối theo gốc site (/assets/...) để không bị thêm /css/
          const abs = (p) => (p.startsWith("/") ? p : "/" + p);
          return `<div class="slide slide-full ${active}" style="--slide-img:url('${esc(abs(b.image))}');--slide-img-mobile:url('${esc(abs(mobileImg))}')"></div>`;
        }
        if (b.scene) {
          return `<div class="slide ${active}">
            <div class="slide-content">
              <h2>${esc(b.title)}</h2>
              <p>${esc(b.subtitle)}</p>
            </div>
            <div class="slide-image" style="background-image:url('${esc(b.scene)}')"></div>
          </div>`;
        }
        // Banner chưa có ảnh: viền nét đứt tượng trưng gần full content + 2 kích thước
        return `<div class="slide slide-nophoto ${active}">
          <div class="nophoto-frame">
            ${b.title ? `<h2>${esc(b.title)}</h2>` : ""}
            ${b.subtitle ? `<p>${esc(b.subtitle)}</p>` : ""}
            <div class="nophoto-sizes">
              <span>Web: 2048 × 768</span>
              <span>Mobile: 1448 × 1086</span>
            </div>
          </div>
        </div>`;
      })
      .join("") +
    `<button class="carousel-btn prev" aria-label="Trước">${icon("chevron-left")}</button>
     <button class="carousel-btn next" aria-label="Sau">${icon("chevron-right")}</button>
     <div class="carousel-dots">
       ${banners.map((_, i) => `<button data-i="${i}" class="${i === 0 ? "active" : ""}" aria-label="Slide ${i + 1}"></button>`).join("")}
     </div>`;

  // decorative rising bubbles (aquarium vibe)
  for (let i = 0; i < 9; i++) {
    const b = document.createElement("span");
    b.className = "bubble";
    const size = 10 + Math.random() * 38;
    b.style.width = size + "px";
    b.style.height = size + "px";
    b.style.left = Math.random() * 100 + "%";
    b.style.animationDuration = 6 + Math.random() * 9 + "s";
    b.style.animationDelay = -Math.random() * 12 + "s";
    el.appendChild(b);
  }

  const AUTO_MS = 8000; // khoảng thời gian tự chuyển slide (ms)
  let timer = null;
  function go(i) {
    idx = (i + banners.length) % banners.length;
    $$(".slide", el).forEach((s, n) => s.classList.toggle("active", n === idx));
    $$(".carousel-dots button", el).forEach((d, n) => d.classList.toggle("active", n === idx));
  }
  // Đặt lại đồng hồ tự chuyển: mỗi khi user bấm thì đếm lại từ đầu
  function restartTimer() {
    clearInterval(timer);
    timer = setInterval(() => go(idx + 1), AUTO_MS);
  }
  $(".carousel-btn.prev", el).addEventListener("click", () => { go(idx - 1); restartTimer(); });
  $(".carousel-btn.next", el).addEventListener("click", () => { go(idx + 1); restartTimer(); });
  $$(".carousel-dots button", el).forEach((d) =>
    d.addEventListener("click", () => { go(parseInt(d.dataset.i, 10)); restartTimer(); })
  );
  restartTimer();
}

function renderDeals() {
  const el = $("#deals-grid");
  if (!el) return;
  const deals = (APP.settings && APP.settings.deals) || [];
  if (!deals.length) return;
  el.innerHTML = deals
    .map(
      (d, i) => `
    <div class="deal-card" style="--d:${i * 0.07}s">
      <div class="deal-icon">${icon(d.icon || "info")}</div>
      <span class="deal-tag">${esc(d.tag || "")}</span>
      <h3>${esc(d.title)}</h3>
      <p>${esc(d.desc)}</p>
    </div>`
    )
    .join("");
}

function showToast(msg, opts = {}) {
  const { icon: ic = "", ms = 2600, html = false } = opts;
  let t = $("#toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    t.id = "toast";
    document.body.appendChild(t);
  }
  if (html) {
    t.innerHTML = ic
      ? `<span class="toast-icon">${ic}</span><span class="toast-msg">${msg}</span>`
      : `<span class="toast-msg">${msg}</span>`;
  } else {
    t.textContent = msg;
  }
  // Tắt rồi bật lại class .show để animation pop chạy lại mỗi lần hiện
  t.classList.remove("show");
  void t.offsetWidth;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), ms);
}

/* Rooted Botanica — shop logic (no frameworks, no build step). */
(function () {
  "use strict";

  const CFG = window.SHOP_CONFIG;
  const PRODUCTS = window.PRODUCTS;
  const CARDS = window.CARE_CARDS;
  const CART_KEY = "rb-cart-v1";
  const main = document.getElementById("main");

  /* ---------- helpers ---------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => CFG.currency + Number(n).toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const byId = (id) => PRODUCTS.find((p) => p.id === id);
  const cardById = (id) => CARDS.find((c) => c.id === id);
  const totalStock = (p) => p.sizes.reduce((a, s) => a + s.stock, 0);
  const inStockSizes = (p) => p.sizes.filter((s) => s.stock > 0);
  const fromPrice = (p) => {
    const s = inStockSizes(p);
    return Math.min(...(s.length ? s : p.sizes).map((x) => x.price));
  };
  const categories = [...new Set(PRODUCTS.map((p) => p.category))];

  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2400);
  }

  /* ---------- illustrations (used when there's no photo yet) ---------- */
  const ILLUS = {
    flytrap: `<svg viewBox="0 0 200 200" aria-hidden="true"><rect width="200" height="200" fill="#eef3e2"/><path d="M100 190 C100 150 98 130 100 110" stroke="#4f7a2f" stroke-width="6" fill="none"/><g transform="translate(100 90)"><path d="M0 0 C-50 -10 -60 -60 -20 -70 C-5 -45 -2 -20 0 0z" fill="#7aa64a"/><path d="M0 0 C50 -10 60 -60 20 -70 C5 -45 2 -20 0 0z" fill="#8bb85a"/><path d="M-6 -8 C-30 -20 -32 -48 -18 -60 C-8 -40 -6 -24 -6 -8z" fill="#c23b3b"/><path d="M6 -8 C30 -20 32 -48 18 -60 C8 -40 6 -24 6 -8z" fill="#d24a4a"/><g stroke="#7aa64a" stroke-width="3" stroke-linecap="round"><path d="M-20 -70 l-6 -12M-34 -64 l-10 -9M-46 -52 l-12 -5M-54 -36 l-13 -1"/><path d="M20 -70 l6 -12M34 -64 l10 -9M46 -52 l12 -5M54 -36 l13 -1"/></g></g><path d="M100 160 C70 150 50 160 40 175 C60 172 80 170 100 165z" fill="#6b9a3e"/><path d="M100 160 C130 150 150 160 160 175 C140 172 120 170 100 165z" fill="#6b9a3e"/></svg>`,
    sarracenia: `<svg viewBox="0 0 200 200" aria-hidden="true"><rect width="200" height="200" fill="#f3efe4"/><g><path d="M70 190 L60 60 Q58 45 70 42 L80 42 Q86 48 82 60 L80 190z" fill="#8bb85a"/><path d="M58 52 Q70 20 92 34 Q84 46 66 54z" fill="#9b2f3f"/><path d="M62 70 L80 70 M63 90 L80 90 M64 110 L80 110" stroke="#9b2f3f" stroke-width="2" opacity=".5"/></g><g><path d="M110 190 L112 40 Q113 24 126 24 L136 26 Q142 34 136 44 L124 190z" fill="#7aa64a"/><path d="M110 34 Q126 0 150 18 Q140 32 118 38z" fill="#b8434f"/><path d="M114 60 L132 62 M114 82 L130 84 M114 104 L128 106" stroke="#b8434f" stroke-width="2" opacity=".5"/></g><g><path d="M145 190 L150 90 Q151 80 160 80 L166 82 Q170 88 166 94 L156 190z" fill="#9bc46a"/><path d="M148 86 Q160 62 176 74 Q168 84 154 90z" fill="#9b2f3f"/></g></svg>`,
    nepenthes: `<svg viewBox="0 0 200 200" aria-hidden="true"><rect width="200" height="200" fill="#e8f0ec"/><path d="M30 40 C70 30 110 40 140 60" stroke="#5e8c3a" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M140 60 C150 80 120 90 118 110" stroke="#6b8f3a" stroke-width="3" fill="none"/><path d="M100 120 C96 150 98 180 118 186 C140 190 146 160 140 120z" fill="#b5c95a"/><ellipse cx="120" cy="120" rx="21" ry="7" fill="#7b8f2a"/><ellipse cx="120" cy="120" rx="16" ry="4" fill="#3d4a1a"/><path d="M110 116 C108 100 132 98 134 112z" fill="#a4b84a"/><path d="M108 150 Q120 154 136 148" stroke="#a8432f" stroke-width="2" fill="none" opacity=".6"/></svg>`,
    sundew: `<svg viewBox="0 0 200 200" aria-hidden="true"><rect width="200" height="200" fill="#f1ede6"/><g stroke="#7aa64a" stroke-width="6" fill="none" stroke-linecap="round"><path d="M100 190 C100 150 96 120 100 100"/><path d="M100 100 C90 70 70 50 60 30"/><path d="M100 100 C110 70 130 50 140 30"/><path d="M98 140 C80 120 50 110 34 96"/><path d="M102 140 C120 120 150 110 166 96"/></g><g fill="#d24a4a"><circle cx="60" cy="30" r="5"/><circle cx="66" cy="44" r="4"/><circle cx="76" cy="58" r="4"/><circle cx="140" cy="30" r="5"/><circle cx="134" cy="44" r="4"/><circle cx="124" cy="58" r="4"/><circle cx="34" cy="96" r="5"/><circle cx="48" cy="104" r="4"/><circle cx="62" cy="112" r="4"/><circle cx="166" cy="96" r="5"/><circle cx="152" cy="104" r="4"/><circle cx="138" cy="112" r="4"/></g><g fill="#fff" opacity=".85"><circle cx="58" cy="28" r="1.6"/><circle cx="138" cy="28" r="1.6"/><circle cx="32" cy="94" r="1.6"/><circle cx="164" cy="94" r="1.6"/></g></svg>`,
    set: `<svg viewBox="0 0 200 200" aria-hidden="true"><rect width="200" height="200" fill="#f3efe4"/><g transform="rotate(-10 100 100)"><rect x="40" y="50" width="100" height="120" rx="8" fill="#dfe8cc" stroke="#1f3d2b" stroke-width="2"/></g><g transform="rotate(-3 100 100)"><rect x="50" y="45" width="100" height="120" rx="8" fill="#eef3e2" stroke="#1f3d2b" stroke-width="2"/></g><g transform="rotate(6 100 100)"><rect x="60" y="40" width="100" height="120" rx="8" fill="#fffdf7" stroke="#1f3d2b" stroke-width="2"/><rect x="74" y="58" width="72" height="10" rx="3" fill="#9b2f3f"/><rect x="74" y="78" width="60" height="6" rx="3" fill="#a9b99a"/><rect x="74" y="92" width="66" height="6" rx="3" fill="#a9b99a"/><rect x="74" y="106" width="54" height="6" rx="3" fill="#a9b99a"/><circle cx="130" cy="136" r="10" fill="#7aa64a"/></g></svg>`,
  };
  const cardIllus = (kind) =>
    `<div class="care-card-art">${ILLUS[kind] || ILLUS.set}<span class="care-card-label">Care card</span></div>`;

  function productImage(p, cls = "") {
    if (p.image) return `<img class="${cls}" src="${esc(p.image)}" alt="${esc(p.name)} in its pot" loading="lazy" width="900" height="1200">`;
    return `<div class="illus ${cls}" role="img" aria-label="Drawing of a ${esc(p.name)} (photo coming soon)">${ILLUS[p.illustration] || ""}<span class="illus-note">Photo coming soon</span></div>`;
  }

  /* ---------- cart ---------- */
  function loadCart() {
    try {
      const c = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(c) ? c : [];
    } catch (e) {
      return [];
    }
  }
  let cart = loadCart();
  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      /* storage blocked — cart still works for this visit */
    }
    updateCartCount();
  }
  function updateCartCount() {
    const n = cart.reduce((a, l) => a + l.qty, 0);
    const el = document.getElementById("cart-count");
    el.textContent = n;
    el.classList.toggle("has", n > 0);
  }

  // Resolve a cart line to its current price/stock/name (so price edits apply immediately).
  function resolveLine(l) {
    if (l.type === "plant") {
      const p = byId(l.id);
      const s = p && p.sizes.find((x) => x.size === l.size);
      if (!p || !s) return null;
      const addon = CFG.careCardWithPlant === "addon" && l.card ? CFG.careCardAddonPrice : 0;
      return { name: `${p.name} (${s.size})`, unit: s.price + addon, stock: s.stock, product: p, addon };
    }
    const c = cardById(l.id);
    if (!c) return null;
    return { name: c.name, unit: c.price, stock: c.stock, card: c };
  }
  const lineKey = (l) => `${l.type}:${l.id}:${l.size || ""}`;

  function addToCart(item, qty) {
    const existing = cart.find((l) => lineKey(l) === lineKey(item));
    const r = resolveLine(item);
    if (!r) return false;
    const already = existing ? existing.qty : 0;
    const allowed = Math.max(0, Math.min(qty, r.stock - already));
    if (allowed <= 0) {
      toast("Sorry — that's all we have in stock.");
      return false;
    }
    if (existing) {
      existing.qty += allowed;
      if (item.card) existing.card = true;
    } else cart.push({ ...item, qty: allowed });
    saveCart();
    toast(allowed < qty ? `Added ${allowed} (that's all we have)` : "Added to your cart 🌱");
    return true;
  }

  function cartTotals(deliveryId) {
    let subtotal = 0;
    const lines = [];
    cart.forEach((l) => {
      const r = resolveLine(l);
      if (!r) return;
      lines.push({ l, r, total: r.unit * l.qty });
      subtotal += r.unit * l.qty;
    });
    const d = CFG.delivery.find((x) => x.id === deliveryId) || CFG.delivery[0];
    return { lines, subtotal, delivery: d, total: subtotal + (lines.length ? d.price : 0) };
  }

  /* ---------- shared bits ---------- */
  function productCard(p) {
    const stock = totalStock(p);
    return `<article class="p-card${stock ? "" : " sold-out"}">
      <a href="#/plant/${esc(p.id)}" class="p-card-link">
        <div class="p-card-img">${productImage(p)}
          ${p.isNew ? '<span class="badge badge-new">New</span>' : ""}
          ${!stock ? '<span class="badge badge-out">Sold out</span>' : stock <= 3 ? '<span class="badge badge-low">Only ' + stock + " left</span>" : ""}
        </div>
        <div class="p-card-body">
          <p class="p-cat">${esc(p.category)}</p>
          <h3>${esc(p.name)}</h3>
          <p class="p-latin">${esc(p.latin)}</p>
          <p class="p-price">${stock ? "from " + money(fromPrice(p)) : "Back soon"}</p>
        </div>
      </a>
    </article>`;
  }

  function careCardTile(c) {
    return `<article class="p-card">
      <div class="p-card-img">${cardIllus(c.illustration)}</div>
      <div class="p-card-body">
        <p class="p-cat">Printed care card</p>
        <h3>${esc(c.name)}</h3>
        <p class="p-latin">For ${esc(c.for)}</p>
        <div class="p-card-row"><span class="p-price">${money(c.price)}</span>
          <button class="btn btn-sm" data-add-card="${esc(c.id)}" ${c.stock ? "" : "disabled"}>${c.stock ? "Add" : "Sold out"}</button></div>
      </div>
    </article>`;
  }

  function searchBar(value = "") {
    return `<form class="search" role="search" data-search>
      <label class="sr-only" for="q">Search plants</label>
      <input id="q" name="q" type="search" placeholder="Search flytraps, pitcher plants, sundews…" value="${esc(value)}" autocomplete="off">
      <button class="btn" type="submit">Search</button>
    </form>
    <div class="popular"><span>Popular searches:</span>
      ${CFG.popularSearches.map((s) => `<a class="chip" href="#/shop?q=${encodeURIComponent(s)}">${esc(s)}</a>`).join("")}
    </div>`;
  }

  /* ---------- pages ---------- */
  function pageHome() {
    const newOnes = PRODUCTS.filter((p) => p.isNew && totalStock(p));
    const catTiles = categories
      .map((cat) => {
        const p = PRODUCTS.find((x) => x.category === cat && x.image) || PRODUCTS.find((x) => x.category === cat);
        return `<a class="cat-tile" href="#/shop?cat=${encodeURIComponent(cat)}">${productImage(p)}<span>${esc(cat)}</span></a>`;
      })
      .join("");
    return `
    <section class="hero">
      <div class="wrap hero-inner">
        <div class="hero-text">
          <p class="eyebrow">Hand-grown in South Africa</p>
          <h1>Plants that eat bugs. <span>Grown with love.</span></h1>
          <p class="lede">Venus flytraps, pitcher plants and sundews — raised by a young plant-keeper and sent with a care card so yours thrives.</p>
          <div class="hero-cta"><a class="btn btn-lg" href="#/shop">Shop plants</a><a class="btn btn-lg btn-ghost" href="#/care-cards">Care cards</a></div>
        </div>
        <div class="hero-img"><img src="assets/img/nepenthes-noid-pitcher.jpg" alt="A green tropical pitcher plant held in a hand" width="900" height="1200"></div>
      </div>
    </section>

    <section class="wrap section search-section">${searchBar()}</section>

    ${newOnes.length ? `<section class="wrap section">
      <div class="section-head"><h2>New arrivals</h2><a href="#/shop?new=1">See all →</a></div>
      <div class="grid">${newOnes.map(productCard).join("")}</div>
    </section>` : ""}

    <section class="wrap section">
      <div class="section-head"><h2>Shop by plant</h2><a href="#/shop">All plants →</a></div>
      <div class="cat-grid">${catTiles}</div>
    </section>

    <section class="band">
      <div class="wrap band-inner">
        <div>${cardIllus("set")}</div>
        <div>
          <h2>Care cards — so your plant thrives</h2>
          <p>Every care card explains light, water, soil and winter rest in simple steps. ${CFG.careCardWithPlant === "included" ? "<strong>A free card comes with every plant</strong>, and you can buy extra cards for gifts or plants you already own." : "Add one to any plant, or buy cards on their own."}</p>
          <a class="btn" href="#/care-cards">Browse care cards</a>
        </div>
      </div>
    </section>

    <section class="wrap section promises">
      <div><strong>🌧 Rainwater-grown</strong><p>Our plants are raised the right way — no tap water, no fertiliser.</p></div>
      <div><strong>📦 Packed with care</strong><p>Wrapped snugly so they arrive happy.</p></div>
      <div><strong>💬 Friendly help</strong><p>Questions after you buy? Just ask.</p></div>
    </section>`;
  }

  function pageShop(params) {
    const q = (params.get("q") || "").trim();
    const cat = params.get("cat") || "";
    const onlyNew = params.get("new") === "1";
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hay = (p) => [p.name, p.latin, p.category, p.blurb, p.difficulty + " friendly", ...p.tags].join(" ").toLowerCase();
    let list = PRODUCTS.filter((p) => (!cat || p.category === cat) && (!onlyNew || p.isNew) && terms.every((t) => hay(p).includes(t)));
    // in-stock first
    list = list.slice().sort((a, b) => (totalStock(b) > 0) - (totalStock(a) > 0));
    const wantCards = terms.length && terms.some((t) => "care cards".includes(t) || t.startsWith("card"));
    const cardMatches = wantCards ? CARDS : [];

    const chip = (label, href, on) => `<a class="chip${on ? " on" : ""}" href="${href}">${esc(label)}</a>`;
    const title = onlyNew ? "New arrivals" : cat || (q ? `Results for “${esc(q)}”` : "All plants");
    return `<section class="wrap section">
      <h1 class="page-title">${title}</h1>
      ${searchBar(q)}
      <div class="filters" aria-label="Filter by type">
        ${chip("All", "#/shop", !cat && !onlyNew)}
        ${chip("New arrivals", "#/shop?new=1", onlyNew)}
        ${categories.map((c) => chip(c, "#/shop?cat=" + encodeURIComponent(c), cat === c)).join("")}
        ${chip("Care cards", "#/care-cards", false)}
      </div>
      ${list.length || cardMatches.length ? "" : `<p class="empty">No plants match that search. <a href="#/shop">See everything</a></p>`}
      <div class="grid">${list.map(productCard).join("")}${cardMatches.map(careCardTile).join("")}</div>
    </section>`;
  }

  function pagePlant(id) {
    const p = byId(id);
    if (!p) return pageNotFound();
    const first = inStockSizes(p)[0];
    const card = cardById(p.careCard);
    const imgs = [p.image, ...p.gallery].filter(Boolean);
    const cardLine =
      CFG.careCardWithPlant === "included"
        ? `<p class="included">✓ Free printed care card included</p>`
        : `<label class="check"><input type="checkbox" id="add-card"> Add a printed care card (+${money(CFG.careCardAddonPrice)} each)</label>`;
    return `<section class="wrap section product">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/shop">Shop</a> / <a href="#/shop?cat=${encodeURIComponent(p.category)}">${esc(p.category)}</a></nav>
      <div class="product-grid">
        <div class="gallery">
          <div class="gallery-main" id="gallery-main">${productImage(p)}</div>
          ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((src, i) => `<button class="thumb${i ? "" : " on"}" data-src="${esc(src)}" aria-label="Show photo ${i + 1}"><img src="${esc(src)}" alt="" width="90" height="120"></button>`).join("")}</div>` : ""}
        </div>
        <div class="product-info">
          ${p.isNew ? '<span class="badge badge-new static">New arrival</span>' : ""}
          <h1>${esc(p.name)}</h1>
          <p class="p-latin">${esc(p.latin)}</p>
          <p class="lede">${esc(p.blurb)}</p>
          <p class="difficulty">Difficulty: <strong>${esc(p.difficulty)}</strong></p>

          <fieldset class="sizes">
            <legend>Choose a size</legend>
            ${p.sizes
              .map(
                (s) => `<label class="size${s.stock ? "" : " out"}">
                <input type="radio" name="size" value="${esc(s.size)}" ${s.stock ? "" : "disabled"} ${first && first.size === s.size ? "checked" : ""}>
                <span class="size-name">${esc(s.size)}</span>
                <span class="size-price">${money(s.price)}</span>
                <span class="size-stock">${s.stock ? (s.stock <= 3 ? `Only ${s.stock} left` : "In stock") : "Sold out"}</span>
              </label>`
              )
              .join("")}
          </fieldset>

          ${
            first
              ? `<div class="buy-row">
              <label class="qty"><span class="sr-only">Quantity</span>
                <button type="button" data-qty="-1" aria-label="One less">−</button>
                <input id="qty" type="number" min="1" value="1" inputmode="numeric">
                <button type="button" data-qty="1" aria-label="One more">+</button>
              </label>
              <button class="btn btn-lg" id="add-plant" data-id="${esc(p.id)}">Add to cart</button>
            </div>
            ${cardLine}`
              : `<p class="empty">This plant is sold out right now. ${CFG.whatsappNumber ? `<a href="https://wa.me/${esc(CFG.whatsappNumber)}?text=${encodeURIComponent("Hi! Please let me know when " + p.name + " is back in stock.")}" target="_blank" rel="noopener">Ask to be told when it's back</a>` : "Check back soon!"}</p>`
          }

          <div class="care-box">
            <h2>How to care for it</h2>
            <dl>
              <dt>☀️ Light</dt><dd>${esc(p.care.light)}</dd>
              <dt>💧 Water</dt><dd>${esc(p.care.water)}</dd>
              <dt>🪴 Soil</dt><dd>${esc(p.care.soil)}</dd>
              <dt>❄️ Winter</dt><dd>${esc(p.care.winter)}</dd>
            </dl>
            ${card ? `<p>Want a spare? <a href="#/care-cards">Get the ${esc(card.name)}</a> on its own.</p>` : ""}
          </div>
        </div>
      </div>
      ${(() => {
        const related = PRODUCTS.filter((x) => x.id !== p.id && x.category === p.category && totalStock(x)).slice(0, 4);
        return related.length ? `<div class="section-head related"><h2>You might also like</h2></div><div class="grid">${related.map(productCard).join("")}</div>` : "";
      })()}
    </section>`;
  }

  function pageCareCards() {
    return `<section class="wrap section">
      <h1 class="page-title">Plant care cards</h1>
      <p class="lede narrow">Pocket-sized printed cards with easy, step-by-step care for each type of carnivorous plant. Perfect for gifts, plant swaps or the plants you already have at home. ${CFG.careCardWithPlant === "included" ? "<strong>Buying a plant? A free card is already included.</strong>" : ""}</p>
      <div class="grid">${CARDS.map(careCardTile).join("")}</div>
    </section>`;
  }

  function pageCare() {
    const groups = [...new Map(PRODUCTS.map((p) => [p.category, p])).values()];
    return `<section class="wrap section">
      <h1 class="page-title">Plant care basics</h1>
      <div class="golden">
        <h2>The 3 golden rules</h2>
        <ol>
          <li><strong>Only rainwater or distilled water.</strong> Tap water has minerals that slowly harm carnivorous plants.</li>
          <li><strong>No fertiliser, no normal potting soil.</strong> They get their food from bugs.</li>
          <li><strong>Lots of light.</strong> Most of them want sun — a dark room makes them weak and floppy.</li>
        </ol>
      </div>
      <div class="care-grid">
        ${groups
          .map(
            (p) => `<article class="care-box">
          <h2>${esc(p.category)}</h2>
          <dl><dt>☀️ Light</dt><dd>${esc(p.care.light)}</dd><dt>💧 Water</dt><dd>${esc(p.care.water)}</dd><dt>🪴 Soil</dt><dd>${esc(p.care.soil)}</dd><dt>❄️ Winter</dt><dd>${esc(p.care.winter)}</dd></dl>
          <a href="#/shop?cat=${encodeURIComponent(p.category)}">Shop ${esc(p.category)} →</a>
        </article>`
          )
          .join("")}
      </div>
    </section>`;
  }

  function pageAbout() {
    return `<section class="wrap section narrow-page">
      <h1 class="page-title">Hi, welcome to Rooted Botanica!</h1>
      <p class="lede">I grow carnivorous plants because I think they're the coolest plants on Earth. They live in places with poor soil, so they learned to catch insects for food!</p>
      <p>Every plant in the shop was looked after by me — watered with rainwater, given lots of sun, and checked for pests. When you buy a plant, you're helping a young plant business grow.</p>
      <p>Each plant comes with a care card so you know exactly how to keep it happy. And if you get stuck, just send a message.</p>
      <p class="muted">Rooted Botanica is run with help from my parents, who handle payments and deliveries.</p>
      <a class="btn" href="#/shop">Meet the plants</a>
    </section>`;
  }

  function pageDelivery() {
    return `<section class="wrap section narrow-page">
      <h1 class="page-title">Delivery &amp; returns</h1>
      <h2>Delivery options</h2>
      <ul>${CFG.delivery.map((d) => `<li>${esc(d.label)} — ${d.price ? money(d.price) : "free"}</li>`).join("")}</ul>
      <p>Live plants are posted early in the week so they don't sit in a depot over the weekend. We'll message you with tracking once your plant is on its way.</p>
      <h2>If something goes wrong</h2>
      <p>Plants are living things. If your plant arrives damaged, send us a photo within 48 hours of delivery and we'll sort it out with a replacement or refund.</p>
      <h2>Care cards</h2>
      <p>Printed care cards can be returned unused within 7 days.</p>
    </section>`;
  }

  function pagePrivacy() {
    return `<section class="wrap section narrow-page">
      <h1 class="page-title">Privacy</h1>
      <p>We only ask for the details we need to send your order: your name, phone number, email and delivery address.</p>
      <ul>
        <li>We use them only to confirm, deliver and support your order.</li>
        <li>We never sell or share them, except with the courier delivering your parcel.</li>
        <li>This website doesn't use tracking cookies. Your cart is saved only in your own browser.</li>
        <li>Ask us any time to see or delete your details.</li>
      </ul>
      <p class="muted">This notice follows the Protection of Personal Information Act (POPIA).</p>
    </section>`;
  }

  function pageNotFound() {
    return `<section class="wrap section narrow-page"><h1 class="page-title">Oops — that page got eaten 🪰</h1><p><a class="btn" href="#/shop">Back to the shop</a></p></section>`;
  }

  /* ----- cart + checkout ----- */
  let checkoutDraft = { delivery: CFG.delivery[0].id };

  function pageCart() {
    if (!cart.length)
      return `<section class="wrap section narrow-page"><h1 class="page-title">Your cart</h1><p class="empty">Your cart is empty — let's find you a hungry plant.</p><a class="btn" href="#/shop">Shop plants</a></section>`;
    const t = cartTotals(checkoutDraft.delivery);
    const incl = CFG.careCardWithPlant === "included";
    return `<section class="wrap section">
      <h1 class="page-title">Your cart</h1>
      <div class="cart-grid">
        <div>
          <ul class="cart-lines">
            ${t.lines
              .map(({ l, r, total }, i) => {
                const img = l.type === "plant" ? productImage(r.product, "thumb-img") : cardIllus(r.card.illustration);
                return `<li class="cart-line">
                <div class="cl-img">${img}</div>
                <div class="cl-info">
                  <p class="cl-name">${esc(r.name)}</p>
                  <p class="muted">${money(r.unit)} each${l.type === "plant" ? (incl ? " · free care card included" : l.card ? " · incl. care card" : "") : ""}</p>
                  <div class="cl-actions">
                    <label class="qty sm"><span class="sr-only">Quantity</span>
                      <button type="button" data-line="${i}" data-step="-1" aria-label="One less">−</button>
                      <span>${l.qty}</span>
                      <button type="button" data-line="${i}" data-step="1" aria-label="One more" ${l.qty >= r.stock ? "disabled" : ""}>+</button>
                    </label>
                    ${l.type === "plant" && !incl ? `<label class="check sm"><input type="checkbox" data-card-line="${i}" ${l.card ? "checked" : ""}> Care card (+${money(CFG.careCardAddonPrice)})</label>` : ""}
                    <button class="link" data-remove="${i}">Remove</button>
                  </div>
                </div>
                <p class="cl-total">${money(total)}</p>
              </li>`;
              })
              .join("")}
          </ul>
          <a href="#/shop" class="link">← Keep shopping</a>
        </div>

        <form class="checkout" id="checkout" novalidate>
          <h2>Checkout</h2>
          <fieldset>
            <legend>Delivery</legend>
            ${CFG.delivery
              .map(
                (d) => `<label class="radio"><input type="radio" name="delivery" value="${esc(d.id)}" ${checkoutDraft.delivery === d.id ? "checked" : ""}> <span>${esc(d.label)}</span> <span class="muted">${d.price ? money(d.price) : "Free"}</span></label>`
              )
              .join("")}
          </fieldset>
          <label>Full name<input name="name" autocomplete="name" required value="${esc(checkoutDraft.name)}"></label>
          <label>Cell number<input name="phone" type="tel" autocomplete="tel" required value="${esc(checkoutDraft.phone)}"></label>
          <label>Email<input name="email" type="email" autocomplete="email" value="${esc(checkoutDraft.email)}"></label>
          <label class="addr">Delivery address or PUDO locker<textarea name="address" rows="2" autocomplete="street-address">${esc(checkoutDraft.address)}</textarea></label>
          <label>Notes (optional)<textarea name="notes" rows="2">${esc(checkoutDraft.notes)}</textarea></label>

          <dl class="totals">
            <dt>Subtotal</dt><dd>${money(t.subtotal)}</dd>
            <dt>Delivery</dt><dd>${t.delivery.price ? money(t.delivery.price) : "Free"}</dd>
            <dt class="grand">Total</dt><dd class="grand">${money(t.total)}</dd>
          </dl>
          <p class="form-error" id="form-error" role="alert"></p>
          <button class="btn btn-lg btn-block" type="submit">Place order</button>
          <p class="muted small">${esc(CFG.paymentNote)}</p>
        </form>
      </div>
    </section>`;
  }

  function orderText(ref, d, t) {
    const lines = t.lines.map(({ l, r, total }) => `• ${l.qty} × ${r.name}${l.type === "plant" && l.card && CFG.careCardWithPlant === "addon" ? " + care card" : ""} = ${money(total)}`);
    return [
      `Hi Rooted Botanica! 🌱 New order ${ref}`,
      "",
      ...lines,
      "",
      `Subtotal: ${money(t.subtotal)}`,
      `Delivery: ${t.delivery.label} (${t.delivery.price ? money(t.delivery.price) : "free"})`,
      `TOTAL: ${money(t.total)}`,
      "",
      `Name: ${d.name}`,
      `Cell: ${d.phone}`,
      d.email ? `Email: ${d.email}` : null,
      d.address ? `Address: ${d.address}` : null,
      d.notes ? `Notes: ${d.notes}` : null,
    ]
      .filter((x) => x !== null)
      .join("\n");
  }

  function renderOrderPlaced(ref, d) {
    const t = cartTotals(d.delivery);
    const text = orderText(ref, d, t);
    const wa = CFG.whatsappNumber ? `https://wa.me/${CFG.whatsappNumber}?text=${encodeURIComponent(text)}` : "";
    const mail = CFG.orderEmail ? `mailto:${CFG.orderEmail}?subject=${encodeURIComponent("Rooted Botanica order " + ref)}&body=${encodeURIComponent(text)}` : "";
    main.innerHTML = `<section class="wrap section narrow-page">
      <h1 class="page-title">Almost done — send us your order</h1>
      <p class="lede">Your order number is <strong>${esc(ref)}</strong>. Tap a button below to send it to us. We'll check your plants and reply with payment details.</p>
      <div class="send-row">
        ${wa ? `<a class="btn btn-lg btn-wa" href="${esc(wa)}" target="_blank" rel="noopener">Send on WhatsApp</a>` : ""}
        ${mail ? `<a class="btn btn-lg" href="${esc(mail)}">Send by email</a>` : ""}
        ${CFG.paymentLink ? `<a class="btn btn-lg btn-ghost" href="${esc(CFG.paymentLink)}" target="_blank" rel="noopener">Pay ${money(t.total)} now</a>` : ""}
      </div>
      ${!wa && !mail ? `<p class="form-error">The shop's WhatsApp number and email haven't been set up yet (see config.js). Copy your order below instead.</p>` : ""}
      <pre class="order-text" id="order-text">${esc(text)}</pre>
      <div class="send-row">
        <button class="btn btn-ghost" id="copy-order">Copy order</button>
        <button class="btn btn-ghost" id="done-order">I've sent it — clear my cart</button>
      </div>
    </section>`;
    document.getElementById("copy-order").onclick = () => {
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject())
        .then(() => toast("Order copied"))
        .catch(() => toast("Select the text above to copy it"));
    };
    document.getElementById("done-order").onclick = () => {
      cart = [];
      saveCart();
      checkoutDraft = { delivery: CFG.delivery[0].id };
      main.innerHTML = `<section class="wrap section narrow-page"><h1 class="page-title">Thank you! 💚</h1><p class="lede">We'll be in touch soon about order <strong>${esc(ref)}</strong>.</p><a class="btn" href="#/shop">Back to the shop</a></section>`;
      window.scrollTo(0, 0);
    };
    window.scrollTo(0, 0);
  }

  /* ---------- router ---------- */
  function route() {
    const hash = location.hash.replace(/^#/, "") || "/";
    const [path, qs] = hash.split("?");
    const params = new URLSearchParams(qs || "");
    const parts = path.split("/").filter(Boolean);
    let html;
    let title = "Rooted Botanica — Carnivorous Plants South Africa";
    switch (parts[0]) {
      case undefined: html = pageHome(); break;
      case "shop": html = pageShop(params); title = "Shop — Rooted Botanica"; break;
      case "plant": { html = pagePlant(parts[1]); const p = byId(parts[1]); if (p) title = p.name + " — Rooted Botanica"; break; }
      case "care-cards": html = pageCareCards(); title = "Care cards — Rooted Botanica"; break;
      case "care": html = pageCare(); title = "Plant care — Rooted Botanica"; break;
      case "about": html = pageAbout(); title = "About — Rooted Botanica"; break;
      case "cart": html = pageCart(); title = "Cart — Rooted Botanica"; break;
      case "delivery": html = pageDelivery(); break;
      case "privacy": html = pagePrivacy(); break;
      default: html = pageNotFound();
    }
    document.title = title;
    main.innerHTML = html;
    document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === parts[0]));
    if (!route.first) window.scrollTo(0, 0);
    route.first = false;
  }
  route.first = true;

  /* ---------- events (delegated) ---------- */
  document.addEventListener("submit", (e) => {
    const f = e.target;
    if (f.matches("[data-search]")) {
      e.preventDefault();
      const q = f.q.value.trim();
      location.hash = q ? "#/shop?q=" + encodeURIComponent(q) : "#/shop";
    }
    if (f.id === "checkout") {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(f).entries());
      checkoutDraft = d;
      const err = document.getElementById("form-error");
      const needsAddr = d.delivery !== "collect";
      if (!d.name.trim() || !d.phone.trim()) return (err.textContent = "Please add your name and cell number.");
      if (!/^[+\d][\d\s()-]{8,}$/.test(d.phone.trim())) return (err.textContent = "Please check your cell number.");
      if (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) return (err.textContent = "Please check your email address.");
      if (needsAddr && !d.address.trim()) return (err.textContent = "Please add your delivery address or PUDO locker.");
      const ref = "RB-" + new Date().toISOString().slice(2, 10).replace(/-/g, "") + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      renderOrderPlaced(ref, d);
    }
  });

  document.addEventListener("input", (e) => {
    const f = e.target.form;
    if (f && f.id === "checkout") checkoutDraft = Object.fromEntries(new FormData(f).entries());
  });

  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.name === "delivery" && el.form && el.form.id === "checkout") {
      checkoutDraft = Object.fromEntries(new FormData(el.form).entries());
      route();
    }
    if (el.dataset.cardLine !== undefined) {
      cart[+el.dataset.cardLine].card = el.checked;
      saveCart();
      route();
    }
  });

  document.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.addCard) addToCart({ type: "card", id: t.dataset.addCard }, 1);
    if (t.dataset.qty) {
      const q = document.getElementById("qty");
      q.value = Math.max(1, (parseInt(q.value, 10) || 1) + +t.dataset.qty);
    }
    if (t.id === "add-plant") {
      const size = document.querySelector('input[name="size"]:checked');
      if (!size) return toast("Pick a size first");
      const qty = Math.max(1, parseInt(document.getElementById("qty").value, 10) || 1);
      const card = !!(document.getElementById("add-card") || {}).checked;
      addToCart({ type: "plant", id: t.dataset.id, size: size.value, card }, qty);
    }
    if (t.classList.contains("thumb")) {
      document.querySelectorAll(".thumb").forEach((b) => b.classList.toggle("on", b === t));
      const img = document.querySelector("#gallery-main img");
      if (img) img.src = t.dataset.src;
    }
    if (t.dataset.step) {
      const i = +t.dataset.line;
      const r = resolveLine(cart[i]);
      cart[i].qty = Math.min(r ? r.stock : 0, cart[i].qty + +t.dataset.step);
      if (cart[i].qty <= 0) cart.splice(i, 1);
      saveCart();
      route();
    }
    if (t.dataset.remove !== undefined) {
      cart.splice(+t.dataset.remove, 1);
      saveCart();
      route();
    }
  });

  /* ---------- init ---------- */
  // Drop cart lines whose product/size no longer exists, and cap to current stock.
  cart = cart.filter((l) => {
    const r = resolveLine(l);
    if (!r || r.stock <= 0) return false;
    l.qty = Math.min(l.qty, r.stock);
    return l.qty > 0;
  });
  saveCart();

  const ICONS = {
    instagram: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24"><path d="M14 3v11.5a3.5 3.5 0 1 1-3-3.46" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14 3c.5 2.8 2.3 4.5 5 4.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    facebook: '<svg viewBox="0 0 24 24"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v7h4v-7h3l1-4h-4V8z" fill="currentColor"/></svg>',
    youtube: '<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 9l5 3-5 3z" fill="currentColor"/></svg>',
  };
  const soc = Object.entries(CFG.socials).filter(([, url]) => url);
  document.getElementById("socials").innerHTML = soc.length
    ? soc.map(([k, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${k}">${ICONS[k] || k}</a>`).join("")
    : `<p class="muted small">Socials coming soon</p>`;
  document.getElementById("year").textContent = new Date().getFullYear();

  window.addEventListener("hashchange", route);
  route();
  updateCartCount();
})();

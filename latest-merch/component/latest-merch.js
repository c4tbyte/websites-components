const MERCH_TEMPLATE = document.createElement("template");
MERCH_TEMPLATE.innerHTML = `
<style>
  :host {
    --lm-bg: #0a0a0a;
    --lm-fg: #ffffff;
    --lm-muted: #888888;
    --lm-font-heading: 'Arial Narrow', 'Helvetica Neue', sans-serif;
    --lm-font-body: 'Arial Narrow', 'Helvetica Neue', sans-serif;
    --lr-font-weight-body: 400;
    --lm-label-tracking: 0.12em;
    --lm-card-gap: 20px;
    --lm-image-radius: 0px;
    --lm-button-align: center;
    --lm-button-bg: transparent;
    --lm-button-fg: var(--lm-fg);
    --lm-button-border: var(--lm-fg);
    --lm-button-radius: 0px;
    --lm-columns: 4;

    display: flex;
    flex-direction: column;
    min-height: 440px;
    background: var(--lm-bg);
    color: var(--lm-fg);
    font-family: var(--lm-font-body);
    padding: 28px;
    box-sizing: border-box;
  }

  * { box-sizing: border-box; }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .header h2 {
    margin: 0;
    font-family: var(--lm-font-heading);
    font-size: 32px;
    font-weight: 700;
    letter-spacing: var(--lm-label-tracking);
    text-transform: uppercase;
  }

  .nav-arrows {
    display: flex;
    gap: 10px;
  }

  .nav-arrows button {
    background: none;
    border: 1px solid var(--lm-fg);
    color: var(--lm-fg);
    cursor: pointer;
    font-size: 16px;
    padding: 6px 14px;
    opacity: 0.7;
    line-height: 1;
  }

  .nav-arrows button:hover { opacity: 1; }
  .nav-arrows button:disabled { opacity: 0.25; cursor: default; }

  .grid {
    display: grid;
    grid-template-columns: repeat(var(--lm-columns), 1fr);
    gap: var(--lm-card-gap);
    flex: 1;
    align-content: start;
    touch-action: pan-y;
    transition: transform 0.25s ease;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .card img {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    border-radius: var(--lm-image-radius);
    background: #000;
    display: block;
  }

  .card a.card-link {
    color: inherit;
    text-decoration: none;
  }

  .card .product-title {
    font-family: var(--lm-font-heading);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.3;
  }

  .card .product-meta {
    font-family: var(--lm-font-body);
    font-size: 11px;
    font-weight: var(--lr-font-weight-body);
    color: var(--lm-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .footer {
    display: flex;
    margin-top: 26px;
    justify-content: var(--lm-button-align);
  }

  .view-all {
    font-family: var(--lm-font-heading);
    font-size: 16px;
    letter-spacing: var(--lm-label-tracking);
    text-transform: uppercase;
    background: var(--lm-button-bg);
    color: var(--lm-button-fg);
    border: 1px solid var(--lm-button-border);
    border-radius: var(--lm-button-radius);
    padding: 14px 28px;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
  }

  .view-all:hover { opacity: 0.85; }

  .state-message {
    font-size: 13px;
    color: var(--lm-muted);
    padding: 30px 0;
    text-align: center;
  }

  @media (max-width: 700px) {
    .grid { grid-template-columns: repeat(2, 1fr); }
  }
</style>

<div class="header">
  <h2 part="title"></h2>
  <div class="nav-arrows" hidden>
    <button class="prev" aria-label="Previous category">&#8249;</button>
    <button class="next" aria-label="Next category">&#8250;</button>
  </div>
</div>

<div class="grid"></div>

<div class="footer">
  <a class="view-all" href="#"></a>
</div>
`;

class LatestMerch extends HTMLElement {
  static get observedAttributes() {
    return [
      "api-endpoint",
      "store-url",
      "categories",
      "title",
      "view-all-text",
      "view-all-url",
      "button-position",
      "columns",
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(MERCH_TEMPLATE.content.cloneNode(true));
    this._pages = [];
    this._page = 0;
  }

  connectedCallback() {
    this._render();
    this._loadData();
    this._setupSwipe();

    if (!this._resizeListenerAttached) {
      this._resizeListenerAttached = true;
      window.addEventListener("resize", () => {
        this.shadowRoot.host.style.setProperty("--lm-columns", String(this.columns));
        this._rebuildPages();
      });
    }
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this._render();
      this._loadData();
    }
  }

  get apiEndpoint() { return this.getAttribute("api-endpoint"); }
  get storeUrl() { return (this.getAttribute("store-url") || "").replace(/\/$/, ""); }

  get categoryList() {
    return (this.getAttribute("categories") || "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }

  get columns() {
    if (window.matchMedia("(max-width: 700px)").matches) return 2;
    return Number(this.getAttribute("columns") || 4);
  }

  get rows() {
    if (window.matchMedia("(max-width: 700px)").matches) return 3;
    return 1;
  }

  get perPage() {
    return this.columns * this.rows;
  }

  get titleText() { return this.getAttribute("title") || "Merch"; }
  get viewAllText() { return this.getAttribute("view-all-text") || "View All Merch"; }

  _render() {
    const root = this.shadowRoot;
    root.querySelector("h2").textContent = this.titleText;
    root.host.style.setProperty("--lm-columns", String(this.columns));

    const buttonPosition = this.getAttribute("button-position") || "center";
    root.host.style.setProperty("--lm-button-align", buttonPosition);

    const viewAllLink = root.querySelector(".view-all");
    viewAllLink.textContent = this.viewAllText;
    viewAllLink.href = this.getAttribute("view-all-url") || "#";
  }

  async _loadData() {
    const grid = this.shadowRoot.querySelector(".grid");
    const arrowsWrap = this.shadowRoot.querySelector(".nav-arrows");

    if (!this.apiEndpoint || this.categoryList.length === 0) {
      grid.innerHTML = `<div class="state-message">Set api-endpoint and categories to load merch.</div>`;
      return;
    }

    grid.innerHTML = `<div class="state-message">Loading merch…</div>`;

    try {
      const response = await fetch(this.apiEndpoint);
      if (!response.ok) throw new Error(`Server responded ${response.status}`);
      const allProducts = await response.json();

      const seenIds = new Set();
      const flatList = [];

      this.categoryList.forEach((categoryName) => {
        const matches = allProducts.filter(
          (p) =>
            p.status === "active" &&
            !seenIds.has(p.id) &&
            Array.isArray(p.categories) &&
            p.categories.some((c) => c.name === categoryName)
        );
        matches.forEach((p) => {
          seenIds.add(p.id);
          flatList.push(p);
        });
      });

      this._flatList = flatList;
      this._rebuildPages();
    } catch (err) {
      console.error("[latest-merch] failed to load:", err);
      grid.innerHTML = `<div class="state-message">Couldn't load merch right now.</div>`;
      arrowsWrap.hidden = true;
    }
  }

  _rebuildPages() {
    const flatList = this._flatList || [];
    const perPage = this.perPage;

    this._pages = [];
    for (let i = 0; i < flatList.length; i += perPage) {
      this._pages.push(flatList.slice(i, i + perPage));
    }

    this._page = 0;
    this._renderPage();
  }

  _renderPage() {
    const grid = this.shadowRoot.querySelector(".grid");
    const arrowsWrap = this.shadowRoot.querySelector(".nav-arrows");

    if (this._pages.length === 0) {
      grid.innerHTML = `<div class="state-message">No merch found yet.</div>`;
      arrowsWrap.hidden = true;
      return;
    }

    const totalPages = this._pages.length;
    arrowsWrap.hidden = !(totalPages > 1);

    const pageItems = this._pages[this._page];

    grid.innerHTML = pageItems
      .map((p) => {
        const image = p.images?.[0]?.url || "";
        const price = this._formatPrice(p);
        const link = `${this.storeUrl}${p.url}`;
        return `
          <div class="card">
            <a class="card-link" href="${link}" target="_blank" rel="noopener">
              <img src="${image}" alt="${this._escape(p.name)}" loading="lazy" />
              <div class="product-title">${this._escape(p.name)}</div>
              <div class="product-meta">${price}</div>
            </a>
          </div>
        `;
      })
      .join("");

    if (totalPages > 1) {
      const prevBtn = this.shadowRoot.querySelector(".prev");
      const nextBtn = this.shadowRoot.querySelector(".next");
      prevBtn.disabled = this._page === 0;
      nextBtn.disabled = this._page >= totalPages - 1;
      prevBtn.onclick = () => this._goToPage(this._page - 1);
      nextBtn.onclick = () => this._goToPage(this._page + 1);
    }
  }

  _goToPage(page) {
    if (page < 0 || page >= this._pages.length) return;
    this._page = page;
    this._renderPage();
  }

_totalPages() {
  return this._pages.length;
}
  
 _setupSwipe() {
  const grid = this.shadowRoot.querySelector(".grid");
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let dragging = false;
  let horizontal = null;

  grid.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    currentX = startX;
    dragging = true;
    horizontal = null;
    grid.style.transition = "none";
  }, { passive: true });

  grid.addEventListener("touchmove", (e) => {
    if (!dragging) return;
    currentX = e.touches[0].clientX;
    const dx = currentX - startX;
    const dy = e.touches[0].clientY - startY;

    if (horizontal === null) {
      horizontal = Math.abs(dx) > Math.abs(dy);
    }
    if (!horizontal) return;

    const atStart = this._page === 0;
    const atEnd = this._page >= this._totalPages() - 1;
    const resisted = (atStart && dx > 0) || (atEnd && dx < 0) ? dx * 0.35 : dx;
    grid.style.transform = `translateX(${resisted}px)`;
  }, { passive: true });

  grid.addEventListener("touchend", () => {
    if (!dragging) return;
    dragging = false;
    const dx = currentX - startX;
    grid.style.transition = "transform 0.25s ease";

    if (horizontal && Math.abs(dx) > 50) {
      const dir = dx < 0 ? 1 : -1;
      const width = grid.clientWidth;
      grid.style.transform = `translateX(${-dir * width}px)`;

      setTimeout(() => {
        grid.style.transition = "none";
        grid.style.transform = `translateX(${dir * width}px)`;
        this._goToPage(this._page + dir);
        requestAnimationFrame(() => {
          grid.style.transition = "transform 0.25s ease";
          grid.style.transform = "translateX(0)";
        });
      }, 250);
    } else {
      grid.style.transform = "translateX(0)";
    }
  });
}

  _formatPrice(product) {
    const prices = (product.options || []).map((o) => o.price);
    const min = prices.length ? Math.min(...prices) : product.price;
    const max = prices.length ? Math.max(...prices) : product.price;
    const fmt = (n) => `$${Number(n).toFixed(2)}`;
    return min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`;
  }

  _escape(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
}

customElements.define("latest-merch", LatestMerch);

/**
 * <latest-merch> — a reusable Web Component
 * ===========================================
 * Same visual pattern as <latest-releases>, but backed by Big Cartel's
 * public V0 API instead of Spotify. No backend needed — Big Cartel's
 * product feed is public and allows direct browser requests (confirmed
 * via CORS test), so this component fetches straight from Big Cartel.
 *
 * PAGINATION MODEL — different from <latest-releases>:
 * Each "page" (each arrow click) shows one CATEGORY's first N products,
 * not just the next N items in one flat list. The category names and
 * their order are entirely controlled by the `categories` attribute —
 * nothing category-specific is hardcoded here, since category names
 * differ from store to store.
 *
 * USAGE:
 * <script src="latest-merch.js"></script>
 * <latest-merch
 *   api-endpoint="https://api.bigcartel.com/YOUR_SUBDOMAIN/products.json"
 *   store-url="https://YOUR_SUBDOMAIN.bigcartel.com"
 *   categories="Merch,CD,Vinyl,Tapes"
 *   title="Merch"
 *   view-all-text="View All Merch"
 *   view-all-url="https://YOUR_SUBDOMAIN.bigcartel.com"
 *   columns="4"
 * ></latest-merch>
 *
 * THEMING: same CSS variable pattern as latest-releases — override from
 * outside the component to reskin per site.
 */

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
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this._render();
      this._loadData();
    }
  }

  // ---- Config readers — everything site-specific comes from attributes ----
  get apiEndpoint() { return this.getAttribute("api-endpoint"); }
  get storeUrl() { return (this.getAttribute("store-url") || "").replace(/\/$/, ""); }
  get categoryList() {
    return (this.getAttribute("categories") || "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }
  get columns() { return Number(this.getAttribute("columns") || 4); }
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

      this._pages = [];
      for (let i = 0; i < flatList.length; i += this.columns) {
        this._pages.push(flatList.slice(i, i + this.columns));
      }

      this._page = 0;
      this._renderPage();
    } catch (err) {
      console.error("[latest-merch] failed to load:", err);
      grid.innerHTML = `<div class="state-message">Couldn't load merch right now.</div>`;
      arrowsWrap.hidden = true;
    }
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
    const showArrows = totalPages > 1;
    arrowsWrap.hidden = !showArrows;

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
      </div>`;
      })
      .join("");

    if (showArrows) {
      const prevBtn = this.shadowRoot.querySelector(".prev");
      const nextBtn = this.shadowRoot.querySelector(".next");
      prevBtn.disabled = this._page === 0;
      nextBtn.disabled = this._page >= totalPages - 1;
      prevBtn.onclick = () => { if (this._page > 0) { this._page--; this._renderPage(); } };
      nextBtn.onclick = () => { if (this._page < totalPages - 1) { this._page++; this._renderPage(); } };
    }
  }

  // Products can have different prices per option (e.g. sizes). Show the
  // base price, and indicate a range if options actually vary in price.
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

const TEMPLATE = document.createElement("template");
TEMPLATE.innerHTML = `
<style>
  :host {
    --ag-bg: #0a0a0a;
    --ag-fg: #ffffff;
    --ag-muted: #888888;
    --ag-font-heading: 'Arial Narrow', 'Helvetica Neue', sans-serif;
    --ag-font-body: 'Arial Narrow', 'Helvetica Neue', sans-serif;
    --ag-label-tracking: 0.12em;
    --ag-card-gap: 28px;
    --ag-image-ratio: 3 / 2;
    --ag-image-radius: 0px;
    --ag-button-bg: transparent;
    --ag-button-fg: var(--ag-fg);
    --ag-button-border: var(--ag-fg);
    --ag-button-radius: 0px;
    --ag-columns: 4;

    display: block;
    background: var(--ag-bg);
    color: var(--ag-fg);
    font-family: var(--ag-font-body);
    padding: 28px;
    box-sizing: border-box;
  }

  * { box-sizing: border-box; }

  .header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
  }

  .header-spacer { }

  .header h2 {
    margin: 0;
    font-family: var(--ag-font-heading);
    font-size: 24px;
    font-weight: 700;
    letter-spacing: var(--ag-label-tracking);
    text-transform: uppercase;
    text-align: center;
  }

  .nav-arrows {
    display: flex;
    gap: 10px;
    justify-self: end;
  }
  .nav-arrows[hidden] { display: none; }

  .nav-arrows button {
    background: none;
    border: 1px solid var(--ag-fg);
    color: var(--ag-fg);
    cursor: pointer;
    font-size: 16px;
    padding: 6px 14px;
    opacity: 0.7;
    line-height: 1;
  }

  .nav-arrows button:hover { opacity: 1; }
  .nav-arrows button:disabled { opacity: 0.25; cursor: default; }

  .footer {
    display: flex;
    justify-content: center;
    margin-top: 26px;
  }

  .view-all {
    font-family: var(--ag-font-heading);
    font-size: 16px;
    letter-spacing: var(--ag-label-tracking);
    text-transform: uppercase;
    background: var(--ag-button-bg);
    color: var(--ag-button-fg);
    border: 1px solid var(--ag-button-border);
    border-radius: var(--ag-button-radius);
    padding: 14px 28px;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
  }

  .view-all:hover {
    opacity: 0.85;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(var(--ag-columns), 1fr);
    gap: var(--ag-card-gap);
    touch-action: pan-y;
    transition: transform 0.25s ease;
  }

  @media (max-width: 900px) {
    .grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 480px) {
    .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .card { min-width: 0; }
  }

  .card {
    color: var(--ag-fg);
    text-decoration: none;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .photo-wrap {
    display: block;
    aspect-ratio: var(--ag-image-ratio);
    overflow: hidden;
    border: 1px solid var(--ag-fg);
    border-radius: var(--ag-image-radius);
  }

  .photo-wrap.placeholder {
    border: 1px solid rgba(255, 255, 255, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.02);
  }

  .photo-wrap.placeholder span {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: var(--ag-label-tracking);
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.25);
  }

  .photo-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(100%) contrast(1.05);
    transition: transform 0.25s ease, filter 0.25s ease;
    display: block;
  }

  .card:hover .photo-wrap img,
  .card:focus-visible .photo-wrap img {
    transform: scale(1.04);
    filter: grayscale(60%) contrast(1.1);
  }

  .name {
    margin-top: 12px;
    font-family: var(--ag-font-heading);
    font-weight: 700;
    letter-spacing: var(--ag-label-tracking);
    text-transform: uppercase;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    max-width: 100%;
  }

  .name.wraps {
    white-space: normal;
  }

  .name.placeholder {
    color: rgba(255, 255, 255, 0.25);
  }

  .state-message {
    color: var(--ag-muted);
    font-size: 13px;
    grid-column: 1 / -1;
  }

  .placeholder-message {
    color: var(--ag-muted);
    font-size: 13px;
    margin-bottom: 16px;
  }
</style>

<div class="header">
  <div class="header-spacer"></div>
  <h2></h2>
  <div class="nav-arrows" hidden>
    <button class="prev" aria-label="Previous artists">&#8249;</button>
    <button class="next" aria-label="Next artists">&#8250;</button>
  </div>
</div>

<p class="placeholder-message" hidden>No artists linked yet.</p>

<div class="grid"></div>

<div class="footer"><a class="view-all"></a></div>
`;

class ArtistsGallery extends HTMLElement {
  static get observedAttributes() {
    return [
      "api-endpoint",
      "title",
      "view-all-text",
      "view-all-url",
      "artist-url-base",
      "columns",
      "rows",
    ];
  }

  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.appendChild(TEMPLATE.content.cloneNode(true));
    this._allArtists = [];
    this._page = 0;
  }

  get apiEndpoint() { return this.getAttribute("api-endpoint") || ""; }
  get pageTitle() { return this.getAttribute("title") || "Artists"; }
  get viewAllText() { return this.getAttribute("view-all-text") || "View All Artists"; }
  get viewAllUrl() { return this.getAttribute("view-all-url") || "#"; }
  get artistUrlBase() { return this.getAttribute("artist-url-base") || "/artists"; }

  get columns() {
    if (window.matchMedia("(max-width: 480px)").matches) return 2;
    return Number(this.getAttribute("columns")) || 4;
  }

  get rows() {
    if (window.matchMedia("(max-width: 480px)").matches) return 2;
    return Number(this.getAttribute("rows")) || 2;
  }

  get perPage() {
    return this.columns * this.rows;
  }

  connectedCallback() {
    const root = this.shadowRoot;
    root.host.style.setProperty("--ag-columns", String(this.columns));

    root.querySelector(".header h2").textContent = this.pageTitle;
    const viewAllEl = root.querySelector(".view-all");
    viewAllEl.textContent = this.viewAllText;
    viewAllEl.href = this.viewAllUrl;

    const prevBtn = root.querySelector(".prev");
    const nextBtn = root.querySelector(".next");
    prevBtn.onclick = () => this._goToPage(this._page - 1);
    nextBtn.onclick = () => this._goToPage(this._page + 1);

    this._loadData();
    this._setupSwipe();

    if (!this._resizeListenerAttached) {
      this._resizeListenerAttached = true;
      window.addEventListener("resize", () => {
        this._page = 0;
        root.host.style.setProperty("--ag-columns", String(this.columns));
        if (this._allArtists.length > 0) {
          this._renderPage();
        } else {
          this._renderPlaceholders();
        }
      });
    }
  }

  attributeChangedCallback() {
    if (this.shadowRoot && this.shadowRoot.host.isConnected) {
      this.connectedCallback();
    }
  }

  async _loadData() {
    const grid = this.shadowRoot.querySelector(".grid");

    if (!this.apiEndpoint || this.apiEndpoint === "PASTE_YOUR_ARTISTS_API_URL") {
      this._allArtists = [];
      this._renderPlaceholders();
      return;
    }

    grid.innerHTML = `<div class="state-message">Loading artists…</div>`;

    try {
      const response = await fetch(this.apiEndpoint);
      if (!response.ok) throw new Error(`Server responded ${response.status}`);
      const artists = await response.json();

      if (!Array.isArray(artists) || artists.length === 0) {
        grid.innerHTML = `<div class="state-message">No artists found.</div>`;
        this._toggleArrows(false);
        return;
      }

      this._allArtists = artists;
      this._page = 0;
      this._renderPage();
    } catch (err) {
      console.error("artists-gallery: failed to load artists", err);
      this._allArtists = [];
      this._renderPlaceholders();
    }
  }

  _renderPage() {
    const root = this.shadowRoot;
    const grid = root.querySelector(".grid");
    root.querySelector(".placeholder-message").hidden = true;
    const perPage = this.perPage;
    const totalPages = Math.max(1, Math.ceil(this._allArtists.length / perPage));

    this._toggleArrows(totalPages > 1);

    const start = this._page * perPage;
    const pageItems = this._allArtists.slice(start, start + perPage);

    grid.innerHTML = "";
    pageItems.forEach((artist) => {
      const card = document.createElement("a");
      card.className = "card";
      card.href = `${this.artistUrlBase}/${artist.slug}`;

      card.innerHTML = `
        <span class="photo-wrap">
          <img src="${artist.imageUrl}" alt="${artist.name}" loading="lazy" />
        </span>
        <span class="name">${artist.name}</span>
      `;

      grid.appendChild(card);
    });

    requestAnimationFrame(() => this._fitNames());
  }

  _fitNames() {
    const names = this.shadowRoot.querySelectorAll(".name");
    names.forEach((el) => {
      const text = el.textContent.trim();
      const hasMultipleWords = text.includes(" ");

      if (hasMultipleWords) {
        el.classList.add("wraps");
        el.style.fontSize = "";
        return;
      }

      el.classList.remove("wraps");
      let fontSize = 18;
      el.style.fontSize = fontSize + "px";

      while (el.scrollWidth > el.clientWidth && fontSize > 10) {
        fontSize -= 1;
        el.style.fontSize = fontSize + "px";
      }
    });
  }

  _goToPage(page) {
    if (this._allArtists.length === 0) return;
    const totalPages = Math.max(1, Math.ceil(this._allArtists.length / this.perPage));
    if (page < 0) page = totalPages - 1;
    if (page >= totalPages) page = 0;
    this._page = page;
    this._renderPage();
  }

  _totalPages() {
    return Math.max(1, Math.ceil(this._allArtists.length / this.perPage));
  }

  _toggleArrows(show) {
    const arrows = this.shadowRoot.querySelector(".nav-arrows");
    arrows.hidden = !show;
  }

  _renderPlaceholders() {
    const root = this.shadowRoot;
    const grid = root.querySelector(".grid");
    grid.innerHTML = "";
    this._toggleArrows(false);
    root.querySelector(".placeholder-message").hidden = false;

    const count = this.perPage;
    for (let i = 0; i < count; i++) {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <span class="photo-wrap placeholder"><span>Artist</span></span>
        <span class="name placeholder">Artist</span>
      `;
      grid.appendChild(card);
    }
  }

  _setupSwipe() {
    const grid = this.shadowRoot.querySelector(".grid");
    if (grid._swipeAttached) return;
    grid._swipeAttached = true;

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
}

customElements.define("artists-gallery", ArtistsGallery);

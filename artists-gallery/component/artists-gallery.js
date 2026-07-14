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
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 16px;
    }

    .header h2 {
      margin: 0;
      font-family: var(--ag-font-heading);
      font-size: 24px;
      font-weight: 700;
      letter-spacing: var(--ag-label-tracking);
      text-transform: uppercase;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .nav-arrows { display: flex; gap: 10px; }
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
    }

    @media (max-width: 900px) {
      .grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 480px) {
      .grid { grid-template-columns: 1fr; }
    }

    .card {
      color: var(--ag-fg);
      text-decoration: none;
      display: flex;
      flex-direction: column;
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
      font-size: 18px;
      font-weight: 700;
      letter-spacing: var(--ag-label-tracking);
      text-transform: uppercase;
      text-align: center;
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
    <h2></h2>
    <div class="header-actions">
      <div class="nav-arrows" hidden>
        <button class="prev" aria-label="Previous artists">&#8249;</button>
        <button class="next" aria-label="Next artists">&#8250;</button>
      </div>
      <a class="view-all"></a>
    </div>
  </div>

  <p class="placeholder-message" hidden>No artists linked yet.</p>

  <div class="grid"></div>
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

  get apiEndpoint() {
    return this.getAttribute("api-endpoint") || "";
  }

  get pageTitle() {
    return this.getAttribute("title") || "Artists";
  }

  get viewAllText() {
    return this.getAttribute("view-all-text") || "View All Artists";
  }

  get viewAllUrl() {
    return this.getAttribute("view-all-url") || "#";
  }

  get artistUrlBase() {
    return this.getAttribute("artist-url-base") || "/artists";
  }

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
    prevBtn.onclick = () => {
      if (this._allArtists.length === 0) return;
      const totalPages = Math.max(1, Math.ceil(this._allArtists.length / this.perPage));
      this._page = (this._page - 1 + totalPages) % totalPages;
      this._renderPage();
    };
    nextBtn.onclick = () => {
      if (this._allArtists.length === 0) return;
      const totalPages = Math.max(1, Math.ceil(this._allArtists.length / this.perPage));
      this._page = (this._page + 1) % totalPages;
      this._renderPage();
    };

    this._loadData();
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
}

customElements.define("artists-gallery", ArtistsGallery);

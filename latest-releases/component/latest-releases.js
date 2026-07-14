const RELEASES_TEMPLATE = document.createElement("template");
RELEASES_TEMPLATE.innerHTML = `
  <style>
    :host {
      --lr-bg: #0a0a0a;
      --lr-fg: #ffffff;
      --lr-muted: #888888;
      --lr-font-heading: 'Arial Narrow', 'Helvetica Neue', sans-serif;
      --lr-font-body: 'Arial Narrow', 'Helvetica Neue', sans-serif;
      --lr-font-weight-body: 400;
      --lr-label-tracking: 0.12em;
      --lr-card-gap: 20px;
      --lr-image-radius: 0px;
      --lr-button-align: center;
      --lr-button-bg: transparent;
      --lr-button-fg: var(--lr-fg);
      --lr-button-border: var(--lr-fg);
      --lr-button-radius: 0px;
      --lr-columns: 4;
      display: flex;
      flex-direction: column;
      min-height: 440px;
      background: var(--lr-bg);
      color: var(--lr-fg);
      font-family: var(--lr-font-body);
      padding: 28px;
      box-sizing: border-box;
    }
    * { box-sizing: border-box; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .header h2 { margin: 0; font-family: var(--lr-font-heading); font-size: 32px; font-weight: 700; letter-spacing: var(--lr-label-tracking); text-transform: uppercase; }
    .nav-arrows { display: flex; gap: 10px; }
    .nav-arrows button { background: none; border: 1px solid var(--lr-fg); color: var(--lr-fg); cursor: pointer; font-size: 16px; padding: 6px 14px; opacity: 0.7; line-height: 1; }
    .nav-arrows button:hover { opacity: 1; }
    .nav-arrows button:disabled { opacity: 0.25; cursor: default; }
    .grid {
      display: grid;
      grid-template-columns: repeat(var(--lr-columns), 1fr);
      gap: var(--lr-card-gap);
      flex: 1;
      align-content: start;
    }
    .card { display: flex; flex-direction: column; gap: 8px; }
    .card img { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; border-radius: var(--lr-image-radius); background: #000; display: block; }
    .card a.card-link { color: inherit; text-decoration: none; }
    .card .release-title { font-family: var(--lr-font-heading); font-size: 13px; font-weight: 600; line-height: 1.3; }
    .card .release-meta { font-family: var(--lr-font-body); font-size: 11px; font-weight: var(--lr-font-weight-body); color: var(--lr-muted); text-transform: uppercase; letter-spacing: 0.04em; }
    .card .release-name {
      font-family: var(--lr-font-body);
      font-size: 11px;
      font-weight: var(--lr-font-weight-body);
      color: var(--lr-muted);
      line-height: 1.3;
    }
    .footer {
      display: flex;
      margin-top: 26px;
      justify-content: var(--lr-button-align);
      min-height: 48px;
      align-items: center;
    }
    .view-all { font-family: var(--lr-font-heading);
      font-size: 16px;
      letter-spacing: var(--lr-label-tracking);
      text-transform: uppercase;
      background: var(--lr-button-bg);
      color: var(--lr-button-fg);
      border: 1px solid var(--lr-button-border);
      border-radius: var(--lr-button-radius);
      padding: 14px 28px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
    }
    .state-message { font-size: 13px; color: var(--lr-muted); padding: 30px 0; text-align: center; }
    @media (max-width: 700px) { .grid { grid-template-columns: repeat(2, 1fr); } }
  </style>
  <div class="header">
  <h2 part="title"></h2>
  <div class="nav-arrows" hidden>
  <button class="prev" aria-label="Previous releases">&#8249;</button>
  <button class="next" aria-label="Next releases">&#8250;</button>
  </div>
  </div>
  <div class="grid"></div>
  <div class="footer"><a class="view-all" href="#"></a></div>
`;

class LatestReleases extends HTMLElement {
  static get observedAttributes() {
    return ["api-endpoint", "artist-ids", "limit", "title", "view-all-text", "view-all-url", "button-position", "columns"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(RELEASES_TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this._render();
    this._loadData();
  }

  get apiEndpoint() { return this.getAttribute("api-endpoint"); }
  get artistIds() { return this.getAttribute("artist-ids") || ""; }
  get limit() { return Number(this.getAttribute("limit") || 8); }
  get pageSize() { return Number(this.getAttribute("columns") || 4); }

  _render() {
    const root = this.shadowRoot;
    root.querySelector("h2").textContent = this.getAttribute("title") || "Latest Releases";
    root.host.style.setProperty("--lr-columns", String(this.pageSize));
    const viewAllLink = root.querySelector(".view-all");
    viewAllLink.textContent = this.getAttribute("view-all-text") || "View All Releases";
    viewAllLink.href = this.getAttribute("view-all-url") || "#";
    root.host.style.setProperty("--lr-button-align", this.getAttribute("button-position") || "center");
  }

  async _loadData() {
    const grid = this.shadowRoot.querySelector(".grid");
    const arrowsWrap = this.shadowRoot.querySelector(".nav-arrows");

    if (!this.apiEndpoint) {
      grid.innerHTML = `<div class="state-message">Set api-endpoint to load releases.</div>`;
      return;
    }
    grid.innerHTML = `<div class="state-message">Loading releases…</div>`;

     return; // TEMP: pausing Spotify calls while testing other stuff — remove this line to re-enable

    try {
      const url = `${this.apiEndpoint}?limit=${this.limit}`;
      const response = await fetch(url);
      const data = await response.json();

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      this._allReleases = (data.releases || [])
      .filter((r) => new Date(r.releaseDate) >= oneYearAgo)
      .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));

      this._page = 0;
      this._renderPage();
    } catch (err) {
      console.error("[latest-releases] failed to load:", err);
      grid.innerHTML = `<div class="state-message">Couldn't load releases right now.</div>`;
    }
  }

  _renderPage() {
    const grid = this.shadowRoot.querySelector(".grid");
    const arrowsWrap = this.shadowRoot.querySelector(".nav-arrows");
    const pageSize = this.pageSize;

    if (this._allReleases.length === 0) {
      grid.innerHTML = `<div class="state-message">No releases found yet.</div>`;
      arrowsWrap.hidden = true;
      return;
    }

    const totalPages = Math.ceil(this._allReleases.length / pageSize);
    const showArrows = totalPages > 1;
    arrowsWrap.hidden = !showArrows;

    const start = this._page * pageSize;
    const pageItems = this._allReleases.slice(start, start + pageSize);

    grid.innerHTML = pageItems.map((r) => `
    <div class="card">
    <a class="card-link" href="${r.spotifyUrl}" target="_blank" rel="noopener">
    <img src="${r.image || ""}" alt="${r.title} cover art" />
    <div class="release-title">${r.artistName}</div>
    <div class="release-name">${r.title}</div>
    <div class="release-meta">${r.releaseDate?.slice(0, 4) || ""}</div>
    </a>
    </div>
    `).join("");

    if (showArrows) {
      const prevBtn = this.shadowRoot.querySelector(".prev");
      const nextBtn = this.shadowRoot.querySelector(".next");
      prevBtn.disabled = this._page === 0;
      nextBtn.disabled = this._page >= totalPages - 1;
      prevBtn.onclick = () => { if (this._page > 0) { this._page--; this._renderPage(); } };
      nextBtn.onclick = () => { if (this._page < totalPages - 1) { this._page++; this._renderPage(); } };
    }
  }
}

customElements.define("latest-releases", LatestReleases);

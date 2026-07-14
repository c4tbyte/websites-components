const FOOTER_ICONS = {
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
  facebook: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`,
  twitter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>`,
  youtube: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>`,
  bandcamp: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 17.5h11.5L21 6.5H9.5z"></path></svg>`,
  spotify: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"></circle><path d="M7 10.5c3-1 7-.6 9.5 1"></path><path d="M7.5 13.5c2.3-.7 5.3-.4 7.5.9"></path><path d="M8 16.2c1.8-.5 4-.3 5.7.7"></path></svg>`,
  email: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
};

const FOOTER_TEMPLATE = document.createElement("template");
FOOTER_TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
      --sf-bg: #000000;
      --sf-fg: #ffffff;
      --sf-muted: #a3a3a3;
      --sf-border: #262626;
      --sf-link: #d4d4d4;
      --sf-link-hover: #ffffff;
      --sf-input-bg: #000000;
      --sf-input-border: #404040;
      --sf-input-text: #ffffff;
      --sf-input-placeholder: #737373;
      --sf-button-bg: #ffffff;
      --sf-button-text: #000000;
      --sf-button-hover: #e5e5e5;
      --sf-icon-border: #404040;
      --sf-icon-border-hover: #ffffff;
      --sf-font-heading: inherit;
      --sf-font-body: inherit;
      --sf-max-width: 1152px;
      --sf-columns: repeat(2, minmax(0, 1fr));
    }

    * { box-sizing: border-box; }

    .footer {
      background: var(--sf-bg);
      color: var(--sf-fg);
      font-family: var(--sf-font-body);
    }

    .inner {
      max-width: var(--sf-max-width);
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr;
    }

    .section {
      padding: 2rem;
      border-bottom: 1px solid var(--sf-border);
    }
    .section:last-child { border-bottom: none; }

    @media (min-width: 768px) {
      .inner { grid-template-columns: 1fr 1.6fr 1fr; }
      .section { border-bottom: none; border-right: 1px solid var(--sf-border); }
      .section:last-child { border-right: none; }
    }

    .logo-link { display: inline-block; margin-bottom: 0.75rem; }
    .logo-link img { display: block; max-height: 40px; width: auto; }
    .logo-text {
      font-family: var(--sf-font-heading);
      font-size: 1.125rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      margin: 0 0 0.75rem;
      color: var(--sf-fg);
    }
    .about {
      font-size: 0.875rem;
      line-height: 1.6;
      color: var(--sf-muted);
      margin: 0;
    }

    .columns {
      display: grid;
      gap: 2rem;
      grid-template-columns: var(--sf-columns);
    }
    .col-heading {
      font-family: var(--sf-font-heading);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin: 0 0 0.75rem;
      color: var(--sf-fg);
    }
    .col-links { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6rem; }
    .col-links a {
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      text-decoration: none;
      color: var(--sf-link);
      transition: color 0.15s ease;
    }
    .col-links a:hover { color: var(--sf-link-hover); }

    .connect-heading {
      font-family: var(--sf-font-heading);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin: 0 0 0.4rem;
      color: var(--sf-fg);
    }
    .connect-text { font-size: 0.875rem; color: var(--sf-muted); margin: 0 0 1rem; }

    .newsletter { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .newsletter[hidden] { display: none; }
    .newsletter input[type="email"] {
      flex: 1;
      min-width: 0;
      font-size: 0.875rem;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      border: 1px solid var(--sf-input-border);
      background: var(--sf-input-bg);
      color: var(--sf-input-text);
      font-family: var(--sf-font-body);
    }
    .newsletter input[type="email"]::placeholder { color: var(--sf-input-placeholder); }
    .newsletter input[type="email"]:focus { outline: 2px solid var(--sf-link-hover); outline-offset: 1px; }
    .newsletter button {
      flex-shrink: 0;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      background: var(--sf-button-bg);
      color: var(--sf-button-text);
      transition: background 0.15s ease;
      font-family: var(--sf-font-body);
    }
    .newsletter button:hover { background: var(--sf-button-hover); }

    .socials { display: flex; gap: 0.75rem; }
    .socials a {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      border: 1px solid var(--sf-icon-border);
      color: var(--sf-fg);
      transition: border-color 0.15s ease;
    }
    .socials a:hover { border-color: var(--sf-icon-border-hover); }
    .socials svg { width: 16px; height: 16px; }
    .socials .text-fallback { width: auto; height: auto; padding: 0 10px; border-radius: 999px; font-size: 11px; text-transform: uppercase; }
  </style>

  <div class="footer">
    <div class="inner">
      <div class="section left">
        <a class="logo-link" href="/"><img alt="" hidden /></a>
        <p class="logo-text" hidden></p>
        <p class="about"></p>
      </div>
      <div class="section middle">
        <div class="columns"></div>
      </div>
      <div class="section right">
        <p class="connect-heading"></p>
        <p class="connect-text"></p>
        <form class="newsletter" hidden>
          <input type="email" required />
          <button type="submit"></button>
        </form>
        <div class="socials"></div>
      </div>
    </div>
  </div>
`;

class SimpleFooter extends HTMLElement {
  static get observedAttributes() {
    return [
      "logo-src",
      "logo-alt",
      "logo-href",
      "about-text",
      "columns",
      "connect-heading",
      "connect-text",
      "social",
      "newsletter",
      "newsletter-placeholder",
      "newsletter-button-text",
      "newsletter-endpoint",
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(FOOTER_TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this._render();
    this._bindNewsletter();
  }

  attributeChangedCallback() {
    if (this.isConnected) this._render();
  }

  // "LABEL|url,LABEL|url" -> [{a: LABEL, b: url}, ...]
  // same pair format nav-fade uses for links/social, kept consistent
  _parsePairs(attrName) {
    return (this.getAttribute(attrName) || "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [a, b] = entry.split("|").map((s) => s.trim());
        return { a, b };
      });
  }

  // "Heading:Label|url,Label|url;Heading2:Label|url" -> [{heading, links:[{a,b}]}]
  _parseColumns() {
    return (this.getAttribute("columns") || "")
      .split(";")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [heading, rest] = entry.split(":");
        const links = (rest || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((pair) => {
            const [a, b] = pair.split("|").map((s) => s.trim());
            return { a, b };
          });
        return { heading: (heading || "").trim(), links };
      });
  }

  _render() {
    const root = this.shadowRoot;

    // Left: logo + about
    const logoLink = root.querySelector(".logo-link");
    const logoImg = root.querySelector(".logo-link img");
    const logoText = root.querySelector(".logo-text");
    const logoSrc = this.getAttribute("logo-src");
    logoLink.href = this.getAttribute("logo-href") || "/";
    if (logoSrc) {
      logoImg.src = logoSrc;
      logoImg.alt = this.getAttribute("logo-alt") || "";
      logoImg.hidden = false;
      logoText.hidden = true;
    } else {
      logoImg.hidden = true;
      logoText.hidden = false;
      logoText.textContent = this.getAttribute("logo-alt") || "YOUR LOGO";
    }
    root.querySelector(".about").textContent = this.getAttribute("about-text") || "";

    // Middle: link columns
    const columnsWrap = root.querySelector(".columns");
    const columns = this._parseColumns();
    this.style.setProperty(
      "--sf-columns",
      `repeat(${Math.max(columns.length, 1)}, minmax(0, 1fr))`
    );
    columnsWrap.innerHTML = columns
      .map((col) => {
        const links = col.links
          .map((l) => `<a href="${this._escapeAttr(l.b)}">${this._escapeText(l.a)}</a>`)
          .join("");
        return `
          <div class="col">
            <p class="col-heading">${this._escapeText(col.heading)}</p>
            <div class="col-links">${links}</div>
          </div>
        `;
      })
      .join("");

    // Right: stay connected
    root.querySelector(".connect-heading").textContent =
      this.getAttribute("connect-heading") || "Stay connected";
    root.querySelector(".connect-text").textContent =
      this.getAttribute("connect-text") || "";

    const form = root.querySelector(".newsletter");
    const showNewsletter = this.getAttribute("newsletter") === "true";
    form.hidden = !showNewsletter;
    form.querySelector("input").placeholder =
      this.getAttribute("newsletter-placeholder") || "your email address";
    form.querySelector("button").textContent =
      this.getAttribute("newsletter-button-text") || "Join";

    const socialWrap = root.querySelector(".socials");
    const social = this._parsePairs("social");
    socialWrap.innerHTML = social
      .map((s) => {
        const type = (s.a || "").toLowerCase();
        const icon = FOOTER_ICONS[type];
        const label = s.a || "link";
        if (icon) {
          return `<a href="${this._escapeAttr(s.b)}" aria-label="${this._escapeAttr(label)}" target="_blank" rel="noopener">${icon}</a>`;
        }
        return `<a class="text-fallback" href="${this._escapeAttr(s.b)}" target="_blank" rel="noopener">${this._escapeText(label)}</a>`;
      })
      .join("");
  }

  _bindNewsletter() {
    const form = this.shadowRoot.querySelector(".newsletter");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      const button = form.querySelector("button");
      const email = input.value;
      const endpoint = this.getAttribute("newsletter-endpoint");

      // Site-specific code can listen for this instead of editing the component
      this.dispatchEvent(
        new CustomEvent("newsletter-submit", { detail: { email }, bubbles: true })
      );

      if (endpoint) {
        try {
          await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
        } catch (err) {
          console.error("simple-footer: newsletter submit failed", err);
        }
      }

      const original = button.textContent;
      button.textContent = "Joined";
      input.value = "";
      setTimeout(() => { button.textContent = original; }, 2500);
    });
  }

  _escapeText(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  _escapeAttr(str) {
    return (str || "").replace(/"/g, "&quot;");
  }
}

customElements.define("simple-footer", SimpleFooter);

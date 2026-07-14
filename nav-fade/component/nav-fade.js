// nav-fade — site header web component
// Logo on the left, nav links centered, social icons on the right.
// Background fades to transparent at the bottom so it can sit over a hero image.
// On mobile, nav links collapse into a hamburger menu.
//
// Usage:
// <nav-fade
//   logo-src="logo.png"
//   logo-alt="Armageddon Records"
//   logo-href="/"
//   links="ARTISTS|/artists,RELEASES|/releases,STORE|/store"
//   social="instagram|https://instagram.com/yourhandle,email|mailto:you@example.com"
// ></nav-fade>

const ICONS = {
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H17V3.6C16.7 3.55 15.7 3.5 14.5 3.5c-2.5 0-4.2 1.5-4.2 4.3v2.1H7.6V13h2.7v8h3.2z"/></svg>`,
  twitter: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3l7.5 9.6L3.4 21h2.3l6-6.9 4.7 6.9H21l-7.8-10L20.4 3h-2.3l-5.6 6.4L7.5 3H3z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2.5" y="5.5" width="19" height="13" rx="3"/><path d="M10.5 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.5 3c.3 2 1.7 3.5 3.8 3.7v2.6c-1.3 0-2.6-.4-3.8-1.1v6.4c0 3-2.4 5.4-5.4 5.4S3.7 17.6 3.7 14.6 6.1 9.2 9.1 9.2c.3 0 .6 0 .9.1v2.7c-.3-.1-.6-.2-.9-.2-1.6 0-2.9 1.3-2.9 2.9s1.3 2.9 2.9 2.9 2.9-1.3 2.9-2.9V3h2.5z"/></svg>`,
  bandcamp: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.5L9.5 6h11L14 17.5H3z"/></svg>`,
  spotify: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M7 10.5c3-.7 7-.4 9.5 1M7.3 13.3c2.5-.5 5.8-.3 7.9.9M7.6 16c2-.4 4.6-.2 6.2.7" stroke="#0a0a0a" stroke-width="1.3" fill="none" stroke-linecap="round"/></svg>`,
  email: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M3 6.5l9 6.5 9-6.5"/></svg>`,
};

const template = document.createElement("template");
template.innerHTML = `
<style>
  :host {
    --nav-bg-start: #0a0a0a;
    --nav-bg-end: transparent;
    --nav-fg: #ffffff;
    --nav-font-family: 'Helvetica Neue', Arial, sans-serif;
    --nav-font-weight: 700;
    --nav-font-size: 12px;
    --nav-letter-spacing: 0.08em;
    --nav-link-gap: 32px;
    --nav-social-gap: 16px;
    --nav-icon-size: 18px;
    --nav-logo-height: 40px;
    --nav-padding-y: 18px;
    --nav-padding-x: 24px;
    --nav-fade-height: 0px;
    --nav-mobile-breakpoint: 720px;

    position: relative;
    display: block;
    font-family: var(--nav-font-family);
    background: var(--nav-bg-start);
  }

  * { box-sizing: border-box; }

  .bar {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 20px;
    padding: var(--nav-padding-y) var(--nav-padding-x);
  }

  .logo-link {
    display: inline-flex;
    align-items: center;
    justify-self: start;
  }

  .logo-link img {
    height: var(--nav-logo-height);
    width: auto;
    display: block;
  }

  .links {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--nav-link-gap);
    flex-wrap: wrap;
    justify-self: center;
  }

  .links a {
    color: var(--nav-fg);
    text-decoration: none;
    font-size: var(--nav-font-size);
    font-weight: var(--nav-font-weight);
    letter-spacing: var(--nav-letter-spacing);
    text-transform: uppercase;
    white-space: nowrap;
  }

  .links a:hover { opacity: 0.7; }

  .social {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--nav-social-gap);
    justify-self: end;
  }

  .social a {
    color: var(--nav-fg);
    display: inline-flex;
    width: var(--nav-icon-size);
    height: var(--nav-icon-size);
    opacity: 0.9;
  }

  .social a:hover { opacity: 1; }
  .social svg { width: 100%; height: 100%; }

  .social a.text-fallback {
    width: auto;
    height: auto;
    font-size: var(--nav-font-size);
    letter-spacing: var(--nav-letter-spacing);
    text-transform: uppercase;
  }

  /* Hamburger button — hidden on desktop by default */
  .hamburger {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    justify-self: start;
    flex-direction: column;
    gap: 5px;
  }

  .hamburger span {
    display: block;
    width: 24px;
    height: 2px;
    background: var(--nav-fg);
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .hamburger.open span:nth-child(2) { opacity: 0; }
  .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  /* Mobile dropdown panel — hidden until opened */
  .mobile-menu {
    display: none;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 20px 24px 28px;
    background: var(--nav-bg-start);
  }

  .mobile-menu.open {
    display: flex;
  }

  .mobile-menu a {
    color: var(--nav-fg);
    text-decoration: none;
    font-size: 14px;
    font-weight: var(--nav-font-weight);
    letter-spacing: var(--nav-letter-spacing);
    text-transform: uppercase;
  }

  .mobile-menu a:hover { opacity: 0.7; }

  .mobile-menu .social {
    justify-content: center;
    margin-top: 4px;
  }

  /* soft gradient trailing off below the bar, for overlaying on a hero image */
  .fade-tail {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    height: var(--nav-fade-height);
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent);
    pointer-events: none;
  }

 @media (max-width: 720px) {
    .bar {
      grid-template-columns: auto 1fr auto;
    }

    .logo-link {
      grid-column: 1;
    }

    .links {
      display: none;
    }

    .bar .social {
      display: none;
    }

    .hamburger {
      display: flex;
      grid-column: 3;
      justify-self: end;
    }
  }
</style>

<div class="bar">
  <a class="logo-link" href="#"><img alt="" /></a>
  <button class="hamburger" aria-label="Toggle menu" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
  <nav class="links"></nav>
  <div class="social"></div>
</div>
<nav class="mobile-menu"></nav>
<div class="fade-tail"></div>
`;

class NavFade extends HTMLElement {
  static get observedAttributes() {
    return ["logo-src", "logo-alt", "logo-href", "links", "social"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.render();
    this.setupHamburger();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  // turns "label|url,label|url" into [{ label, url }]
  parsePairs(attrName) {
    return (this.getAttribute(attrName) || "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [label, url] = entry.split("|").map((s) => s.trim());
        return { label, url };
      });
  }

  render() {
    const root = this.shadowRoot;

    // logo
    const logoLink = root.querySelector(".logo-link");
    const logoImg = root.querySelector(".logo-link img");
    logoLink.href = this.getAttribute("logo-href") || "/";
    logoImg.src = this.getAttribute("logo-src") || "";
    logoImg.alt = this.getAttribute("logo-alt") || "";

    const links = this.parsePairs("links");
    const social = this.parsePairs("social");

    // desktop nav links
    const linksEl = root.querySelector(".links");
    linksEl.innerHTML = links
      .map(({ label, url }) => `<a href="${this.escapeAttr(url)}">${this.escapeText(label)}</a>`)
      .join("");

    // desktop social icons
    const socialEl = root.querySelector(".bar .social");
    socialEl.innerHTML = this.buildSocialHtml(social);

    // mobile dropdown — links + social combined
    const mobileMenu = root.querySelector(".mobile-menu");
    const mobileLinksHtml = links
      .map(({ label, url }) => `<a href="${this.escapeAttr(url)}">${this.escapeText(label)}</a>`)
      .join("");
    const mobileSocialHtml = `<div class="social">${this.buildSocialHtml(social)}</div>`;
    mobileMenu.innerHTML = mobileLinksHtml + mobileSocialHtml;

    // clicking a link in the mobile menu should close it
    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => this.closeMenu());
    });
  }

  buildSocialHtml(social) {
    return social
      .map(({ label: type, url }) => {
        const icon = ICONS[(type || "").toLowerCase()];
        if (icon) {
          return `<a href="${this.escapeAttr(url)}" aria-label="${this.escapeAttr(type)}" target="_blank" rel="noopener">${icon}</a>`;
        }
        return `<a class="text-fallback" href="${this.escapeAttr(url)}" target="_blank" rel="noopener">${this.escapeText(type || "link")}</a>`;
      })
      .join("");
  }

  setupHamburger() {
    const root = this.shadowRoot;
    const hamburger = root.querySelector(".hamburger");
    const mobileMenu = root.querySelector(".mobile-menu");

    hamburger.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("open");
      hamburger.classList.toggle("open", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });
  }

  closeMenu() {
    const root = this.shadowRoot;
    root.querySelector(".mobile-menu").classList.remove("open");
    root.querySelector(".hamburger").classList.remove("open");
    root.querySelector(".hamburger").setAttribute("aria-expanded", "false");
  }

  escapeText(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  escapeAttr(str) {
    return (str || "").replace(/"/g, "&quot;");
  }
}

customElements.define("nav-fade", NavFade);

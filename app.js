/* themeInit — landing page behaviour
 *
 * Single responsibility: wire DOM to data. The only mutable state is the
 * theme payload, held in a closure with a cached promise so concurrent
 * callers share one request and no load order is required.
 *
 * There is deliberately no framework, no bundler and no global namespace.
 */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- theme ---------- */

  // themeInit.json is the single source of truth for every color on the page.
  let pending;
  const loadTheme = () => (pending ??= fetch('themeInit.json').then(r => r.json()));

  const THEME_KEY = 'themeInit:theme';
  const readTheme = () => document.documentElement.dataset.theme;
  const isDay = () => readTheme() === 'day';

  async function applyTheme() {
    const data = await loadTheme();

    // Select by the theme's own declared `type`, so palette keys are never
    // hardcoded here — adding a third theme to the JSON needs no JS change.
    const want = isDay() ? 'light' : 'dark';
    const [, theme] =
      Object.entries(data.themes).find(([, t]) => t.type === want) ?? [];

    if (!theme) return;

    // Inject the whole palette; the stylesheet owns no color literals.
    for (const [token, value] of Object.entries(theme.colors)) {
      document.documentElement.style.setProperty(`--${token}`, value);
    }

    renderMeta(data);
    renderPalette(theme.colors);
    // The whole file, not just `themes` — this is the same payload the
    // download button hands over, so the view can't misdescribe it.
    renderJson(data);
    syncToggle();
  }

  function renderMeta(data) {
    const el = $('#hero-meta');
    if (!el) return;
    const count = Object.keys(data.themes).length;
    el.textContent = `v${data.version} · ${count} themes`;
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* private mode: theme just won't persist */
    }
    applyTheme();
  }

  function syncToggle() {
    const btn = $('#themeToggle');
    if (!btn) return;
    const next = isDay() ? 'night' : 'day';
    btn.setAttribute('aria-label', `Switch to ${next} theme`);
    btn.setAttribute('aria-pressed', String(isDay()));
  }

  /* ---------- palette ---------- */

  // The one place human labels for color tokens are defined.
  const LABELS = {
    bg: 'Background',
    surface: 'Surface',
    border: 'Border',
    borderStrong: 'Border Strong',
    textPrimary: 'Text Primary',
    textSecondary: 'Text Secondary',
    textMuted: 'Text Muted',
    kwd: 'Keyword',
    fnc: 'Function',
    typ: 'Type',
    str: 'String',
    num: 'Number',
    opr: 'Operator',
  };

  // Small helper: build an element with a class, text and optional attributes.
  // Used instead of innerHTML wherever the content is data rather than markup.
  const el = (tag, className, text, attrs) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    for (const [k, v] of Object.entries(attrs ?? {})) node.setAttribute(k, v);
    return node;
  };

  function renderPalette(colors) {
    const grid = $('#palette-grid');
    if (!grid) return;

    grid.replaceChildren(
      ...Object.entries(colors).map(([token, hex]) => {
        const name = LABELS[token] ?? token;
        const chip = el('span', 'swatch-chip');
        // Assigned as a property, not interpolated into markup.
        chip.style.background = hex;

        const top = el('span', 'swatch-top');
        top.append(chip, el('span', 'swatch-hex', hex));

        const btn = el('button', 'swatch', null, {
          type: 'button',
          // The swatch *is* the color, so its accessible name carries the pair.
          'aria-label': `Copy ${name} ${hex}`,
        });
        btn.dataset.hex = hex;
        // The tile tints its own border from its own token, so the grid reads as
        // the palette instead of a lattice of identical grey boxes. Set as a
        // custom property, so the value still comes from themeInit.json only.
        btn.style.setProperty('--swatch', hex);
        btn.append(top, el('span', 'swatch-name', name));
        return btn;
      })
    );
  }

  /* ---------- JSON view ---------- */

  const escapeHtml = (s) =>
    s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

  // Matches a JSON string (optionally followed by its key colon), a literal,
  // or a number. Everything else — braces, colons, commas, whitespace — is
  // left unstyled, so it inherits the block's base color.
  const TOKEN = /("(?:\\.|[^\\"])*")(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?/g;

  // Renders whatever object it is handed. It does not know what themeInit is,
  // so the display cannot fall out of sync with the file it claims to show.
  function highlight(json) {
    return escapeHtml(JSON.stringify(json, null, 2)).replace(
      TOKEN,
      (match, str, colon, offset, whole) => {
        if (str !== undefined) {
          const cls = colon ? 'j-key' : 'j-str';
          return `<span class="${cls}">${str}</span>${colon ?? ''}`;
        }
        if (/^(?:true|false|null)$/.test(match)) {
          return `<span class="j-lit">${match}</span>`;
        }
        return `<span class="j-num">${match}</span>`;
      }
    );
  }

  function renderJson(themes) {
    const el = $('#json-view');
    if (el) el.innerHTML = highlight(themes);
  }

  /* ---------- copy ---------- */

  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 1600);
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast(`Copied ${text}`);
    } catch {
      toast('Copy failed');
    }
  }

  async function download() {
    try {
      const data = await loadTheme();
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      );
      const a = Object.assign(document.createElement('a'), {
        href: url,
        download: 'themeInit.json',
      });
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast('Download failed');
    }
  }

  /* ---------- signature ---------- */

  // The wordmark, read as the call it is: a namespace, a function, punctuation.
  // It is tokenized and colored with the same t-* classes as the code samples,
  // so the signature is output *from* this theme rather than decoration that
  // imitates it. One string feeds every occurrence.
  const SIGNATURE = 'theme.Init();';

  // string | number | identifier | punctuation run | whitespace
  const JS_TOKEN =
    /"(?:\\.|[^\\"])*"|'(?:\\.|[^\\'])*'|\b\d+(?:\.\d+)?\b|[A-Za-z_$][\w$]*|[^\w\s]+|\s+/g;

  function tokenizeJs(src) {
    let out = '';
    for (const m of src.matchAll(JS_TOKEN)) {
      const token = m[0];
      let cls = '';
      if (/^[A-Za-z_$]/.test(token)) {
        // An identifier applied as a call is a function; otherwise a namespace.
        cls = /^\s*\(/.test(src.slice(m.index + token.length)) ? 't-fnc' : 't-typ';
      } else if (/^[^\w\s]/.test(token)) {
        cls = 't-opr';
      }
      out += cls ? `<span class="${cls}">${escapeHtml(token)}</span>` : escapeHtml(token);
    }
    return out;
  }

  function renderSignature() {
    // Markup carries the plain text already, so a no-JS visitor still sees the
    // wordmark — this only upgrades it to syntax.
    for (const node of $$('[data-signature]')) {
      node.innerHTML = tokenizeJs(SIGNATURE);
    }
  }

  /* ---------- ports ---------- */

  // ports.json is community-contributed via pull request, so its fields are
  // untrusted input: build with DOM APIs, never innerHTML, and refuse any
  // scheme other than http(s) so a `javascript:` href cannot be smuggled in.
  const SAFE_URL = /^https?:\/\//i;

  const portCard = ({ name, platform, url, status }) => {
    const a = el('a', 'port', null, {
      rel: 'noopener noreferrer',
      target: '_blank',
    });

    if (typeof url === 'string' && SAFE_URL.test(url.trim())) {
      a.href = url.trim();
    } else {
      a.setAttribute('aria-disabled', 'true');
      a.removeAttribute('target');
    }

    const info = el('span');
    info.append(
      el('span', 'port-name', name ?? ''),
      el('br'),
      el('span', 'port-platform', platform ?? '')
    );
    a.append(info, el('span', 'pill', status ?? '', { 'data-status': status ?? '' }));
    return a;
  };

  function fillPorts(ports, into, empty) {
    into.replaceChildren(
      ...(Array.isArray(ports) && ports.length
        ? ports.map(portCard)
        : [el('p', 'port-platform', empty)])
    );
  }

  async function renderPorts() {
    const official = $('#official-ports');
    const community = $('#community-ports');
    if (!official || !community) return;

    try {
      const { official: o = [], community: c = [] } = await (await fetch('ports.json')).json();
      fillPorts(o, official, 'No official ports yet.');
      fillPorts(c, community, 'No community ports yet — be the first!');
    } catch {
      fillPorts([], official, 'Could not load ports.');
      fillPorts([], community, 'Could not load ports.');
    }
  }

  /* ---------- tabs ---------- */

  function initTabs() {
    const tabs = $$('.tab');
    if (!tabs.length) return;

    const select = (tab, focus = true) => {
      for (const t of tabs) {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      }
      if (focus) tab.focus();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab, false));
      tab.addEventListener('keydown', (e) => {
        const delta = { ArrowRight: 1, ArrowLeft: -1, Home: -Infinity, End: Infinity }[e.key];
        if (delta === undefined) return;
        e.preventDefault();
        const next = delta === -Infinity ? 0
          : delta === Infinity ? tabs.length - 1
          : (i + delta + tabs.length) % tabs.length;
        select(tabs[next]);
      });
    });
  }

  /* ---------- nav, drawer, scrollspy ---------- */

  function initNav() {
    const nav = $('#nav');
    const burger = $('#burger');
    const drawer = $('#drawer');

    const setStuck = () => nav.classList.toggle('is-stuck', window.scrollY > 8);
    setStuck();
    addEventListener('scroll', setStuck, { passive: true });

    const setOpen = (open) => {
      drawer.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) drawer.querySelector('a')?.focus();
      else burger.focus();
    };

    burger.addEventListener('click', () =>
      setOpen(burger.getAttribute('aria-expanded') !== 'true')
    );
    drawer.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) setOpen(false);
    });
  }

  function initScrollSpy() {
    const links = $$('.nav-links a');
    // Purely decorative: skip it where the API is unavailable.
    if (!links.length || typeof IntersectionObserver === 'undefined') return;

    const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const seen = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          if (!isIntersecting) continue;
          for (const a of links) a.removeAttribute('aria-current');
          byId.get(target.id)?.setAttribute('aria-current', 'true');
        }
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    for (const id of byId.keys()) {
      const el = document.getElementById(id);
      if (el) seen.observe(el);
    }
  }

  /* ---------- wire up ---------- */

  function init() {
    renderSignature();
    $('#themeToggle')?.addEventListener('click', () => setTheme(isDay() ? 'night' : 'day'));
    $('#download')?.addEventListener('click', download);

    $('#palette-grid')?.addEventListener('click', (e) => {
      const swatch = e.target.closest('.swatch');
      if (swatch) copy(swatch.dataset.hex);
    });

    initTabs();
    initNav();
    initScrollSpy();
    applyTheme();
    renderPorts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

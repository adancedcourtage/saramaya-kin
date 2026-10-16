/**
 * "Mon panier": a lightweight, payment-free basket stored in localStorage.
 * It turns the chosen products into a single pre-filled WhatsApp message.
 */
interface Item { slug: string; name: string; price: number; image: string; soldOut: boolean }
interface Data { items: Item[]; config: { whatsapp: string; name: string; discount: { minItems: number; percent: number } } }

const KEY = 'saramaya-selection';
const fmt = (c: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(c / 100);

type Selection = Record<string, number>;

function read(): Selection {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  } catch { return {}; }
}

/** Keeps only known, available products with whole quantities between 1 and 20. */
function sanitize(sel: Selection, items: Item[]): Selection {
  const clean: Selection = {};
  for (const [slug, qty] of Object.entries(sel)) {
    const item = items.find((i) => i.slug === slug);
    const n = Math.floor(Number(qty));
    if (item && !item.soldOut && Number.isFinite(n) && n >= 1) clean[slug] = Math.min(20, n);
  }
  return clean;
}
function write(sel: Selection) {
  try { localStorage.setItem(KEY, JSON.stringify(sel)); } catch { /* storage unavailable: keep in memory */ }
}

export function computeTotals(sel: Selection, items: Item[], discount: Data['config']['discount']) {
  const lines = Object.entries(sel)
    .map(([slug, qty]) => ({ item: items.find((i) => i.slug === slug), qty }))
    .filter((l): l is { item: Item; qty: number } => !!l.item && !l.item.soldOut && l.qty > 0);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.item.price * l.qty, 0);
  const off = count >= discount.minItems ? Math.round((subtotal * discount.percent) / 100) : 0;
  return { lines, count, subtotal, off, total: subtotal - off };
}

export function buildMessage(sel: Selection, data: Data) {
  const t = computeTotals(sel, data.items, data.config.discount);
  const rows = t.lines.map((l) => `• ${l.qty} × ${l.item.name} (${fmt(l.item.price)})`);
  const text = [
    `Bonjour ${data.config.name}, je souhaite commander :`,
    ...rows,
    '',
    `Sous-total : ${fmt(t.subtotal)}`,
    ...(t.off ? [`Remise ${data.config.discount.percent} % : -${fmt(t.off)}`] : []),
    `Total estimé : ${fmt(t.total)} (hors livraison)`,
    '',
    'Prénom et ville de livraison : ',
  ].join('\n');
  return `https://wa.me/${data.config.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function initWishlist() {
  const dataEl = document.getElementById('catalog-data');
  const dialog = document.querySelector<HTMLDialogElement>('[data-wishlist]');
  if (!dataEl || !dialog) return;
  const data: Data = JSON.parse(dataEl.textContent || '{}');
  const stored = read();
  let sel = sanitize(stored, data.items);
  const removed = Object.keys(stored).length - Object.keys(sel).length;
  if (removed > 0) write(sel);

  const $ = <T extends HTMLElement>(s: string) => dialog.querySelector<T>(s)!;
  const list = $('[data-wishlist-list]');
  const empty = $('[data-wishlist-empty]');
  const foot = $('[data-wishlist-foot]');
  const send = $<HTMLAnchorElement>('[data-wishlist-send]');
  const toast = document.querySelector<HTMLElement>('[data-toast]');
  let toastTimer: number | undefined;

  function notify(msg: string) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  function render() {
    const t = computeTotals(sel, data.items, data.config.discount);
    document.querySelectorAll<HTMLElement>('[data-wishlist-count]').forEach((c) => {
      c.textContent = String(t.count);
      c.setAttribute('aria-label', `${t.count} produit${t.count > 1 ? 's' : ''}`);
    });
    empty.hidden = t.count > 0;
    foot.hidden = t.count === 0;
    list.innerHTML = t.lines.map(({ item, qty }) => `
      <li>
        <img src="${item.image}" alt="" width="72" height="72" loading="lazy" />
        <div><p class="d-name">${item.name}</p><p class="d-price">${fmt(item.price)}</p></div>
        <div class="d-qty">
          <button type="button" data-dec="${item.slug}" aria-label="Retirer un ${item.name}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 11h16v2H4z"/></svg></button>
          <output aria-label="Quantité">${qty}</output>
          <button type="button" data-inc="${item.slug}" aria-label="Ajouter un ${item.name}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4Z"/></svg></button>
        </div>
      </li>`).join('');
    $('[data-wishlist-subtotal]').textContent = fmt(t.subtotal);
    $('[data-wishlist-discount-row]').hidden = !t.off;
    $('[data-wishlist-discount]').textContent = `-${fmt(t.off)}`;
    $('[data-wishlist-total]').textContent = fmt(t.total);
    const missing = data.config.discount.minItems - t.count;
    $('[data-wishlist-hint]').textContent = missing > 0
      ? `Encore ${missing} produit${missing > 1 ? 's' : ''} pour profiter de -${data.config.discount.percent} %.`
      : `Remise de ${data.config.discount.percent} % appliquée.`;
    send.href = buildMessage(sel, data);
  }

  /** After a re-render, put focus back on the same control, or on the next sensible one if the line is gone. */
  function refocus(selector: string) {
    const el = list.querySelector<HTMLElement>(selector)
      ?? list.querySelector<HTMLElement>('[data-dec]')
      ?? dialog.querySelector<HTMLElement>('[data-wishlist-close]');
    el?.focus();
  }

  function change(slug: string, delta: number) {
    const item = data.items.find((i) => i.slug === slug);
    if (!item || (item.soldOut && delta > 0)) return;
    const qty = Math.max(0, Math.min(20, (sel[slug] || 0) + delta));
    if (qty) sel[slug] = qty; else delete sel[slug];
    write(sel);
    render();
    if (delta > 0) {
      document.querySelectorAll('[data-wishlist-count]').forEach((c) => {
        c.classList.remove('is-bump'); void (c as HTMLElement).offsetWidth; c.classList.add('is-bump');
      });
    }
    return item;
  }

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const add = target.closest<HTMLElement>('[data-add]');
    if (add) {
      const item = change(add.dataset.add!, 1);
      if (item) {
        notify(`${item.name} ajouté au panier`);
        add.classList.add('is-added');
        setTimeout(() => add.classList.remove('is-added'), 1400);
      }
      return;
    }
    const inc = target.closest<HTMLElement>('[data-inc]');
    if (inc) { change(inc.dataset.inc!, 1); return refocus(`[data-inc="${inc.dataset.inc}"]`); }
    const dec = target.closest<HTMLElement>('[data-dec]');
    if (dec) { change(dec.dataset.dec!, -1); return refocus(`[data-dec="${dec.dataset.dec}"]`); }
    if (target.closest('[data-wishlist-open]')) {
      dialog.showModal();
      return;
    }
    if (target.closest('[data-wishlist-close]') || target === dialog) dialog.close();
    if (target.closest('[data-wishlist-clear]')) { sel = {}; write(sel); render(); }
  });

  dialog.addEventListener('close', () => document.documentElement.style.removeProperty('overflow'));
  dialog.addEventListener('toggle', () => { if (dialog.open) document.documentElement.style.overflow = 'hidden'; });

  addEventListener('storage', (e) => { if (e.key === KEY) { sel = sanitize(read(), data.items); render(); } });
  render();
  if (removed > 0) notify('Des produits qui ne sont plus disponibles ont été retirés de votre panier.');
}
